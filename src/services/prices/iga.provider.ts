import type { StoreProductPrice } from "@/types/price";
import type { PriceProvider } from "./price-provider.interface";
import type { StoreName } from "@/types/common";

/** Placeholder for future IGA API integration via server routes. */
export class IGAProvider implements PriceProvider {
  storeName: StoreName = "iga";

  async searchProducts(query: string, location: string): Promise<StoreProductPrice[]> {
    throw new Error(
      `IGA provider is not yet configured for "${query}" in ${location}. Use mock mode.`
    );
  }
}
