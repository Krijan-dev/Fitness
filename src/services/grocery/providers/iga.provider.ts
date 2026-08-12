import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { enrichGroceryProduct, asNumber, asString } from "../mappers";
import { resolveProductImageUrl } from "../image-urls";
import { mockGroceryProvider } from "./mock-grocery.provider";

/**
 * IGA Australia — no official public product API.
 * Uses optional cached JSON (`IGA_CACHE_URL`) from a weekly scrape / partner feed,
 * falling back to mock IGA rows when unconfigured.
 * Marked unofficial.
 */
export class IgaProvider implements GroceryProvider {
  readonly id = "iga-cache";
  readonly displayName = "IGA (cached JSON — unofficial)";
  readonly official = false;

  private get cacheUrl(): string | undefined {
    return process.env.IGA_CACHE_URL || undefined;
  }

  isConfigured(): boolean {
    return Boolean(this.cacheUrl);
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    const q = query.trim();
    if (!q) return [];

    if (this.isConfigured()) {
      const products = await this.fetchCache();
      const needle = q.toLowerCase();
      return products.filter((p) => {
        const hay = `${p.name} ${p.brand ?? ""}`.toLowerCase();
        return (
          hay.includes(needle) ||
          needle.split(/\s+/).some((w) => w.length > 2 && hay.includes(w))
        );
      });
    }

    // Soft fallback to mock IGA-only rows so UI still shows IGA when keys missing
    const mock = await mockGroceryProvider.searchProducts(q);
    return mock.filter((p) => p.store === "iga");
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    const results = await this.searchProducts(barcode);
    return results.find((p) => p.barcode === barcode.trim()) ?? results[0] ?? null;
  }

  private async fetchCache(): Promise<GroceryProduct[]> {
    const res = await fetch(this.cacheUrl!, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`IGA cache HTTP ${res.status}`);
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
      asString(row.productName) ??
      asString(row.title) ??
      "IGA product";
    const currentPrice = asNumber(row.price) ?? asNumber(row.currentPrice);
    const barcode = asString(row.barcode) ?? asString(row.ean);

    return enrichGroceryProduct({
      id: `iga-${asString(row.id) ?? name}-${currentPrice ?? 0}`,
      name,
      brand: asString(row.brand),
      barcode,
      store: "iga",
      currentPrice,
      regularPrice: asNumber(row.wasPrice) ?? asNumber(row.regularPrice),
      unitPrice: asNumber(row.unitPrice),
      unitLabel: asString(row.unitLabel),
      size: asString(row.size) ?? asString(row.packSize),
      imageUrl: resolveProductImageUrl({ store: "iga", row, barcode }),
      productUrl: asString(row.url) ?? asString(row.productUrl),
      isOnSpecial: Boolean(row.isOnSpecial) || Boolean(row.onSpecial),
      lastUpdated: new Date().toISOString(),
      dataSource: "cached",
      providerId: this.id,
      raw: row,
    });
  }
}

export const igaProvider = new IgaProvider();
