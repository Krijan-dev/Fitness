import type { GroceryProduct } from "@/types/grocery";
import type { StoreProductPrice } from "@/types/price";
import type { StoreName } from "@/types/common";

const STORES: StoreName[] = [
  "coles",
  "woolworths",
  "aldi",
  "iga",
  "costco",
  "harris-farm",
];

export function groceryToPriceOption(
  product: GroceryProduct,
  query: string,
  location?: string
): StoreProductPrice | null {
  if (!(STORES as string[]).includes(product.store)) return null;
  if (product.currentPrice == null || !Number.isFinite(product.currentPrice)) {
    return null;
  }

  return {
    id: product.id,
    query,
    productName: product.name,
    brand: product.brand,
    size: product.size,
    store: product.store as StoreName,
    currentPrice: product.currentPrice,
    regularPrice: product.regularPrice,
    unitPrice: product.unitPrice,
    unitLabel: product.unitLabel,
    isOnSpecial: Boolean(product.isOnSpecial),
    discountPercentage: product.discountPercentage,
    availability: product.availability,
    productUrl: product.productUrl,
    imageUrl: product.imageUrl,
    location,
    dataSource: product.dataSource,
    lastUpdated: product.lastUpdated,
    catalogueExpiresAt: product.catalogueExpiresAt,
    barcode: product.barcode,
  };
}
