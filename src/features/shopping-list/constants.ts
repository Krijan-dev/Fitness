import type { ShoppingCategory } from "@/types/common";

export const SHOPPING_CATEGORY_OPTIONS: Array<{
  value: ShoppingCategory;
  label: string;
}> = [
  { value: "fruit", label: "Fruit" },
  { value: "vegetables", label: "Vegetables" },
  { value: "meat", label: "Meat" },
  { value: "seafood", label: "Seafood" },
  { value: "dairy", label: "Dairy" },
  { value: "frozen", label: "Frozen" },
  { value: "bakery", label: "Bakery" },
  { value: "pantry", label: "Pantry" },
  { value: "drinks", label: "Drinks" },
  { value: "household", label: "Household" },
  { value: "other", label: "Other" },
];

export const SHOPPING_CATEGORY_ORDER: ShoppingCategory[] =
  SHOPPING_CATEGORY_OPTIONS.map((o) => o.value);

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingCategory, string> =
  Object.fromEntries(
    SHOPPING_CATEGORY_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<ShoppingCategory, string>;

export type ShoppingFilterOption = "all" | "unpurchased" | "purchased";

export const SHOPPING_FILTER_OPTIONS: Array<{
  value: ShoppingFilterOption;
  label: string;
}> = [
  { value: "all", label: "All items" },
  { value: "unpurchased", label: "To buy" },
  { value: "purchased", label: "Purchased" },
];
