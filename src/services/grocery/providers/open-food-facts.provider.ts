import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { enrichGroceryProduct, asString } from "../mappers";
import { resolveProductImageUrl } from "../image-urls";

/**
 * Official Open Food Facts API — barcode metadata (not live shelf prices).
 * Docs: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
 * Requires a descriptive User-Agent.
 */
export class OpenFoodFactsProvider implements GroceryProvider {
  readonly id = "open-food-facts";
  readonly displayName = "Open Food Facts";
  readonly official = true;

  private get baseUrl(): string {
    return (
      process.env.OPEN_FOOD_FACTS_BASE_URL ||
      "https://world.openfoodfacts.org"
    ).replace(/\/$/, "");
  }

  private get userAgent(): string {
    return (
      process.env.OPEN_FOOD_FACTS_USER_AGENT ||
      "MealPrepPro/1.0 (grocery comparison; contact=admin@mealprep.local)"
    );
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    const q = query.trim();
    if (!q) return [];

    const url = new URL(`${this.baseUrl}/cgi/search.pl`);
    url.searchParams.set("search_terms", q);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", "20");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": this.userAgent },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Open Food Facts search failed (${res.status})`);
    }

    const body = (await res.json()) as {
      products?: Record<string, unknown>[];
    };

    return (body.products ?? []).map((p) => this.mapProduct(p));
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    const code = barcode.trim();
    if (!code) return null;

    const url = `${this.baseUrl}/api/v2/product/${encodeURIComponent(code)}.json`;
    const res = await fetch(url, {
      headers: { "User-Agent": this.userAgent },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const body = (await res.json()) as {
      status?: number;
      product?: Record<string, unknown>;
    };

    if (body.status !== 1 || !body.product) return null;
    return this.mapProduct(body.product, code);
  }

  private mapProduct(
    row: Record<string, unknown>,
    barcodeFallback?: string
  ): GroceryProduct {
    const name =
      asString(row.product_name) ??
      asString(row.product_name_en) ??
      asString(row.generic_name) ??
      "Unknown product";

    const quantity = asString(row.quantity) ?? asString(row.product_quantity);
    const barcode = asString(row.code) ?? barcodeFallback;

    return enrichGroceryProduct({
      id: `off-${barcode ?? name}`,
      name,
      brand: asString(row.brands)?.split(",")[0]?.trim(),
      barcode,
      store: "open-food-facts",
      size: quantity,
      imageUrl: resolveProductImageUrl({
        store: "open-food-facts",
        row,
        barcode,
      }),
      productUrl: asString(row.url),
      lastUpdated: new Date().toISOString(),
      dataSource: "live-api",
      providerId: this.id,
      raw: row,
    });
  }
}

export const openFoodFactsProvider = new OpenFoodFactsProvider();
