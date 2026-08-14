import type { StoreName } from "@/types/common";
import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import mockPrices from "@/data/mock-prices.json";

export class MockPriceProvider implements PriceProvider {
  storeName: StoreName;

  constructor(storeName: StoreName) {
    this.storeName = storeName;
  }

  async searchProducts(query: string, location: string): Promise<StoreProductPrice[]> {
    const normalizedQuery = query.toLowerCase().trim();
    return (mockPrices as StoreProductPrice[]).filter(
      (p) =>
        p.store === this.storeName &&
        matchesPriceQuery(p, normalizedQuery) &&
        (p.location === location || !p.location)
    );
  }
}

function matchesPriceQuery(product: StoreProductPrice, query: string): boolean {
  if (!query) return false;
  const productQuery = product.query.toLowerCase();
  const productName = product.productName.toLowerCase();
  if (productQuery.includes(query) || query.includes(productQuery)) return true;
  if (productName.includes(query)) return true;
  const words = query.split(/\s+/).filter((w) => w.length > 2);
  return words.some((word) => productName.includes(word) || productQuery.includes(word));
}

export const mockColesProvider = new MockPriceProvider("coles");
export const mockWoolworthsProvider = new MockPriceProvider("woolworths");
export const mockAldiProvider = new MockPriceProvider("aldi");
export const mockCostcoProvider = new MockPriceProvider("costco");
export const mockHarrisFarmProvider = new MockPriceProvider("harris-farm");
