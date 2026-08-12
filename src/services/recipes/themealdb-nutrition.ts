import ingredientsDb from "@/data/ingredients.json";
import type { Ingredient } from "@/types/ingredient";
import type { WeightUnit } from "@/types/common";
import type { ThemealdbIngredient, ThemealdbMeal } from "./themealdb.client";
import { generateId } from "@/utils/ids";
import {
  sumNutrition,
  roundNutrition,
} from "@/services/nutrition/nutrition-calculator.service";

interface NutritionPer100g {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fibrePer100g?: number;
}

/** Extra free fallbacks for common TheMealDB staples not in local DB. */
const FALLBACK_NUTRITION: NutritionPer100g[] = [
  { name: "chicken", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: "beef", caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15 },
  { name: "pork", caloriesPer100g: 242, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 14 },
  { name: "lamb", caloriesPer100g: 294, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 21 },
  { name: "salmon", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { name: "fish", caloriesPer100g: 120, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 3 },
  { name: "egg", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { name: "rice", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { name: "pasta", caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1 },
  { name: "flour", caloriesPer100g: 364, proteinPer100g: 10, carbsPer100g: 76, fatPer100g: 1 },
  { name: "sugar", caloriesPer100g: 387, proteinPer100g: 0, carbsPer100g: 100, fatPer100g: 0 },
  { name: "butter", caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81 },
  { name: "oil", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: "olive oil", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: "milk", caloriesPer100g: 42, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 1 },
  { name: "cream", caloriesPer100g: 340, proteinPer100g: 2, carbsPer100g: 3, fatPer100g: 36 },
  { name: "cheese", caloriesPer100g: 402, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33 },
  { name: "yogurt", caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: "yoghurt", caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: "onion", caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1 },
  { name: "garlic", caloriesPer100g: 149, proteinPer100g: 6.4, carbsPer100g: 33, fatPer100g: 0.5 },
  { name: "tomato", caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { name: "potato", caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.1 },
  { name: "carrot", caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2 },
  { name: "pepper", caloriesPer100g: 20, proteinPer100g: 0.9, carbsPer100g: 4.6, fatPer100g: 0.2 },
  { name: "salt", caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
  { name: "water", caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
  { name: "bread", caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2 },
  { name: "lemon", caloriesPer100g: 29, proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.3 },
  { name: "ginger", caloriesPer100g: 80, proteinPer100g: 1.8, carbsPer100g: 18, fatPer100g: 0.8 },
  { name: "soy sauce", caloriesPer100g: 53, proteinPer100g: 8, carbsPer100g: 4.9, fatPer100g: 0.1 },
];

const DB: NutritionPer100g[] = (
  ingredientsDb as Array<{
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fibrePer100g?: number;
  }>
).map((row) => ({
  name: row.name,
  caloriesPer100g: row.caloriesPer100g,
  proteinPer100g: row.proteinPer100g,
  carbsPer100g: row.carbsPer100g,
  fatPer100g: row.fatPer100g,
  fibrePer100g: row.fibrePer100g,
}));

export interface ThemealdbNutritionResult {
  ingredients: Ingredient[];
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  estimated: boolean;
}

/**
 * Estimate nutrition for a TheMealDB meal using local free ingredient data.
 * No paid nutrition APIs.
 */
export function enrichThemealdbNutrition(
  meal: ThemealdbMeal,
  servings = 4
): ThemealdbNutritionResult {
  const ingredients = meal.ingredients.map((ing) =>
    toNutritionIngredient(ing)
  );
  const total = roundNutrition(sumNutrition(ingredients));
  const s = Math.max(servings, 1);

  return {
    ingredients,
    caloriesPerServing: Math.round(total.calories / s),
    proteinPerServing: Math.round((total.protein / s) * 10) / 10,
    carbsPerServing: Math.round((total.carbs / s) * 10) / 10,
    fatPerServing: Math.round((total.fat / s) * 10) / 10,
    estimated: true,
  };
}

function toNutritionIngredient(ing: ThemealdbIngredient): Ingredient {
  const profile = matchNutritionProfile(ing.cleanedName || ing.rawName);
  const parsed = parseMeasure(ing.measure);

  return {
    id: generateId(),
    name: ing.cleanedName || ing.rawName,
    quantity: parsed.quantity,
    unit: parsed.unit,
    // Calculator expects total grams for this line when unit isn't g/kg/ml/L
    gramEquivalent: resolveGramEquivalent(parsed),
    caloriesPer100g: profile.caloriesPer100g,
    proteinPer100g: profile.proteinPer100g,
    carbsPer100g: profile.carbsPer100g,
    fatPer100g: profile.fatPer100g,
    fibrePer100g: profile.fibrePer100g,
    notes: ing.measure ? `Measure: ${ing.measure}` : undefined,
  };
}

/**
 * `gramEquivalent` on Ingredient is "weight in grams for this quantity"
 * (see IngredientRow). Volume/item units need an absolute gram total so
 * nutrition doesn't stay at 0.
 */
export function resolveGramEquivalent(parsed: {
  quantity: number;
  unit: WeightUnit;
  gramEquivalent?: number;
}): number | undefined {
  if (
    parsed.unit === "g" ||
    parsed.unit === "kg" ||
    parsed.unit === "ml" ||
    parsed.unit === "L"
  ) {
    return undefined;
  }
  if (parsed.unit === "cup") return parsed.quantity * 240;
  if (parsed.unit === "tablespoon") return parsed.quantity * 15;
  if (parsed.unit === "teaspoon") return parsed.quantity * 5;
  if (parsed.gramEquivalent != null && parsed.gramEquivalent > 0) {
    return parsed.quantity * parsed.gramEquivalent;
  }
  return Math.max(parsed.quantity, 1) * 40;
}

export function matchNutritionProfile(name: string): NutritionPer100g {
  const needle = name.toLowerCase().trim();
  if (!needle) {
    return {
      name: "unknown",
      caloriesPer100g: 50,
      proteinPer100g: 2,
      carbsPer100g: 8,
      fatPer100g: 1,
    };
  }

  const pool = [...DB, ...FALLBACK_NUTRITION];

  // Exact / includes match — prefer longer names
  const ranked = pool
    .map((row) => {
      const n = row.name.toLowerCase();
      let score = 0;
      if (n === needle) score = 100;
      else if (needle.includes(n) || n.includes(needle)) score = 80 + Math.min(n.length, 20);
      else {
        const tokens = needle.split(/\s+/);
        const hits = tokens.filter((t) => t.length > 2 && n.includes(t)).length;
        score = hits * 25;
      }
      return { row, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked[0]) return ranked[0].row;

  // Generic produce/spice fallback
  return {
    name,
    caloriesPer100g: 40,
    proteinPer100g: 1.5,
    carbsPer100g: 7,
    fatPer100g: 0.5,
  };
}

/**
 * Parse TheMealDB measure strings into quantity + unit (+ optional gramEquivalent).
 */
export function parseMeasure(measure?: string): {
  quantity: number;
  unit: WeightUnit;
  /** Per-item grams when unit is `item` (before quantity multiply). */
  gramEquivalent?: number;
} {
  if (!measure?.trim()) {
    return { quantity: 1, unit: "item", gramEquivalent: 50 };
  }

  let m = measure.trim().toLowerCase();
  m = m
    .replace(/½/g, "1/2")
    .replace(/⅓/g, "1/3")
    .replace(/⅔/g, "2/3")
    .replace(/¼/g, "1/4")
    .replace(/¾/g, "3/4")
    .replace(/⅛/g, "1/8");

  // e.g. 1.2 kg, 500g, 200 ml
  const mass = m.match(
    /^([\d./]+)\s*(kg|g|mg|ml|l|ltr|litre|liter|oz|lb|lbs)\b/
  );
  if (mass) {
    const qty = parseFraction(mass[1]);
    const unitRaw = mass[2];
    if (unitRaw === "kg" || unitRaw === "lb" || unitRaw === "lbs") {
      return {
        quantity: unitRaw.startsWith("lb") ? qty * 453.6 : qty * 1000,
        unit: "g",
      };
    }
    if (unitRaw === "g" || unitRaw === "mg") {
      return {
        quantity: unitRaw === "mg" ? qty / 1000 : qty,
        unit: "g",
      };
    }
    if (unitRaw === "l" || unitRaw === "ltr" || unitRaw === "litre" || unitRaw === "liter") {
      return { quantity: qty * 1000, unit: "ml" };
    }
    if (unitRaw === "ml") return { quantity: qty, unit: "ml" };
    if (unitRaw === "oz") return { quantity: qty * 28.35, unit: "g" };
  }

  const spoon = m.match(
    /^([\d./]+)\s*(tsp|tsps|teaspoon|teaspoons|tbsp|tbsps|tablespoon|tablespoons|cup|cups)\b/
  );
  if (spoon) {
    const qty = parseFraction(spoon[1]);
    const u = spoon[2];
    if (u.startsWith("cup")) return { quantity: qty, unit: "cup" };
    if (u.startsWith("tbsp") || u.startsWith("table")) {
      return { quantity: qty, unit: "tablespoon" };
    }
    return { quantity: qty, unit: "teaspoon" };
  }

  // Leading number with item-like remainder: "5 thinly sliced", "8 cloves"
  const count = m.match(/^([\d./]+)\b/);
  if (count) {
    const qty = parseFraction(count[1]);
    let gramEquivalent = 40;
    if (m.includes("clove")) gramEquivalent = 3;
    else if (m.includes("onion")) gramEquivalent = 110;
    else if (m.includes("egg")) gramEquivalent = 50;
    else if (m.includes("slice")) gramEquivalent = 25;
    else if (m.includes("leaf") || m.includes("leaves")) gramEquivalent = 2;
    else if (m.includes("sprig")) gramEquivalent = 2;
    else if (m.includes("can") || m.includes("tin")) gramEquivalent = 400;
    else if (m.includes("bunch")) gramEquivalent = 100;
    return { quantity: qty, unit: "item", gramEquivalent };
  }

  return { quantity: 1, unit: "item", gramEquivalent: 50 };
}

function parseFraction(value: string): number {
  const cleaned = value.trim();
  // Mixed numbers: "1 1/2"
  const mixed = cleaned.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  }
  if (cleaned.includes("/")) {
    const [a, b] = cleaned.split("/").map(Number);
    if (b) return a / b;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
