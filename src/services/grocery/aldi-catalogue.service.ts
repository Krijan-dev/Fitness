import { connectMongo } from "@/lib/mongodb";
import { GroceryProductModel } from "@/models/GroceryProduct";
import { PriceHistoryModel } from "@/models/PriceHistory";
import { GrocerySyncMetaModel } from "@/models/GrocerySyncMeta";
import type { GroceryProduct } from "@/types/grocery";
import {
  getApifyDatasetId,
  getApifyToken,
} from "./credentials";
import { fetchWithTimeout, APIFY_TIMEOUT_MS } from "./http-headers";
import { normalizeProductName, nextWednesdayDate } from "./normalizer";
import {
  filterAldiProductsByQuery,
  mapAldiApifyItem,
} from "./aldi-mapper";

const ALDI_META_KEY = "aldi";
const PAGE_SIZE = 1000;
const MEMORY_TTL_MS = 60 * 60 * 1000;

/** In-process catalogue for fast search after Mongo load. */
let memoryCatalogue: GroceryProduct[] | null = null;
let memoryLoadedAt = 0;

/** Single-flight sync so concurrent searches don't each hit Apify. */
let inflightSync: Promise<AldiCatalogueSyncResult> | null = null;

export interface AldiCatalogueSyncResult {
  status: "ok" | "skipped" | "error";
  message?: string;
  productCount: number;
  fetchedFromApify: boolean;
  lastSyncedAt: string | null;
  nextWednesdayRefreshAt: string;
}

export interface AldiCatalogueStatus {
  productCount: number;
  lastSyncedAt: string | null;
  nextWednesdayRefreshAt: string;
  isDue: boolean;
  memoryCached: boolean;
}

function cacheUrl(): string | undefined {
  return process.env.ALDI_CACHE_URL || undefined;
}

function actorId(): string {
  const raw = process.env.APIFY_ACTOR_ID || "solidcode/aldi-com-au-scraper";
  return raw.replace("/", "~");
}

export function isAldiCatalogueConfigured(): boolean {
  return Boolean(getApifyToken() || cacheUrl() || getApifyDatasetId());
}

export async function getAldiCatalogueStatus(): Promise<AldiCatalogueStatus> {
  await connectMongo();
  const [productCount, meta] = await Promise.all([
    GroceryProductModel.countDocuments({ store: "aldi" }),
    GrocerySyncMetaModel.findOne({ key: ALDI_META_KEY }).lean(),
  ]);
  const next = meta?.nextWednesdayRefreshAt
    ? new Date(meta.nextWednesdayRefreshAt)
    : nextWednesdayDate(meta?.lastSyncedAt ? new Date(meta.lastSyncedAt) : new Date());

  return {
    productCount,
    lastSyncedAt: meta?.lastSyncedAt
      ? new Date(meta.lastSyncedAt).toISOString()
      : null,
    nextWednesdayRefreshAt: next.toISOString(),
    isDue: isAldiSyncDue(meta),
    memoryCached: Boolean(memoryCatalogue && memoryCatalogue.length > 0),
  };
}

function isAldiSyncDue(
  meta: {
    lastSyncedAt?: Date | null;
    nextWednesdayRefreshAt?: Date | null;
  } | null
): boolean {
  if (!meta?.lastSyncedAt) return true;
  if (meta.nextWednesdayRefreshAt) {
    return new Date() >= new Date(meta.nextWednesdayRefreshAt);
  }
  return true;
}

/**
 * Sync the full ALDI catalogue from Apify into Mongo.
 * Skips when still fresh until next Wednesday unless `force` is set.
 * Never used for per-keystroke search — only weekly / admin / first-fill.
 */
export async function syncAldiCatalogueFromApify(options?: {
  force?: boolean;
  triggeredBy?: string;
}): Promise<AldiCatalogueSyncResult> {
  if (inflightSync) return inflightSync;

  inflightSync = (async () => {
    try {
      return await runAldiCatalogueSync(options);
    } finally {
      inflightSync = null;
    }
  })();

  return inflightSync;
}

async function runAldiCatalogueSync(options?: {
  force?: boolean;
  triggeredBy?: string;
}): Promise<AldiCatalogueSyncResult> {
  await connectMongo();
  const meta = await GrocerySyncMetaModel.findOne({ key: ALDI_META_KEY }).lean();
  const existingCount = await GroceryProductModel.countDocuments({ store: "aldi" });
  const nextWedPreview = meta?.nextWednesdayRefreshAt
    ? new Date(meta.nextWednesdayRefreshAt)
    : nextWednesdayDate(meta?.lastSyncedAt ? new Date(meta.lastSyncedAt) : new Date());

  if (!options?.force && existingCount > 0 && !isAldiSyncDue(meta)) {
    return {
      status: "skipped",
      message: `ALDI catalogue still fresh until ${nextWedPreview.toISOString()} (${existingCount} products)`,
      productCount: existingCount,
      fetchedFromApify: false,
      lastSyncedAt: meta?.lastSyncedAt
        ? new Date(meta.lastSyncedAt).toISOString()
        : null,
      nextWednesdayRefreshAt: nextWedPreview.toISOString(),
    };
  }

  if (!isAldiCatalogueConfigured()) {
    return {
      status: "skipped",
      message: "APIFY_API_TOKEN + APIFY_DATASET_ID (or ALDI_CACHE_URL) not configured",
      productCount: existingCount,
      fetchedFromApify: false,
      lastSyncedAt: meta?.lastSyncedAt
        ? new Date(meta.lastSyncedAt).toISOString()
        : null,
      nextWednesdayRefreshAt: nextWedPreview.toISOString(),
    };
  }

  try {
    const products = await fetchFullAldiCatalogueFromApify();
    if (products.length === 0) {
      return {
        status: "error",
        message: "Apify returned 0 ALDI products",
        productCount: existingCount,
        fetchedFromApify: true,
        lastSyncedAt: meta?.lastSyncedAt
          ? new Date(meta.lastSyncedAt).toISOString()
          : null,
        nextWednesdayRefreshAt: nextWedPreview.toISOString(),
      };
    }

    const upserted = await persistAldiProducts(products);
    invalidateAldiMemoryCache();

    const now = new Date();
    const nextWed = nextWednesdayDate(now);
    await GrocerySyncMetaModel.findOneAndUpdate(
      { key: ALDI_META_KEY },
      {
        $set: {
          lastSyncedAt: now,
          nextWednesdayRefreshAt: nextWed,
          lastRefreshTriggeredBy: options?.triggeredBy ?? "system",
          providers: [
            {
              name: "ALDI catalogue",
              status: "ok",
              message: `Synced ${upserted} products from Apify`,
              productCount: upserted,
            },
          ],
          seedQueries: [],
        },
      },
      { upsert: true, new: true }
    );

    return {
      status: "ok",
      message: `Stored ${upserted} ALDI products (searches use Mongo only until next Wednesday)`,
      productCount: upserted,
      fetchedFromApify: true,
      lastSyncedAt: now.toISOString(),
      nextWednesdayRefreshAt: nextWed.toISOString(),
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "ALDI catalogue sync failed",
      productCount: existingCount,
      fetchedFromApify: true,
      lastSyncedAt: meta?.lastSyncedAt
        ? new Date(meta.lastSyncedAt).toISOString()
        : null,
      nextWednesdayRefreshAt: nextWedPreview.toISOString(),
    };
  }
}

/**
 * If Mongo has no ALDI rows, sync once from Apify (single-flight).
 * Does not re-sync when catalogue already exists — weekly refresh handles that.
 */
export async function ensureAldiCatalogueLoaded(): Promise<void> {
  if (!process.env.MONGODB_URI || !isAldiCatalogueConfigured()) return;
  try {
    await connectMongo();
    const count = await GroceryProductModel.countDocuments({ store: "aldi" });
    if (count > 0) return;
    await syncAldiCatalogueFromApify({ triggeredBy: "ensure-empty" });
  } catch (err) {
    console.error("ALDI ensure catalogue failed:", err);
  }
}

/**
 * Search ALDI from Mongo / memory only — never calls Apify.
 */
export async function searchAldiCatalogue(query: string): Promise<GroceryProduct[]> {
  const q = query.trim();
  if (!q) return [];

  await ensureAldiCatalogueLoaded();
  // If Wednesday refresh is due, kick one background sync (does not block search)
  scheduleAldiWednesdayRefreshIfDue();

  const fromMemory = await loadAldiMemoryCatalogue();
  if (fromMemory.length > 0) {
    return filterAldiProductsByQuery(fromMemory, q).slice(0, 40);
  }

  // Memory empty (no Mongo) — soft fallback empty; provider may use mock
  return [];
}

/** Non-blocking: refresh catalogue once when past nextWednesdayRefreshAt. */
function scheduleAldiWednesdayRefreshIfDue(): void {
  if (!process.env.MONGODB_URI || !isAldiCatalogueConfigured()) return;
  if (inflightSync) return;
  void (async () => {
    try {
      await connectMongo();
      const meta = await GrocerySyncMetaModel.findOne({ key: ALDI_META_KEY }).lean();
      if (!isAldiSyncDue(meta)) return;
      await syncAldiCatalogueFromApify({ triggeredBy: "wednesday-due" });
    } catch (err) {
      console.error("ALDI Wednesday background refresh failed:", err);
    }
  })();
}

export async function findAldiByBarcode(barcode: string): Promise<GroceryProduct | null> {
  const code = barcode.trim();
  if (!code) return null;

  await ensureAldiCatalogueLoaded();

  if (process.env.MONGODB_URI) {
    try {
      await connectMongo();
      const doc = await GroceryProductModel.findOne({
        store: "aldi",
        barcode: code,
      }).lean();
      if (doc) return docToProduct(doc);
    } catch (err) {
      console.error("ALDI barcode Mongo lookup failed:", err);
    }
  }

  const fromMemory = await loadAldiMemoryCatalogue();
  return (
    fromMemory.find((p) => p.barcode === code || p.id.includes(code)) ?? null
  );
}

export function invalidateAldiMemoryCache(): void {
  memoryCatalogue = null;
  memoryLoadedAt = 0;
}

async function loadAldiMemoryCatalogue(): Promise<GroceryProduct[]> {
  if (
    memoryCatalogue &&
    Date.now() - memoryLoadedAt < MEMORY_TTL_MS
  ) {
    return memoryCatalogue;
  }

  if (!process.env.MONGODB_URI) {
    memoryCatalogue = [];
    memoryLoadedAt = Date.now();
    return memoryCatalogue;
  }

  try {
    await connectMongo();
    const docs = await GroceryProductModel.find({ store: "aldi" }).lean();
    memoryCatalogue = docs.map(docToProduct);
    memoryLoadedAt = Date.now();
    return memoryCatalogue;
  } catch (err) {
    console.error("ALDI memory catalogue load failed:", err);
    return memoryCatalogue ?? [];
  }
}

function docToProduct(doc: {
  _id: { toString(): string };
  externalId?: string;
  name: string;
  brand?: string | null;
  barcode?: string | null;
  currentPrice?: number | null;
  regularPrice?: number | null;
  unitPrice?: number | null;
  unitLabel?: string | null;
  size?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
  isOnSpecial?: boolean | null;
  discountPercentage?: number | null;
  catalogueExpiresAt?: Date | null;
  lastSyncedAt?: Date | null;
  normalizedName?: string | null;
  quantityGrams?: number | null;
  quantityMl?: number | null;
  providerId?: string | null;
}): GroceryProduct {
  return {
    id: doc.externalId || String(doc._id),
    name: doc.name,
    brand: doc.brand ?? undefined,
    barcode: doc.barcode ?? undefined,
    store: "aldi",
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
    normalizedName: doc.normalizedName ?? undefined,
    quantityGrams: doc.quantityGrams ?? undefined,
    quantityMl: doc.quantityMl ?? undefined,
    providerId: doc.providerId ?? "aldi-apify",
  };
}

/**
 * Pull the full catalogue from Apify dataset (paginated) or one weekly Actor run.
 * Dataset item reads are cheap; Actor run is only when no dataset/cache URL is set.
 */
async function fetchFullAldiCatalogueFromApify(): Promise<GroceryProduct[]> {
  const token = getApifyToken();
  const datasetId = getApifyDatasetId();
  const url = cacheUrl();

  if (url) {
    return fetchAllFromUrl(url);
  }

  if (datasetId && token) {
    return fetchAllFromDataset(datasetId, token);
  }

  if (token) {
    // Last resort: one Actor run for a broad seed set (weekly only — not per search)
    return fetchViaWeeklyActorRun(token);
  }

  throw new Error("No Apify credentials for ALDI catalogue sync");
}

async function fetchAllFromDataset(
  datasetId: string,
  token: string
): Promise<GroceryProduct[]> {
  const all: GroceryProduct[] = [];
  let offset = 0;

  for (;;) {
    const params = new URLSearchParams({
      token,
      format: "json",
      clean: "true",
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    const pageUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?${params}`;
    const rows = await fetchJsonRows(pageUrl);
    if (rows.length === 0) break;

    for (const row of rows) {
      all.push(mapAldiApifyItem(row));
    }

    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return dedupeByExternalId(all);
}

async function fetchAllFromUrl(baseUrl: string): Promise<GroceryProduct[]> {
  // If URL already has pagination, fetch once; else paginate with offset
  const hasLimit = /[?&]limit=/i.test(baseUrl);
  if (hasLimit) {
    const rows = await fetchJsonRows(baseUrl);
    return dedupeByExternalId(rows.map((r) => mapAldiApifyItem(r)));
  }

  const all: GroceryProduct[] = [];
  let offset = 0;
  const join = baseUrl.includes("?") ? "&" : "?";

  for (;;) {
    const pageUrl = `${baseUrl}${join}format=json&clean=true&limit=${PAGE_SIZE}&offset=${offset}`;
    const rows = await fetchJsonRows(pageUrl);
    if (rows.length === 0) break;
    for (const row of rows) {
      all.push(mapAldiApifyItem(row));
    }
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return dedupeByExternalId(all);
}

/**
 * Broad weekly Actor scrape when only a token is configured (no dataset id).
 * Uses several seed terms in ONE run to avoid per-search credit burn.
 */
async function fetchViaWeeklyActorRun(
  token: string
): Promise<GroceryProduct[]> {
  const url = `https://api.apify.com/v2/acts/${actorId()}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      searchTerms: [
        "milk",
        "bread",
        "eggs",
        "chicken",
        "rice",
        "pasta",
        "fruit",
        "vegetables",
        "cheese",
        "yoghurt",
        "coffee",
        "chocolate",
        "laundry",
        "toilet paper",
        "oil",
      ],
      maxResults: 100,
      sortBy: "relevance",
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Apify ALDI weekly Actor run failed (${res.status})`);
  }

  const items = (await res.json()) as unknown;
  if (!Array.isArray(items)) return [];

  return dedupeByExternalId(
    items
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((row) => mapAldiApifyItem(row))
  );
}

async function fetchJsonRows(url: string): Promise<Record<string, unknown>[]> {
  const res = await fetchWithTimeout(
    url,
    { next: { revalidate: 0 } },
    Math.max(APIFY_TIMEOUT_MS, 60_000)
  );
  if (!res.ok) throw new Error(`ALDI dataset HTTP ${res.status}`);
  const body = (await res.json()) as unknown;
  const rows = Array.isArray(body)
    ? body
    : Array.isArray((body as { items?: unknown }).items)
      ? (body as { items: unknown[] }).items
      : Array.isArray((body as { data?: unknown }).data)
        ? (body as { data: unknown[] }).data
        : [];
  return rows.filter(
    (x): x is Record<string, unknown> => !!x && typeof x === "object"
  );
}

async function persistAldiProducts(products: GroceryProduct[]): Promise<number> {
  const now = new Date();
  const ops = products
    .filter((p) => p.currentPrice != null)
    .map((product) => {
      const externalId = product.id;
      const normalizedName =
        product.normalizedName || normalizeProductName(product.name);
      return {
        updateOne: {
          filter: { externalId, store: "aldi" as const },
          update: {
            $set: {
              externalId,
              name: product.name,
              normalizedName,
              brand: product.brand,
              barcode: product.barcode,
              store: "aldi" as const,
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
              dataSource: "cached" as const,
              providerId: product.providerId ?? "aldi-apify",
              lastSyncedAt: now,
            },
          },
          upsert: true,
        },
      };
    });

  if (ops.length === 0) return 0;

  // Chunk bulk writes
  const CHUNK = 500;
  for (let i = 0; i < ops.length; i += CHUNK) {
    await GroceryProductModel.bulkWrite(ops.slice(i, i + CHUNK), {
      ordered: false,
    });
  }

  // Price history only for a sample of changed/specials to avoid huge writes
  const historyCandidates = products
    .filter((p) => p.currentPrice != null && (p.isOnSpecial || Math.random() < 0.05))
    .slice(0, 200);

  for (const product of historyCandidates) {
    const doc = await GroceryProductModel.findOne({
      externalId: product.id,
      store: "aldi",
    })
      .select("_id")
      .lean();
    if (!doc || product.currentPrice == null) continue;
    await PriceHistoryModel.create({
      groceryProductId: doc._id,
      store: "aldi",
      externalId: product.id,
      productName: product.name,
      price: product.currentPrice,
      regularPrice: product.regularPrice,
      unitPrice: product.unitPrice,
      isOnSpecial: product.isOnSpecial ?? false,
      capturedAt: now,
    });
  }

  return ops.length;
}

function dedupeByExternalId(products: GroceryProduct[]): GroceryProduct[] {
  const seen = new Set<string>();
  const out: GroceryProduct[] = [];
  for (const p of products) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

export { filterAldiProductsByQuery };
