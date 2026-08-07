import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { enrichGroceryProduct, asNumber, asString } from "../mappers";
import { resolveProductImageUrl } from "../image-urls";

/**
 * Unofficial Apify ALDI Australia Actor provider.
 * Prefer weekly refresh over per-keystroke scraping.
 * Default Actor: solidcode/aldi-com-au-scraper (configurable via APIFY_ACTOR_ID)
 * Docs: https://docs.apify.com/academy/api/run-actor-and-retrieve-data-via-api
 */
export class AldiApifyProvider implements GroceryProvider {
  readonly id = "aldi-apify";
  readonly displayName = "ALDI (Apify — unofficial)";
  readonly official = false;

  private get token(): string | undefined {
    return process.env.APIFY_API_TOKEN || undefined;
  }

  private get actorId(): string {
    const raw =
      process.env.APIFY_ACTOR_ID || "solidcode/aldi-com-au-scraper";
    return raw.replace("/", "~");
  }

  /** Optional pre-scraped JSON cache URL for weekly catalogue (preferred over live Actor runs). */
  private get cacheUrl(): string | undefined {
    return process.env.ALDI_CACHE_URL || undefined;
  }

  isConfigured(): boolean {
    return Boolean(this.token || this.cacheUrl);
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    if (!this.isConfigured()) return [];
    const q = query.trim();
    if (!q) return [];

    if (this.cacheUrl) {
      try {
        const cached = await this.fetchCache();
        return filterByQuery(cached, q);
      } catch (err) {
        console.error("ALDI cache fetch failed:", err);
        if (!this.token) return [];
      }
    }

    if (!this.token) return [];

    const url = `https://api.apify.com/v2/acts/${this.actorId}/run-sync-get-dataset-items?token=${encodeURIComponent(this.token)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchTerms: [q],
        maxResults: 25,
        sortBy: "relevance",
      }),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Apify ALDI run failed (${res.status})`);
    }

    const items = (await res.json()) as unknown;
    if (!Array.isArray(items)) return [];

    return items
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((row) => this.mapItem(row));
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    const results = await this.searchProducts(barcode);
    return results.find((p) => p.barcode === barcode.trim()) ?? null;
  }

  private async fetchCache(): Promise<GroceryProduct[]> {
    const res = await fetch(this.cacheUrl!, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`ALDI cache HTTP ${res.status}`);
    const body = (await res.json()) as unknown;
    const rows = Array.isArray(body)
      ? body
      : Array.isArray((body as { items?: unknown }).items)
        ? (body as { items: unknown[] }).items
        : [];
    return rows
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((row) => this.mapItem(row));
  }

  private mapItem(row: Record<string, unknown>): GroceryProduct {
    const name =
      asString(row.name) ??
      asString(row.title) ??
      asString(row.productName) ??
      "ALDI product";
    const currentPrice =
      asNumber(row.price) ??
      asNumber(row.currentPrice) ??
      asNumber(row.salePrice);
    const regularPrice =
      asNumber(row.wasPrice) ??
      asNumber(row.was_price) ??
      asNumber(row.regularPrice);
    const barcode = asString(row.barcode) ?? asString(row.ean);
    const isOnSpecial =
      Boolean(row.onSpecial) ||
      Boolean(row.isSpecial) ||
      Boolean(row.specialBuy) ||
      (regularPrice != null &&
        currentPrice != null &&
        regularPrice > currentPrice);

    return enrichGroceryProduct({
      id: `aldi-${asString(row.id) ?? asString(row.url) ?? name}-${currentPrice ?? 0}`,
      name,
      brand: asString(row.brand),
      barcode,
      store: "aldi",
      currentPrice,
      regularPrice,
      unitPrice: asNumber(row.unitPrice) ?? asNumber(row.pricePerUnit),
      unitLabel: asString(row.unitPriceText) ?? asString(row.unitLabel),
      size: asString(row.size) ?? asString(row.packSize) ?? asString(row.pack_size),
      imageUrl: resolveProductImageUrl({ store: "aldi", row, barcode }),
      productUrl: asString(row.url) ?? asString(row.productUrl),
      isOnSpecial,
      catalogueExpiresAt:
        asString(row.specialBuyEndDate) ??
        asString(row.catalogueEndDate) ??
        asString(row.onSaleUntil),
      lastUpdated: new Date().toISOString(),
      dataSource: this.cacheUrl && !this.token ? "cached" : "live-api",
      providerId: this.id,
      raw: row,
    });
  }
}

function filterByQuery(products: GroceryProduct[], q: string): GroceryProduct[] {
  const needle = q.toLowerCase();
  return products.filter((p) => {
    const hay = `${p.name} ${p.brand ?? ""} ${p.barcode ?? ""}`.toLowerCase();
    return (
      hay.includes(needle) ||
      needle.split(/\s+/).some((w) => w.length > 2 && hay.includes(w))
    );
  });
}

export const aldiApifyProvider = new AldiApifyProvider();
