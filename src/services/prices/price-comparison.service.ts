import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import {
  mockColesProvider,
  mockWoolworthsProvider,
  mockAldiProvider,
  mockCostcoProvider,
  mockHarrisFarmProvider,
} from "./mock-price.provider";
import { searchStorePrices } from "@/services/grocery/grocery-search.service";

export class PriceComparisonService {
  private providers: PriceProvider[];

  constructor(providers: PriceProvider[]) {
    this.providers = providers;
  }

  async searchAllStores(
    query: string,
    location: string
  ): Promise<StoreProductPrice[]> {
    // Prefer unified grocery search (live + cache + mock)
    try {
      const { data } = await searchStorePrices(query, location);
      if (data.length > 0) return data;
    } catch (err) {
      console.error(
        "Grocery search failed, falling back to mock providers:",
        err
      );
    }

    const results: StoreProductPrice[] = [];
    for (const provider of this.providers) {
      try {
        const products = await provider.searchProducts(query, location);
        results.push(...products);
      } catch (error) {
        console.error(`Provider ${provider.storeName} failed:`, error);
      }
    }
    return results;
  }
}

export const priceComparisonService = new PriceComparisonService([
  mockColesProvider,
  mockWoolworthsProvider,
  mockAldiProvider,
  mockCostcoProvider,
  mockHarrisFarmProvider,
]);
