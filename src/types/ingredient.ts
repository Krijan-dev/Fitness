import type { IngredientCategory, WeightUnit } from "./common";

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: WeightUnit;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fibrePer100g?: number;
  sugarPer100g?: number;
  sodiumPer100g?: number;
  category?: IngredientCategory;
  brand?: string;
  storeProductId?: string;
  notes?: string;
  /** Used when unit cannot be converted to grams (item, cup, etc.) */
  gramEquivalent?: number;
}

export interface IngredientDatabaseEntry {
  id: string;
  name: string;
  category: IngredientCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fibrePer100g?: number;
  defaultUnit: WeightUnit;
}
