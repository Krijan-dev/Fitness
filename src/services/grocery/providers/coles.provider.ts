import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { mapRapidResult, mockGroceryProvider } from "./mock-grocery.provider";
import { getColesApiKey } from "../credentials";
import {
  browserJsonHeaders,
  isForbiddenStatus,
  fetchWithTimeout,
  DIRECT_STORE_TIMEOUT_MS,
  RAPIDAPI_TIMEOUT_MS,
} from "../http-headers";
import { enrichGroceryProduct, asNumber, asString } from "../mappers";
import { resolveProductImageUrl } from "../image-urls";

/**
 * Coles provider (unofficial).
 * 1) Direct BFF search
 * 2) RapidAPI fallback on block / empty / timeout
 * 3) Mock fallback
 */
export class ColesProvider implements GroceryProvider {
  readonly id = "coles";
  readonly displayName = "Coles (direct + RapidAPI — unofficial)";
  readonly official = false;

  private get rapidApiKey(): string | undefined {
    return getColesApiKey();
  }

  private get rapidBaseUrl(): string {
    return (
      process.env.COLES_API_BASE_URL ||
      "https://coles-product-price-api.p.rapidapi.com"
    ).replace(/\/$/, "");
  }

  private get rapidHost(): string {
    return (
      process.env.COLES_API_HOST || "coles-product-price-api.p.rapidapi.com"
    );
  }

  isConfigured(): boolean {
    return process.env.PRICE_PROVIDER_MODE !== "mock";
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    const q = query.trim();
    if (!q) return [];
    if (!this.isConfigured()) {
      return (await mockGroceryProvider.searchProducts(q)).filter(
        (p) => p.store === "coles"
      );
    }

    try {
      const direct = await this.searchDirect(q);
      if (direct.length > 0) return direct;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Coles direct search skipped: ${message}`);
    }

    if (this.rapidApiKey) {
      try {
        return await this.searchRapidApi(q);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Coles RapidAPI search skipped: ${message}`);
      }
    }

    return (await mockGroceryProvider.searchProducts(q)).filter(
      (p) => p.store === "coles"
    );
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    const results = await this.searchProducts(barcode);
    return results.find((p) => p.barcode === barcode.trim()) ?? results[0] ?? null;
  }

  private async searchDirect(query: string): Promise<GroceryProduct[]> {
    const headers = browserJsonHeaders({
      referer: "https://www.coles.com.au/",
      origin: "https://www.coles.com.au",
    });

    const url = new URL("https://www.coles.com.au/api/bff/products/search");
    url.searchParams.set("searchTerm", query);
    url.searchParams.set("storeId", process.env.COLES_STORE_ID || "0584");
    url.searchParams.set("limit", "24");

    let res: Response;
    try {
      res = await fetchWithTimeout(
        url.toString(),
        { method: "GET", headers, next: { revalidate: 0 } },
        DIRECT_STORE_TIMEOUT_MS
      );
    } catch (err) {
      const aborted =
        err instanceof Error &&
        (err.name === "AbortError" || /aborted/i.test(err.message));
      throw new Error(
        aborted
          ? `timed out after ${DIRECT_STORE_TIMEOUT_MS}ms`
          : "network error"
      );
    }

    // Soft-fail blocked/empty responses — RapidAPI / mock handle fallback
    if (isForbiddenStatus(res.status) || !res.ok) {
      return [];
    }

    const body = (await res.json()) as Record<string, unknown>;
    return extractColesResults(body).map((row) => mapColesBffProduct(row));
  }

  private async searchRapidApi(query: string): Promise<GroceryProduct[]> {
    const url = new URL(`${this.rapidBaseUrl}/coles/product-search/`);
    url.searchParams.set("query", query);
    url.searchParams.set("page", "1");
    url.searchParams.set("size", "20");

    const res = await fetchWithTimeout(
      url.toString(),
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": this.rapidApiKey!,
          "X-RapidAPI-Host": this.rapidHost,
        },
        next: { revalidate: 0 },
      },
      RAPIDAPI_TIMEOUT_MS
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const body = (await res.json()) as Record<string, unknown>;
    const candidates = [body.results, body.Results, body.products, body.data];
    let rows: Record<string, unknown>[] = [];
    for (const c of candidates) {
      if (Array.isArray(c)) {
        rows = c.filter(
          (x): x is Record<string, unknown> => !!x && typeof x === "object"
        );
        break;
      }
    }
    return rows.map((row) => mapRapidResult(row, "coles", `${this.id}-rapidapi`));
  }
}

function extractColesResults(
  body: Record<string, unknown>
): Record<string, unknown>[] {
  const results =
    body.results ??
    body.Results ??
    body.products ??
    (body.data as Record<string, unknown> | undefined)?.results ??
    (body.data as Record<string, unknown> | undefined)?.products;

  if (!Array.isArray(results)) return [];
  return results.filter(
    (x): x is Record<string, unknown> => !!x && typeof x === "object"
  );
}

function mapColesBffProduct(row: Record<string, unknown>): GroceryProduct {
  const name =
    asString(row.name) ??
    asString(row.displayName) ??
    asString(row.title) ??
    "Coles product";
  const pricing =
    row.pricing && typeof row.pricing === "object"
      ? (row.pricing as Record<string, unknown>)
      : row;
  const currentPrice =
    asNumber(pricing.now) ??
    asNumber(pricing.price) ??
    asNumber(row.price) ??
    asNumber(row.currentPrice);
  const regularPrice =
    asNumber(pricing.was) ??
    asNumber(pricing.comparable) ??
    asNumber(row.wasPrice);
  const id =
    asString(row.id) ??
    asString(row.productId) ??
    asString(row.sku) ??
    name;
  const barcode = asString(row.barcode) ?? asString(row.gtin);
  const imageObj =
    row.imageUris && Array.isArray(row.imageUris)
      ? (row.imageUris[0] as Record<string, unknown> | undefined)
      : undefined;

  const isOnSpecial =
    Boolean(row.onSpecial) ||
    Boolean(pricing.isOnSpecial) ||
    (regularPrice != null &&
      currentPrice != null &&
      regularPrice > currentPrice);

  return enrichGroceryProduct({
    id: `coles-${id}-${currentPrice ?? 0}`,
    name,
    brand: asString(row.brand) ?? asString(row.brandName),
    barcode,
    store: "coles",
    currentPrice,
    regularPrice,
    size: asString(row.size) ?? asString(row.packageSize),
    unitPrice: asNumber(pricing.unit) ?? asNumber(row.unitPrice),
    unitLabel: asString(pricing.unitOfMeasure) ?? asString(row.unitLabel),
    imageUrl: resolveProductImageUrl({
      store: "coles",
      row: {
        ...row,
        image_url:
          asString(imageObj?.uri) ??
          asString(row.imageUri) ??
          asString(row.image_url),
        id,
      },
      barcode,
    }),
    productUrl: asString(row.seoToken)
      ? `https://www.coles.com.au/product/${asString(row.seoToken)}`
      : asString(row.url),
    isOnSpecial,
    availability: "unknown",
    lastUpdated: new Date().toISOString(),
    dataSource: "live-api",
    providerId: "coles-direct",
    stockCode: id,
    raw: row,
  });
}

export const colesProvider = new ColesProvider();
