import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import type { StoreName } from "@/types/common";

/** Placeholder for future Costco API integration via server routes. */
export class CostcoProvider implements PriceProvider {
  storeName: StoreName = "costco";

  async searchProducts(query: string, location: string): Promise<StoreProductPrice[]> {
    throw new Error(
      `Costco provider is not yet configured for "${query}" in ${location}. Use mock mode.`
    );
  }
}
