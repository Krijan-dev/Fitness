import type { WeightUnit } from "@/types/common";

const GRAMS_PER_KG = 1000;
const ML_PER_L = 1000;

export function convertToGrams(quantity: number, unit: WeightUnit): number | null {
  switch (unit) {
    case "g":
      return quantity;
    case "kg":
      return quantity * GRAMS_PER_KG;
    case "ml":
      return quantity;
    case "L":
      return quantity * ML_PER_L;
  }
  return null;
}

export function calculateNutritionFromPer100g(
  grams: number,
  per100g: number
): number {
  if (grams <= 0 || per100g < 0) return 0;
  return (grams / 100) * per100g;
}

export function calculateWeeklyWeightChange(
  entries: { date: string; weight: number }[]
): number {
  if (entries.length < 2) return 0;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latest = sorted[sorted.length - 1];
  const weekAgo = sorted.find(
    (e) =>
      new Date(e.date).getTime() <=
      new Date(latest.date).getTime() - 7 * 24 * 60 * 60 * 1000
  );

  if (!weekAgo || weekAgo === latest) {
    const earliest = sorted[0];
    return latest.weight - earliest.weight;
  }

  return latest.weight - weekAgo.weight;
}
