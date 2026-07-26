import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import type { StoreName } from "@/types/common";

/** Placeholder for future Coles API integration via server routes. */
export class ColesProvider implements PriceProvider {
  storeName: StoreName = "coles";

  async searchProducts(query: string, location: string): Promise<StoreProductPrice[]> {
    throw new Error(
      `Coles provider is not yet configured for "${query}" in ${location}. Use mock mode.`
    );
  }
}
