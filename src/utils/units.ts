import type { WeightUnit } from "@/types/common";

export const WEIGHT_UNITS: WeightUnit[] = [
  "g",
  "kg",
  "ml",
  "L",
  "item",
  "tablespoon",
  "teaspoon",
  "cup",
];

export const UNIT_LABELS: Record<WeightUnit, string> = {
  g: "g",
  kg: "kg",
  ml: "ml",
  L: "L",
  item: "item",
  tablespoon: "tbsp",
  teaspoon: "tsp",
  cup: "cup",
};

export const NON_GRAM_UNITS: WeightUnit[] = [
  "item",
  "tablespoon",
  "teaspoon",
  "cup",
];

export function requiresGramEquivalent(unit: WeightUnit): boolean {
  return NON_GRAM_UNITS.includes(unit);
}

export function getUnitOptions(): Array<{ value: string; label: string }> {
  return WEIGHT_UNITS.map((unit) => ({
    value: unit,
    label: UNIT_LABELS[unit],
  }));
}
