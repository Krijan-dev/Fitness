import type { StoreProductPrice } from "@/types/price";

/** Prefer cheapest comparable unit price ($/100g or $/100ml), else shelf price. */
export function compareByUnitThenShelfPrice(
  a: StoreProductPrice,
  b: StoreProductPrice
): number {
  const au = a.unitPrice;
  const bu = b.unitPrice;
  if (au != null && bu != null && Number.isFinite(au) && Number.isFinite(bu)) {
    return au - bu;
  }
  if (au != null && bu == null) return -1;
  if (au == null && bu != null) return 1;
  return a.currentPrice - b.currentPrice;
}
