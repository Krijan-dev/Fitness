import type { Ingredient } from "@/types/ingredient";
import type { Nutrition } from "@/types/nutrition";
import { convertToGrams, calculateNutritionFromPer100g } from "@/utils/calculations";

export function getIngredientGrams(ingredient: Ingredient): number | null {
  const converted = convertToGrams(ingredient.quantity, ingredient.unit);
  if (converted !== null) {
    return converted;
  }
  if (
    ingredient.gramEquivalent !== undefined &&
    ingredient.gramEquivalent > 0
  ) {
    return ingredient.gramEquivalent;
  }
  return null;
}

export function calculateIngredientNutrition(ingredient: Ingredient): Nutrition {
  const grams = getIngredientGrams(ingredient);

  if (grams === null) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }

  return {
    calories: calculateNutritionFromPer100g(grams, ingredient.caloriesPer100g),
    protein: calculateNutritionFromPer100g(grams, ingredient.proteinPer100g),
    carbs: calculateNutritionFromPer100g(grams, ingredient.carbsPer100g),
    fat: calculateNutritionFromPer100g(grams, ingredient.fatPer100g),
    fibre: ingredient.fibrePer100g
      ? calculateNutritionFromPer100g(grams, ingredient.fibrePer100g)
      : undefined,
  };
}

export function sumNutrition(ingredients: Ingredient[]): Nutrition {
  const totals: Nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fibre: 0,
  };

  for (const ingredient of ingredients) {
    const nutrition = calculateIngredientNutrition(ingredient);
    totals.calories += nutrition.calories;
    totals.protein += nutrition.protein;
    totals.carbs += nutrition.carbs;
    totals.fat += nutrition.fat;
    if (nutrition.fibre) totals.fibre = (totals.fibre ?? 0) + nutrition.fibre;
  }

  return totals;
}

export function calculateTotalRawWeight(ingredients: Ingredient[]): number {
  return ingredients.reduce((total, ingredient) => {
    const grams = getIngredientGrams(ingredient);
    return total + (grams ?? 0);
  }, 0);
}

export function calculateNutritionPerGram(
  totalNutrition: Nutrition,
  cookedWeight: number
): Nutrition {
  if (cookedWeight <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  return {
    calories: totalNutrition.calories / cookedWeight,
    protein: totalNutrition.protein / cookedWeight,
    carbs: totalNutrition.carbs / cookedWeight,
    fat: totalNutrition.fat / cookedWeight,
    fibre: totalNutrition.fibre
      ? totalNutrition.fibre / cookedWeight
      : undefined,
  };
}

export function calculateNutritionPer100gCooked(
  totalNutrition: Nutrition,
  cookedWeight: number
): Nutrition {
  const perGram = calculateNutritionPerGram(totalNutrition, cookedWeight);
  return {
    calories: perGram.calories * 100,
    protein: perGram.protein * 100,
    carbs: perGram.carbs * 100,
    fat: perGram.fat * 100,
    fibre: perGram.fibre ? perGram.fibre * 100 : undefined,
  };
}

export function calculateServingNutrition(
  totalNutrition: Nutrition,
  cookedWeight: number,
  servingWeight: number
): Nutrition {
  if (cookedWeight <= 0 || servingWeight <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  const ratio = servingWeight / cookedWeight;

  return {
    calories: totalNutrition.calories * ratio,
    protein: totalNutrition.protein * ratio,
    carbs: totalNutrition.carbs * ratio,
    fat: totalNutrition.fat * ratio,
    fibre: totalNutrition.fibre ? totalNutrition.fibre * ratio : undefined,
  };
}

export function roundNutrition(nutrition: Nutrition): Nutrition {
  return {
    calories: Math.round(nutrition.calories),
    protein: Math.round(nutrition.protein * 10) / 10,
    carbs: Math.round(nutrition.carbs * 10) / 10,
    fat: Math.round(nutrition.fat * 10) / 10,
    fibre:
      nutrition.fibre !== undefined
        ? Math.round(nutrition.fibre * 10) / 10
        : undefined,
  };
}
