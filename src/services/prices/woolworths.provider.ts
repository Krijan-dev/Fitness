import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import type { StoreName } from "@/types/common";

/** Placeholder for future Woolworths API integration via server routes. */
export class WoolworthsProvider implements PriceProvider {
  storeName: StoreName = "woolworths";

  async searchProducts(query: string, location: string): Promise<StoreProductPrice[]> {
    throw new Error(
      `Woolworths provider is not yet configured for "${query}" in ${location}. Use mock mode.`
    );
  }
}
