import type { StoreProductPrice } from "@/types/price";
import type { StoreName } from "@/types/common";

export interface PriceProvider {
  storeName: StoreName;
  searchProducts(query: string, location: string): Promise<StoreProductPrice[]>;
}
