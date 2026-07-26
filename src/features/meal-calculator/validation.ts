import type { Ingredient } from "@/types/ingredient";
import type { RecipeCategory } from "@/types/common";
import { isPositiveNumber, isValidString, isNonNegativeNumber } from "@/utils/validation";
import { getIngredientGrams } from "@/services/nutrition/nutrition-calculator.service";

export interface SaveRecipeFormData {
  name: string;
  category: RecipeCategory;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  notes: string;
  isFavourite: boolean;
}

export interface CalculatorValidation {
  cookedWeightError?: string;
  servingWeightError?: string;
  servingWeightWarning?: string;
}

export function validateIngredient(ingredient: Ingredient): string | null {
  if (!isValidString(ingredient.name)) {
    return "Ingredient name is required.";
  }
  if (!isPositiveNumber(ingredient.quantity)) {
    return "Quantity must be greater than zero.";
  }
  if (!isNonNegativeNumber(ingredient.caloriesPer100g)) {
    return "Calories per 100g must be a valid number.";
  }
  if (!isNonNegativeNumber(ingredient.proteinPer100g)) {
    return "Protein per 100g must be a valid number.";
  }
  if (!isNonNegativeNumber(ingredient.carbsPer100g)) {
    return "Carbs per 100g must be a valid number.";
  }
  if (!isNonNegativeNumber(ingredient.fatPer100g)) {
    return "Fat per 100g must be a valid number.";
  }
  if (getIngredientGrams(ingredient) === null) {
    return "Provide a gram equivalent for this unit.";
  }
  return null;
}

export function validateCookedAndServing(
  cookedWeight: number,
  servingWeight: number,
  hasCookedInput: boolean,
  hasServingInput: boolean
): CalculatorValidation {
  const result: CalculatorValidation = {};

  if (hasCookedInput && !isPositiveNumber(cookedWeight)) {
    result.cookedWeightError = "Cooked weight must be greater than zero.";
  }

  if (hasServingInput && !isPositiveNumber(servingWeight)) {
    result.servingWeightError = "Serving weight must be greater than zero.";
  }

  if (
    isPositiveNumber(cookedWeight) &&
    isPositiveNumber(servingWeight) &&
    servingWeight > cookedWeight
  ) {
    result.servingWeightWarning =
      "Serving weight is greater than cooked weight. Results may be inaccurate.";
  }

  return result;
}

export function validateSaveRecipeForm(form: SaveRecipeFormData): string | null {
  if (!isValidString(form.name)) {
    return "Recipe name is required.";
  }
  if (!isPositiveNumber(form.servings)) {
    return "Number of servings must be greater than zero.";
  }
  if (form.prepTimeMinutes < 0 || !Number.isFinite(form.prepTimeMinutes)) {
    return "Prep time must be a valid number.";
  }
  if (form.cookTimeMinutes < 0 || !Number.isFinite(form.cookTimeMinutes)) {
    return "Cook time must be a valid number.";
  }
  return null;
}

export function parseNumericInput(value: string): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
