import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { enrichGroceryProduct, asNumber, asString } from "../mappers";
import { resolveProductImageUrl } from "../image-urls";
import { getApifyToken } from "../credentials";
import { fetchWithTimeout, APIFY_TIMEOUT_MS } from "../http-headers";
import { nameSimilarity, normalizeProductName } from "../normalizer";
import { mockGroceryProvider } from "./mock-grocery.provider";

/**
 * Unofficial Apify ALDI Australia provider.
 *
 * Preferred: cached dataset items via APIFY_DATASET_ID + APIFY_API_TOKEN
 * (or ALDI_CACHE_URL). Falls back to live Actor runs when only a token is set.
 *
 * Docs: https://docs.apify.com/academy/api/run-actor-and-retrieve-data-via-api
 */
export class AldiApifyProvider implements GroceryProvider {
  readonly id = "aldi-apify";
  readonly displayName = "ALDI (Apify — unofficial)";
  readonly official = false;

  private get token(): string | undefined {
    return getApifyToken();
  }

  private get actorId(): string {
    const raw =
      process.env.APIFY_ACTOR_ID || "solidcode/aldi-com-au-scraper";
    return raw.replace("/", "~");
  }

  private get datasetId(): string | undefined {
    return process.env.APIFY_DATASET_ID || process.env.ALDI_DATASET_ID || undefined;
  }

  /** Optional full JSON/items URL (may include ?token=). */
  private get cacheUrl(): string | undefined {
    return process.env.ALDI_CACHE_URL || undefined;
  }

  isConfigured(): boolean {
    return Boolean(this.token || this.cacheUrl || this.datasetId);
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    if (!this.isConfigured()) {
      return (await mockGroceryProvider.searchProducts(query)).filter(
        (p) => p.store === "aldi"
      );
    }
    const q = query.trim();
    if (!q) return [];

    const datasetUrl = this.resolveDatasetUrl();
    if (datasetUrl) {
      try {
        const cached = await this.fetchDataset(datasetUrl);
        const matched = filterByQuery(cached, q);
        if (matched.length > 0) return matched;
      } catch (err) {
        console.error("ALDI Apify dataset fetch failed:", err);
        if (!this.token) {
          return (await mockGroceryProvider.searchProducts(q)).filter(
            (p) => p.store === "aldi"
          );
        }
      }
    }

    if (!this.token) {
      return (await mockGroceryProvider.searchProducts(q)).filter(
        (p) => p.store === "aldi"
      );
    }

    try {
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
      if (!Array.isArray(items)) {
        return (await mockGroceryProvider.searchProducts(q)).filter(
          (p) => p.store === "aldi"
        );
      }

      const mapped = items
        .filter(
          (x): x is Record<string, unknown> => !!x && typeof x === "object"
        )
        .map((row) => this.mapItem(row));
      if (mapped.length > 0) return mapped;
    } catch (err) {
      console.warn(
        `ALDI live search skipped: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    return (await mockGroceryProvider.searchProducts(q)).filter(
      (p) => p.store === "aldi"
    );
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    const results = await this.searchProducts(barcode);
    return (
      results.find((p) => p.barcode === barcode.trim() || p.id.includes(barcode.trim())) ??
      null
    );
  }

  private resolveDatasetUrl(): string | undefined {
    if (this.cacheUrl) return this.cacheUrl;
    if (this.datasetId && this.token) {
      const params = new URLSearchParams({
        token: this.token,
        format: "json",
        clean: "true",
        limit: "1000",
      });
      return `https://api.apify.com/v2/datasets/${this.datasetId}/items?${params}`;
    }
    if (this.datasetId) {
      // Dataset id alone — caller must have set a public/signed ALDI_CACHE_URL instead.
      return undefined;
    }
    return undefined;
  }

  private async fetchDataset(url: string): Promise<GroceryProduct[]> {
    const res = await fetchWithTimeout(
      url,
      { next: { revalidate: 3600 } },
      APIFY_TIMEOUT_MS
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
    return rows
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((row) => this.mapItem(row));
  }

  mapItem(row: Record<string, unknown>): GroceryProduct {
    const name =
      asString(row.name) ??
      asString(row.title) ??
      asString(row.productName) ??
      "ALDI product";

    const pricing = extractAldiPricing(row);
    const sku = asString(row.sku) ?? asString(row.id);
    const slug = asString(row.url_slug_text);
    const barcode = asString(row.barcode) ?? asString(row.ean) ?? sku;
    const imageUrl =
      resolveAldiAssetImage(row) ??
      resolveProductImageUrl({ store: "aldi", row, barcode: barcode ?? undefined });

    const isOnSpecial =
      Boolean(row.onSpecial) ||
      Boolean(row.isSpecial) ||
      Boolean(row.specialBuy) ||
      Boolean(pricing.savingsDisplay) ||
      (pricing.regularPrice != null &&
        pricing.currentPrice != null &&
        pricing.regularPrice > pricing.currentPrice);

    const productUrl =
      asString(row.url) ??
      asString(row.productUrl) ??
      (slug ? `https://www.aldi.com.au/product/${slug}` : undefined);

    return enrichGroceryProduct({
      id: `aldi-${sku ?? name}-${pricing.currentPrice ?? 0}`,
      name,
      brand: asString(row.brand_name) ?? asString(row.brand),
      barcode: barcode ?? undefined,
      store: "aldi",
      currentPrice: pricing.currentPrice,
      regularPrice: pricing.regularPrice,
      unitPrice: pricing.unitPrice,
      unitLabel: pricing.unitLabel,
      size:
        asString(row.selling_size) ??
        asString(row.size) ??
        asString(row.packSize) ??
        asString(row.pack_size),
      imageUrl,
      productUrl,
      isOnSpecial,
      catalogueExpiresAt:
        asString(row.on_sale_date_display) ??
        asString(row.specialBuyEndDate) ??
        asString(row.catalogueEndDate) ??
        asString(row.onSaleUntil),
      lastUpdated: new Date().toISOString(),
      dataSource: this.resolveDatasetUrl() ? "cached" : "live-api",
      providerId: this.id,
      raw: row,
    });
  }
}

/** Parse ALDI Apify ItemModel price object (amounts in cents) or flat fields. */
export function extractAldiPricing(row: Record<string, unknown>): {
  currentPrice?: number;
  regularPrice?: number;
  unitPrice?: number;
  unitLabel?: string;
  savingsDisplay?: string;
} {
  const nested = row.price;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const p = nested as Record<string, unknown>;
    const cents =
      asNumber(p.amount_relevant) ?? asNumber(p.amount) ?? undefined;
    const comparisonCents = asNumber(p.comparison);
    const wasDisplay = asString(p.was_price_display);
    return {
      currentPrice: cents != null ? cents / 100 : undefined,
      regularPrice: wasDisplay ? parseMoneyDisplay(wasDisplay) : undefined,
      unitPrice: comparisonCents != null ? comparisonCents / 100 : undefined,
      unitLabel: unitLabelFromComparison(asString(p.comparison_display)),
      savingsDisplay: asString(p.savings_display) ?? undefined,
    };
  }

  return {
    currentPrice:
      asNumber(row.price) ??
      asNumber(row.currentPrice) ??
      asNumber(row.salePrice),
    regularPrice:
      asNumber(row.wasPrice) ??
      asNumber(row.was_price) ??
      asNumber(row.regularPrice),
    unitPrice: asNumber(row.unitPrice) ?? asNumber(row.pricePerUnit),
    unitLabel: asString(row.unitPriceText) ?? asString(row.unitLabel),
  };
}

export function resolveAldiAssetImage(
  row: Record<string, unknown>
): string | undefined {
  const assets = row.assets;
  if (!Array.isArray(assets) || assets.length === 0) return undefined;
  const first = assets[0];
  if (!first || typeof first !== "object") return undefined;
  const template = asString((first as Record<string, unknown>).url);
  if (!template) return undefined;
  const slug = asString(row.url_slug_text) ?? "product";
  return template.replaceAll("{width}", "400").replaceAll("{slug}", slug);
}

function parseMoneyDisplay(value: string): number | undefined {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/** " $5.99 per 1 kg" → "$/kg" style label for unit price pills */
function unitLabelFromComparison(display?: string): string | undefined {
  if (!display) return undefined;
  const lower = display.toLowerCase();
  if (lower.includes("100g")) return "$/100g";
  if (lower.includes("100ml") || lower.includes("100 ml")) return "$/100mL";
  if (lower.includes("1 kg") || lower.includes("/kg")) return "$/kg";
  if (lower.includes("1 l") || lower.includes("/l")) return "$/L";
  const per = display.match(/per\s+(.+)$/i);
  return per ? `$/${per[1].trim()}` : display;
}

function filterByQuery(products: GroceryProduct[], q: string): GroceryProduct[] {
  const needle = normalizeProductName(q);
  if (!needle) return [];
  const tokens = needle.split(/\s+/).filter((t) => t.length > 2);

  const scored = products
    .map((p) => {
      const hay = normalizeProductName(
        `${p.name} ${p.brand ?? ""} ${p.barcode ?? ""}`
      );
      let score = 0;
      if (hay.includes(needle) || needle.includes(hay)) score = 90;
      else {
        const hits = tokens.filter((t) => hay.includes(t)).length;
        score = hits * 35;
        score += nameSimilarity(q, p.name) * 40;
      }
      return { p, score };
    })
    .filter((x) => x.score >= 35)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.p);
}

export const aldiApifyProvider = new AldiApifyProvider();
