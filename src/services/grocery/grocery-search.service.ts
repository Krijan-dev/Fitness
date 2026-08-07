import type { GroceryProduct } from "@/types/grocery";
import type { StoreProductPrice } from "@/types/price";
import {
  woolworthsProvider,
  colesProvider,
  aldiApifyProvider,
  openFoodFactsProvider,
  mockGroceryProvider,
  type GroceryProvider,
} from "./providers";
import { toStoreProductPrice } from "./mappers";
import { isLikelySameProduct, nameSimilarity } from "./normalizer";
import { connectMongo } from "@/lib/mongodb";
import { GroceryProductModel } from "@/models/GroceryProduct";

function livePriceProviders(): GroceryProvider[] {
  return [woolworthsProvider, colesProvider, aldiApifyProvider];
}

function shouldUseMockFallback(): boolean {
  const mode = process.env.PRICE_PROVIDER_MODE || "auto";
  if (mode === "mock") return true;
  if (mode === "live") return false;
  // auto: mock when no supermarket keys configured
  return !(
    process.env.WOOLWORTHS_API_KEY ||
    process.env.COLES_API_KEY ||
    process.env.APIFY_API_TOKEN
  );
}

/**
 * Search across live providers + mock fallback, optionally enriching from Mongo cache.
 */
export async function searchGroceryProducts(
  query: string
): Promise<{ products: GroceryProduct[]; source: string }> {
  const q = query.trim();
  if (!q) return { products: [], source: "empty" };

  if (shouldUseMockFallback()) {
    const products = await mockGroceryProvider.searchProducts(q);
    return { products, source: "mock" };
  }

  const results: GroceryProduct[] = [];
  const sources: string[] = [];

  // Prefer Mongo cache for soft matches
  try {
    await connectMongo();
    const cached = await GroceryProductModel.find({
      $or: [
        { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { normalizedName: { $regex: q.toLowerCase().replace(/\s+/g, ".*"), $options: "i" } },
        { barcode: q },
      ],
    })
      .limit(40)
      .lean();

    for (const doc of cached) {
      results.push({
        id: String(doc._id),
        name: doc.name,
        brand: doc.brand ?? undefined,
        barcode: doc.barcode ?? undefined,
        store: doc.store as GroceryProduct["store"],
        currentPrice: doc.currentPrice ?? undefined,
        regularPrice: doc.regularPrice ?? undefined,
        unitPrice: doc.unitPrice ?? undefined,
        unitLabel: doc.unitLabel ?? undefined,
        size: doc.size ?? undefined,
        imageUrl: doc.imageUrl ?? undefined,
        productUrl: doc.productUrl ?? undefined,
        isOnSpecial: doc.isOnSpecial ?? false,
        discountPercentage: doc.discountPercentage ?? undefined,
        catalogueExpiresAt: doc.catalogueExpiresAt
          ? new Date(doc.catalogueExpiresAt).toISOString()
          : undefined,
        lastUpdated: doc.lastSyncedAt
          ? new Date(doc.lastSyncedAt).toISOString()
          : new Date().toISOString(),
        dataSource: "cached",
        normalizedName: doc.normalizedName,
        quantityGrams: doc.quantityGrams ?? undefined,
        quantityMl: doc.quantityMl ?? undefined,
        providerId: doc.providerId ?? undefined,
      });
    }
    if (cached.length > 0) sources.push("cached");
  } catch (err) {
    console.error("Grocery cache lookup failed:", err);
  }

  await Promise.all(
    livePriceProviders().map(async (provider) => {
      try {
        const configured =
          "isConfigured" in provider &&
          typeof (provider as { isConfigured?: () => boolean }).isConfigured ===
            "function"
            ? (provider as { isConfigured: () => boolean }).isConfigured()
            : true;
        if (!configured) return;
        const products = await provider.searchProducts(q);
        results.push(...products);
        if (products.length) sources.push(provider.id);
      } catch (err) {
        console.error(`Provider ${provider.id} failed:`, err);
      }
    })
  );

  if (results.length === 0) {
    const products = await mockGroceryProvider.searchProducts(q);
    return { products, source: "mock-fallback" };
  }

  return { products: dedupeProducts(results), source: sources.join(",") || "live" };
}

export async function searchStorePrices(
  query: string,
  location: string
): Promise<{ data: StoreProductPrice[]; source: string }> {
  const { products, source } = await searchGroceryProducts(query);
  const prices = products
    .map((p) => toStoreProductPrice(p, query, location))
    .filter((p): p is StoreProductPrice => p != null)
    .sort((a, b) => a.currentPrice - b.currentPrice);

  return { data: prices, source };
}

export async function lookupBarcode(barcode: string): Promise<{
  metadata: GroceryProduct | null;
  storeMatches: GroceryProduct[];
  source: string;
}> {
  const code = barcode.trim();
  if (!code) {
    return { metadata: null, storeMatches: [], source: "empty" };
  }

  let metadata: GroceryProduct | null = null;
  try {
    metadata = await openFoodFactsProvider.getProductByBarcode(code);
  } catch (err) {
    console.error("Open Food Facts barcode lookup failed:", err);
  }

  const storeMatches: GroceryProduct[] = [];
  for (const provider of livePriceProviders()) {
    try {
      const configured =
        "isConfigured" in provider &&
        typeof (provider as { isConfigured?: () => boolean }).isConfigured ===
          "function"
          ? (provider as { isConfigured: () => boolean }).isConfigured()
          : true;
      if (!configured) continue;
      const hit = await provider.getProductByBarcode(code);
      if (hit) storeMatches.push(hit);
    } catch (err) {
      console.error(`Barcode via ${provider.id} failed:`, err);
    }
  }

  // Name-based matching against live/mock search using OFF product name
  if (metadata?.name && storeMatches.length === 0) {
    const { products } = await searchGroceryProducts(metadata.name);
    for (const p of products) {
      if (p.store === "open-food-facts") continue;
      if (isLikelySameProduct(metadata.name, p.name) || nameSimilarity(metadata.name, p.name) > 0.4) {
        storeMatches.push(p);
      }
    }
  }

  if (!metadata && storeMatches.length === 0 && shouldUseMockFallback()) {
    const mock = await mockGroceryProvider.getProductByBarcode(code);
    if (mock) {
      return { metadata: mock, storeMatches: [mock], source: "mock" };
    }
  }

  return {
    metadata,
    storeMatches: dedupeProducts(storeMatches),
    source: metadata || storeMatches.length ? "mixed" : "none",
  };
}

function dedupeProducts(products: GroceryProduct[]): GroceryProduct[] {
  const seen = new Set<string>();
  const out: GroceryProduct[] = [];
  for (const p of products) {
    const key = `${p.store}|${p.barcode ?? ""}|${p.normalizedName ?? p.name}|${p.currentPrice ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}
