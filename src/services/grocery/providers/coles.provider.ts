import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { mapRapidResult } from "./mock-grocery.provider";
import { getColesApiKey } from "../credentials";

/**
 * Unofficial RapidAPI Coles Product Price API provider.
 * Docs: https://rapidapi.com/data-holdings-group-data-holdings-group-default/api/coles-product-price-api
 * Endpoint verified: GET /coles/product-search/?query=
 */
export class ColesProvider implements GroceryProvider {
  readonly id = "coles-rapidapi";
  readonly displayName = "Coles (RapidAPI — unofficial)";
  readonly official = false;

  private get apiKey(): string | undefined {
    return getColesApiKey();
  }

  private get baseUrl(): string {
    return (
      process.env.COLES_API_BASE_URL ||
      "https://coles-product-price-api.p.rapidapi.com"
    ).replace(/\/$/, "");
  }

  private get host(): string {
    return (
      process.env.COLES_API_HOST || "coles-product-price-api.p.rapidapi.com"
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

    const url = new URL(`${this.baseUrl}/coles/product-search/`);
    url.searchParams.set("query", q);
    url.searchParams.set("page", "1");
    url.searchParams.set("size", "20");

    const res = await fetch(url.toString(), {
      headers: this.headers(),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Coles RapidAPI search failed (${res.status})`);
    }

    const body = (await res.json()) as Record<string, unknown>;
    const rows = extractResults(body);
    return rows.map((row) => mapRapidResult(row, "coles", this.id));
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    if (!this.isConfigured()) return null;
    // Coles RapidAPI listing focuses on product-search / price-changes;
    // barcode matching falls back to name search with the barcode string.
    const results = await this.searchProducts(barcode);
    const exact = results.find((p) => p.barcode === barcode.trim());
    return exact ?? results[0] ?? null;
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

export const colesProvider = new ColesProvider();
