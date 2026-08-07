import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { mapRapidResult } from "./mock-grocery.provider";
import { getWoolworthsApiKey } from "../credentials";
import { browserJsonHeaders, isForbiddenStatus } from "../http-headers";
import { enrichGroceryProduct, asNumber, asString } from "../mappers";
import { resolveProductImageUrl } from "../image-urls";
import { mockGroceryProvider } from "./mock-grocery.provider";

/**
 * Woolworths provider (unofficial).
 * 1) Direct UI search: https://www.woolworths.com.au/apis/ui/Search/products
 * 2) RapidAPI fallback when direct returns 403/blocked or key is configured preference
 * 3) Mock fallback when both fail / unconfigured
 */
export class WoolworthsProvider implements GroceryProvider {
  readonly id = "woolworths";
  readonly displayName = "Woolworths (direct + RapidAPI — unofficial)";
  readonly official = false;

  private get rapidApiKey(): string | undefined {
    return getWoolworthsApiKey();
  }

  private get rapidBaseUrl(): string {
    return (
      process.env.WOOLWORTHS_API_BASE_URL ||
      "https://woolworths-products-api.p.rapidapi.com"
    ).replace(/\/$/, "");
  }

  private get rapidHost(): string {
    return (
      process.env.WOOLWORTHS_API_HOST ||
      "woolworths-products-api.p.rapidapi.com"
    );
  }

  /** Always attempt direct; RapidAPI optional. */
  isConfigured(): boolean {
    return process.env.PRICE_PROVIDER_MODE !== "mock";
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    const q = query.trim();
    if (!q) return [];
    if (!this.isConfigured()) {
      return (await mockGroceryProvider.searchProducts(q)).filter(
        (p) => p.store === "woolworths"
      );
    }

    try {
      const direct = await this.searchDirect(q);
      if (direct.length > 0) return direct;
    } catch (err) {
      console.warn("Woolworths direct search failed:", err);
    }

    if (this.rapidApiKey) {
      try {
        return await this.searchRapidApi(q);
      } catch (err) {
        console.warn("Woolworths RapidAPI search failed:", err);
      }
    }

    return (await mockGroceryProvider.searchProducts(q)).filter(
      (p) => p.store === "woolworths"
    );
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    const code = barcode.trim();
    if (!code) return null;

    const fromSearch = await this.searchProducts(code);
    const exact = fromSearch.find((p) => p.barcode === code);
    if (exact) return exact;

    if (this.rapidApiKey) {
      try {
        const url = new URL(`${this.rapidBaseUrl}/woolworths/barcode-search/`);
        url.searchParams.set("barcode", code);
        const res = await fetch(url.toString(), {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": this.rapidApiKey,
            "X-RapidAPI-Host": this.rapidHost,
          },
          next: { revalidate: 0 },
        });
        if (res.ok) {
          const body = (await res.json()) as Record<string, unknown>;
          const rows = extractResults(body);
          if (rows[0]) return mapRapidResult(rows[0], "woolworths", this.id);
          if (body.product_name) {
            return mapRapidResult(body, "woolworths", this.id);
          }
        }
      } catch (err) {
        console.warn("Woolworths RapidAPI barcode failed:", err);
      }
    }

    return fromSearch[0] ?? null;
  }

  /**
   * Direct Woolworths UI search.
   * Tries GET ?searchTerm= as requested, then POST JSON body (more reliable).
   */
  private async searchDirect(query: string): Promise<GroceryProduct[]> {
    const headers = browserJsonHeaders({
      referer: "https://www.woolworths.com.au/",
      origin: "https://www.woolworths.com.au",
    });

    // 1) GET with searchTerm (as specified)
    const getUrl = new URL(
      "https://www.woolworths.com.au/apis/ui/Search/products"
    );
    getUrl.searchParams.set("searchTerm", query);

    let res = await fetch(getUrl.toString(), {
      method: "GET",
      headers,
      next: { revalidate: 0 },
    });

    if (isForbiddenStatus(res.status)) {
      throw new Error(`Woolworths direct GET blocked (${res.status})`);
    }

    // 2) POST body if GET is empty / not OK
    if (!res.ok) {
      res = await fetch(
        "https://www.woolworths.com.au/apis/ui/Search/products",
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Filters: [],
            IsSpecial: false,
            Location: `/shop/search/products?searchTerm=${encodeURIComponent(query)}`,
            PageNumber: 1,
            PageSize: 24,
            SearchTerm: query,
            SortType: "TraderRelevance",
          }),
          next: { revalidate: 0 },
        }
      );
      if (isForbiddenStatus(res.status)) {
        throw new Error(`Woolworths direct POST blocked (${res.status})`);
      }
    }

    if (!res.ok) {
      throw new Error(`Woolworths direct search failed (${res.status})`);
    }

    const body = (await res.json()) as Record<string, unknown>;
    return flattenWoolworthsProducts(body).map((row) =>
      mapWoolworthsUiProduct(row)
    );
  }

  private async searchRapidApi(query: string): Promise<GroceryProduct[]> {
    const url = new URL(`${this.rapidBaseUrl}/woolworths/product-search/`);
    url.searchParams.set("query", query);
    url.searchParams.set("page", "1");
    url.searchParams.set("page_size", "20");

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": this.rapidApiKey!,
        "X-RapidAPI-Host": this.rapidHost,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Woolworths RapidAPI search failed (${res.status})`);
    }

    const body = (await res.json()) as Record<string, unknown>;
    return extractResults(body).map((row) =>
      mapRapidResult(row, "woolworths", `${this.id}-rapidapi`)
    );
  }
}

function flattenWoolworthsProducts(
  body: Record<string, unknown>
): Record<string, unknown>[] {
  const products = body.Products ?? body.products;
  if (!Array.isArray(products)) return [];

  const out: Record<string, unknown>[] = [];
  for (const group of products) {
    if (!group || typeof group !== "object") continue;
    const g = group as Record<string, unknown>;
    const nested = g.Products ?? g.products;
    if (Array.isArray(nested)) {
      for (const item of nested) {
        if (item && typeof item === "object") {
          out.push(item as Record<string, unknown>);
        }
      }
    } else if (g.Name || g.name || g.Stockcode) {
      out.push(g);
    }
  }
  return out;
}

function mapWoolworthsUiProduct(row: Record<string, unknown>): GroceryProduct {
  const name =
    asString(row.DisplayName) ??
    asString(row.Name) ??
    asString(row.name) ??
    "Woolworths product";
  const currentPrice =
    asNumber(row.Price) ?? asNumber(row.InstorePrice) ?? asNumber(row.price);
  const regularPrice =
    asNumber(row.WasPrice) ?? asNumber(row.wasPrice) ?? asNumber(row.ListPrice);
  const stockcode = asString(row.Stockcode) ?? asString(row.stockcode);
  const barcode = asString(row.Barcode) ?? asString(row.barcode);
  const isOnSpecial =
    Boolean(row.IsOnSpecial) ||
    Boolean(row.isOnSpecial) ||
    (regularPrice != null &&
      currentPrice != null &&
      regularPrice > currentPrice);

  return enrichGroceryProduct({
    id: `woolworths-${stockcode ?? barcode ?? name}-${currentPrice ?? 0}`,
    name,
    brand: asString(row.Brand) ?? asString(row.brand),
    barcode,
    store: "woolworths",
    currentPrice,
    regularPrice,
    size: asString(row.PackageSize) ?? asString(row.CupMeasure) ?? asString(row.size),
    unitPrice: asNumber(row.CupPrice),
    unitLabel: asString(row.CupString) ?? undefined,
    imageUrl: resolveProductImageUrl({
      store: "woolworths",
      row: {
        ...row,
        image_url:
          asString(row.MediumImageFile) ??
          asString(row.LargeImageFile) ??
          asString(row.SmallImageFile),
        stockcode,
      },
      barcode,
    }),
    productUrl: stockcode
      ? `https://www.woolworths.com.au/shop/productdetails/${stockcode}`
      : undefined,
    isOnSpecial,
    availability: row.IsAvailable === false ? "out-of-stock" : "in-stock",
    lastUpdated: new Date().toISOString(),
    dataSource: "live-api",
    providerId: "woolworths-direct",
    stockCode: stockcode,
    raw: row,
  });
}

function extractResults(body: Record<string, unknown>): Record<string, unknown>[] {
  const candidates = [body.results, body.Results, body.products, body.data];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      return c.filter(
        (x): x is Record<string, unknown> => !!x && typeof x === "object"
      );
    }
  }
  return [];
}

export const woolworthsProvider = new WoolworthsProvider();
