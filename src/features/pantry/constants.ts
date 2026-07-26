import type { ShoppingCategory } from "@/types/common";

export const PANTRY_CATEGORY_OPTIONS: Array<{
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

export type PantryFilterOption = "all" | ShoppingCategory;

export const PANTRY_FILTER_OPTIONS: Array<{
  value: PantryFilterOption;
  label: string;
}> = [
  { value: "all", label: "All categories" },
  ...PANTRY_CATEGORY_OPTIONS,
];

export const EXPIRY_WARNING_DAYS = 7;
