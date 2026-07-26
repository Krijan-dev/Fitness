import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import type { StoreName } from "@/types/common";

/** Placeholder for future Aldi API integration via server routes. */
export class AldiProvider implements PriceProvider {
  storeName: StoreName = "aldi";

  async searchProducts(query: string, location: string): Promise<StoreProductPrice[]> {
    throw new Error(
      `Aldi provider is not yet configured for "${query}" in ${location}. Use mock mode.`
    );
  }
}
