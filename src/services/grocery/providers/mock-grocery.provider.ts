import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { enrichGroceryProduct, asNumber, asString } from "../mappers";
import mockPrices from "@/data/mock-prices.json";
import type { StoreProductPrice } from "@/types/price";

/**
 * Local mock provider for demos and CI when live API keys are absent.
 */
export class MockGroceryProvider implements GroceryProvider {
  readonly id = "mock";
  readonly displayName = "Mock Grocery";
  readonly official = true;

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return (mockPrices as StoreProductPrice[])
      .filter((p) => {
        const hay = `${p.query} ${p.productName} ${p.brand ?? ""}`.toLowerCase();
        return hay.includes(q) || q.split(/\s+/).some((w) => w.length > 2 && hay.includes(w));
      })
      .map((p) =>
        enrichGroceryProduct({
          id: p.id,
          name: p.productName,
          brand: p.brand,
          store: p.store,
          currentPrice: p.currentPrice,
          regularPrice: p.regularPrice,
          unitPrice: p.unitPrice,
          unitLabel: p.unitLabel,
          size: p.size,
          imageUrl: p.imageUrl,
          productUrl: p.productUrl,
          isOnSpecial: p.isOnSpecial,
          discountPercentage: p.discountPercentage,
          availability: p.availability,
          lastUpdated: p.lastUpdated,
          dataSource: "mock",
          providerId: this.id,
        })
      );
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    const code = barcode.trim();
    if (!code) return null;
    const match = (mockPrices as StoreProductPrice[]).find(
      (p) => (p as StoreProductPrice & { barcode?: string }).barcode === code
    );
    if (!match) return null;
    const results = await this.searchProducts(match.query);
    return results[0] ?? null;
  }
}

export const mockGroceryProvider = new MockGroceryProvider();

/** Helpers shared by live RapidAPI mappers */
export function mapRapidResult(
  row: Record<string, unknown>,
  store: "coles" | "woolworths",
  providerId: string
): GroceryProduct {
  const name =
    asString(row.product_name) ??
    asString(row.name) ??
    asString(row.title) ??
    "Unknown product";
  const currentPrice =
    asNumber(row.current_price) ??
    asNumber(row.price) ??
    asNumber(row.CurrentPrice);
  const regularPrice =
    asNumber(row.was_price) ??
    asNumber(row.regular_price) ??
    asNumber(row.WasPrice);
  const barcode =
    asString(row.barcode) ?? asString(row.Barcode) ?? asString(row.ean);

  const isOnSpecial =
    Boolean(row.is_special) ||
    Boolean(row.on_special) ||
    (regularPrice != null &&
      currentPrice != null &&
      regularPrice > currentPrice);

  let discountPercentage: number | undefined;
  if (isOnSpecial && regularPrice && currentPrice && regularPrice > 0) {
    discountPercentage = Math.round(
      ((regularPrice - currentPrice) / regularPrice) * 100
    );
  }

  return enrichGroceryProduct({
    id: `${store}-${barcode ?? asString(row.id) ?? name}-${currentPrice ?? 0}`,
    name,
    brand: asString(row.product_brand) ?? asString(row.brand),
    barcode,
    store,
    currentPrice,
    regularPrice,
    size: asString(row.product_size) ?? asString(row.size) ?? asString(row.pack_size),
    imageUrl: asString(row.image_url) ?? asString(row.image),
    productUrl: asString(row.url) ?? asString(row.product_url),
    isOnSpecial,
    discountPercentage,
    lastUpdated: new Date().toISOString(),
    dataSource: "live-api",
    providerId,
    catalogueExpiresAt: asString(row.special_end_date) ?? asString(row.catalogue_end),
    raw: row,
  });
}
