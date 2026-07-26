import type { MealType } from "./common";
import type { Nutrition } from "./nutrition";

export interface MealEntry {
  id: string;
  name: string;
  servingAmount: number;
  nutrition: Nutrition;
  mealType: MealType;
  date: string;
  recipeId?: string;
  notes?: string;
}

export interface PlannedMeal {
  id: string;
  recipeId: string;
  recipeName: string;
  mealType: MealType;
  day: string;
  servings: number;
  nutrition: Nutrition;
}

export interface WeeklyMealPlan {
  id: string;
  weekStart: string;
  meals: PlannedMeal[];
}
