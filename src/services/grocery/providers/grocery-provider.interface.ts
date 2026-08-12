import type { GroceryProduct } from "@/types/grocery";

/**
 * Abstraction over grocery / product data sources.
 * Unofficial supermarket feeds (RapidAPI, Apify) implement this so they can be swapped.
 */
export interface GroceryProvider {
  readonly id: string;
  readonly displayName: string;
  /** Official vs unofficial third-party / scraper */
  readonly official: boolean;
  searchProducts(query: string): Promise<GroceryProduct[]>;
  getProductByBarcode(barcode: string): Promise<GroceryProduct | null>;
}
