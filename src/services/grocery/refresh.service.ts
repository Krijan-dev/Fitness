import { connectMongo } from "@/lib/mongodb";
import { GroceryProductModel } from "@/models/GroceryProduct";
import { PriceHistoryModel } from "@/models/PriceHistory";
import { GrocerySyncMetaModel } from "@/models/GrocerySyncMeta";
import {
  woolworthsProvider,
  colesProvider,
  aldiApifyProvider,
  mockGroceryProvider,
} from "./providers";
import { syncAldiCatalogueFromApify } from "./aldi-catalogue.service";
import { normalizeProductName, nextWednesdayDate } from "./normalizer";
import type { GroceryProduct } from "@/types/grocery";
import type { GrocerySyncStatus } from "@/types/grocery";

const DEFAULT_SEED_QUERIES = [
  "milk",
  "eggs",
  "bread",
  "chicken breast",
  "rice",
  "bananas",
  "greek yoghurt",
  "olive oil",
  "pasta",
  "mince",
];

export async function getGrocerySyncStatus(): Promise<GrocerySyncStatus> {
  await connectMongo();
  const meta = await GrocerySyncMetaModel.findOne({ key: "global" }).lean();
  const next = nextWednesdayDate(
    meta?.lastSyncedAt ? new Date(meta.lastSyncedAt) : new Date()
  );

  return {
    lastSyncedAt: meta?.lastSyncedAt
      ? new Date(meta.lastSyncedAt).toISOString()
      : null,
    nextWednesdayRefreshAt: meta?.nextWednesdayRefreshAt
      ? new Date(meta.nextWednesdayRefreshAt).toISOString()
      : next.toISOString(),
    providers: (meta?.providers ?? []).map((p) => ({
      name: p.name,
      status: p.status as "ok" | "skipped" | "error",
      message: p.message ?? undefined,
      productCount: p.productCount ?? undefined,
    })),
  };
}

export async function runWeeklyGroceryRefresh(options?: {
  queries?: string[];
  triggeredBy?: string;
  /** Force ALDI Apify re-download even if catalogue is still fresh */
  forceAldi?: boolean;
}): Promise<GrocerySyncStatus> {
  await connectMongo();

  const queries = options?.queries?.length
    ? options.queries
    : DEFAULT_SEED_QUERIES;

  const providerResults: GrocerySyncStatus["providers"] = [];
  const allProducts: GroceryProduct[] = [];
  let aldiSyncCount = 0;

  const runners: {
    name: string;
    configured: boolean;
    run: () => Promise<GroceryProduct[]>;
  }[] = [
    {
      name: woolworthsProvider.displayName,
      configured: woolworthsProvider.isConfigured(),
      run: async () => {
        const out: GroceryProduct[] = [];
        for (const q of queries) {
          out.push(...(await woolworthsProvider.searchProducts(q)));
        }
        return out;
      },
    },
    {
      name: colesProvider.displayName,
      configured: colesProvider.isConfigured(),
      run: async () => {
        const out: GroceryProduct[] = [];
        for (const q of queries) {
          out.push(...(await colesProvider.searchProducts(q)));
        }
        return out;
      },
    },
  ];

  for (const runner of runners) {
    if (!runner.configured) {
      providerResults.push({
        name: runner.name,
        status: "skipped",
        message: "API key not configured",
        productCount: 0,
      });
      continue;
    }
    try {
      const products = await runner.run();
      allProducts.push(...products);
      providerResults.push({
        name: runner.name,
        status: "ok",
        productCount: products.length,
      });
    } catch (err) {
      providerResults.push({
        name: runner.name,
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
        productCount: 0,
      });
    }
  }

  // ALDI: one full catalogue sync into Mongo (not per seed query / not per search)
  if (aldiApifyProvider.isConfigured()) {
    try {
      const sync = await syncAldiCatalogueFromApify({
        force: options?.forceAldi ?? true,
        triggeredBy: options?.triggeredBy ?? "weekly-refresh",
      });
      aldiSyncCount = sync.productCount;
      providerResults.push({
        name: aldiApifyProvider.displayName,
        status:
          sync.status === "error"
            ? "error"
            : sync.status === "skipped"
              ? "skipped"
              : "ok",
        message: sync.message,
        productCount: sync.productCount,
      });
    } catch (err) {
      providerResults.push({
        name: aldiApifyProvider.displayName,
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
        productCount: 0,
      });
    }
  } else {
    providerResults.push({
      name: aldiApifyProvider.displayName,
      status: "skipped",
      message: "APIFY_API_TOKEN + APIFY_DATASET_ID not configured",
      productCount: 0,
    });
  }

  // Always seed mock snapshot so admin has data without live keys
  if (allProducts.length === 0 && aldiSyncCount === 0) {
    for (const q of queries) {
      allProducts.push(...(await mockGroceryProvider.searchProducts(q)));
    }
    providerResults.push({
      name: mockGroceryProvider.displayName,
      status: "ok",
      message: "Seeded from mock dataset (no live keys or empty live results)",
      productCount: allProducts.length,
    });
  }

  const now = new Date();
  let upserted = 0;

  for (const product of allProducts) {
    if (product.currentPrice == null) continue;
    const externalId = product.id;
    const normalizedName =
      product.normalizedName || normalizeProductName(product.name);

    const doc = await GroceryProductModel.findOneAndUpdate(
      { externalId, store: product.store },
      {
        $set: {
          externalId,
          name: product.name,
          normalizedName,
          brand: product.brand,
          barcode: product.barcode,
          store: product.store,
          currentPrice: product.currentPrice,
          regularPrice: product.regularPrice,
          unitPrice: product.unitPrice,
          unitLabel: product.unitLabel,
          size: product.size,
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          isOnSpecial: product.isOnSpecial ?? false,
          discountPercentage: product.discountPercentage,
          catalogueExpiresAt: product.catalogueExpiresAt
            ? new Date(product.catalogueExpiresAt)
            : undefined,
          quantityGrams: product.quantityGrams,
          quantityMl: product.quantityMl,
          dataSource: product.dataSource === "mock" ? "mock" : "cached",
          providerId: product.providerId,
          lastSyncedAt: now,
        },
      },
      { upsert: true, new: true }
    );

    await PriceHistoryModel.create({
      groceryProductId: doc._id,
      store: product.store,
      externalId,
      productName: product.name,
      price: product.currentPrice,
      regularPrice: product.regularPrice,
      unitPrice: product.unitPrice,
      isOnSpecial: product.isOnSpecial ?? false,
      capturedAt: now,
    });

    upserted += 1;
  }

  const nextWed = nextWednesdayDate(now);

  await GrocerySyncMetaModel.findOneAndUpdate(
    { key: "global" },
    {
      $set: {
        lastSyncedAt: now,
        nextWednesdayRefreshAt: nextWed,
        lastRefreshTriggeredBy: options?.triggeredBy ?? "system",
        providers: providerResults,
        seedQueries: queries,
      },
    },
    { upsert: true, new: true }
  );

  return {
    lastSyncedAt: now.toISOString(),
    nextWednesdayRefreshAt: nextWed.toISOString(),
    providers: providerResults.map((p) => ({
      ...p,
      productCount: p.name.includes("Mock") ? upserted : p.productCount,
    })),
  };
}

export { DEFAULT_SEED_QUERIES };
