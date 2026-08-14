import type { GroceryProduct } from "@/types/grocery";
import type { StoreProductPrice } from "@/types/price";
import type { StoreName } from "@/types/common";
import {
  computeComparableUnitPrice,
  normalizeProductName,
  parseSizeString,
} from "./normalizer";
import { stapleImageForQuery } from "./image-urls";

const STORE_NAMES: StoreName[] = [
  "coles",
  "woolworths",
  "aldi",
  "costco",
  "harris-farm",
];

export function isStoreName(value: string): value is StoreName {
  return (STORE_NAMES as string[]).includes(value);
}

export function toStoreProductPrice(
  product: GroceryProduct,
  query: string,
  location?: string
): StoreProductPrice | null {
  if (!isStoreName(product.store)) return null;
  if (product.currentPrice == null || !Number.isFinite(product.currentPrice)) {
    return null;
  }

  const unit =
    product.unitPrice != null
      ? { unitPrice: product.unitPrice, unitLabel: product.unitLabel ?? "per unit" }
      : computeComparableUnitPrice(product.currentPrice, product.size);

  const imageUrl =
    product.imageUrl ||
    stapleImageForQuery(query) ||
    stapleImageForQuery(product.name);

  return {
    id: product.id,
    query,
    productName: product.name,
    brand: product.brand,
    size: product.size,
    store: product.store,
    currentPrice: product.currentPrice,
    regularPrice: product.regularPrice,
    unitPrice: unit?.unitPrice ?? product.unitPrice,
    unitLabel: unit?.unitLabel ?? product.unitLabel,
    isOnSpecial: Boolean(product.isOnSpecial),
    discountPercentage: product.discountPercentage,
    availability: product.availability,
    productUrl: product.productUrl,
    imageUrl,
    location,
    dataSource: product.dataSource,
    lastUpdated: product.lastUpdated,
    catalogueExpiresAt: product.catalogueExpiresAt,
    barcode: product.barcode,
  };
}

export function enrichGroceryProduct(product: GroceryProduct): GroceryProduct {
  const parsed = parseSizeString(product.size);
  const unit =
    product.currentPrice != null
      ? computeComparableUnitPrice(
          product.currentPrice,
          product.size,
          product.unitPrice
        )
      : null;

  return {
    ...product,
    normalizedName: product.normalizedName ?? normalizeProductName(product.name),
    quantityGrams: product.quantityGrams ?? parsed?.grams,
    quantityMl: product.quantityMl ?? parsed?.ml,
    unitPrice: unit?.unitPrice ?? product.unitPrice,
    unitLabel: unit?.unitLabel ?? product.unitLabel,
  };
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}
