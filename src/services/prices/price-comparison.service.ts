import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import {
  mockColesProvider,
  mockWoolworthsProvider,
  mockAldiProvider,
  mockIGAProvider,
  mockCostcoProvider,
  mockHarrisFarmProvider,
} from "./mock-price.provider";

export class PriceComparisonService {
  private providers: PriceProvider[];

  constructor(providers: PriceProvider[]) {
    this.providers = providers;
  }

  async searchAllStores(
    query: string,
    location: string
  ): Promise<StoreProductPrice[]> {
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
  mockIGAProvider,
  mockCostcoProvider,
  mockHarrisFarmProvider,
]);
