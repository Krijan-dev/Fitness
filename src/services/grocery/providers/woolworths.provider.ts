import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { mapRapidResult } from "./mock-grocery.provider";
import { getWoolworthsApiKey } from "../credentials";

/**
 * Unofficial RapidAPI Woolworths Products API provider.
 * Docs: https://rapidapi.com/data-holdings-group-data-holdings-group-default/api/woolworths-products-api
 */
export class WoolworthsProvider implements GroceryProvider {
  readonly id = "woolworths-rapidapi";
  readonly displayName = "Woolworths (RapidAPI — unofficial)";
  readonly official = false;

  private get apiKey(): string | undefined {
    return getWoolworthsApiKey();
  }

  private get baseUrl(): string {
    return (
      process.env.WOOLWORTHS_API_BASE_URL ||
      "https://woolworths-products-api.p.rapidapi.com"
    ).replace(/\/$/, "");
  }

  private get host(): string {
    return (
      process.env.WOOLWORTHS_API_HOST ||
      "woolworths-products-api.p.rapidapi.com"
    );
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private headers(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": this.apiKey!,
      "X-RapidAPI-Host": this.host,
    };
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    if (!this.isConfigured()) return [];
    const q = query.trim();
    if (!q) return [];

    const url = new URL(`${this.baseUrl}/woolworths/product-search/`);
    url.searchParams.set("query", q);
    url.searchParams.set("page", "1");
    url.searchParams.set("page_size", "20");

    const res = await fetch(url.toString(), {
      headers: this.headers(),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Woolworths RapidAPI search failed (${res.status})`);
    }

    const body = (await res.json()) as Record<string, unknown>;
    const rows = extractResults(body);
    return rows.map((row) => mapRapidResult(row, "woolworths", this.id));
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    if (!this.isConfigured()) return null;
    const code = barcode.trim();
    if (!code) return null;

    const url = new URL(`${this.baseUrl}/woolworths/barcode-search/`);
    url.searchParams.set("barcode", code);

    const res = await fetch(url.toString(), {
      headers: this.headers(),
      next: { revalidate: 0 },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Woolworths barcode search failed (${res.status})`);
    }

    const body = (await res.json()) as Record<string, unknown>;
    const rows = extractResults(body);
    if (rows.length === 0 && body.product_name) {
      return mapRapidResult(body, "woolworths", this.id);
    }
    return rows[0] ? mapRapidResult(rows[0], "woolworths", this.id) : null;
  }
}

function extractResults(body: Record<string, unknown>): Record<string, unknown>[] {
  const candidates = [body.results, body.Results, body.products, body.data];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      return c.filter((x): x is Record<string, unknown> => !!x && typeof x === "object");
    }
  }
  return [];
}

export const woolworthsProvider = new WoolworthsProvider();
