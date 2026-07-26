import type { Ingredient } from "./ingredient";
import type { Nutrition } from "./nutrition";
import type { RecipeCategory } from "./common";

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  description?: string;
  ingredients: Ingredient[];
  totalNutrition: Nutrition;
  cookedWeight?: number;
  servingSize: number;
  servings: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  notes?: string;
  isFavourite: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveredRecipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  cuisine?: string;
  mealType?: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  ingredients: Ingredient[];
  instructions: string[];
  dietaryTags: string[];
  difficulty?: "easy" | "medium" | "hard";
  source?: string;
  sourceUrl?: string;
}

export interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  mealType?: string;
  maxCalories?: number;
  minProtein?: number;
  dietaryTags?: string[];
  maxCookTime?: number;
}
