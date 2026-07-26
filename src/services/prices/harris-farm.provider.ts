import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import type { StoreName } from "@/types/common";

/** Placeholder for future Harris Farm API integration via server routes. */
export class HarrisFarmProvider implements PriceProvider {
  storeName: StoreName = "harris-farm";

  async searchProducts(query: string, location: string): Promise<StoreProductPrice[]> {
    throw new Error(
      `Harris Farm provider is not yet configured for "${query}" in ${location}. Use mock mode.`
    );
  }
}
