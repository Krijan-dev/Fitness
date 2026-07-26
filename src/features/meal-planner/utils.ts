import type { PlannedMeal } from "@/types/meal";
import type { Nutrition } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";
import {
  ingredientToShoppingCategory,
  mergeIngredientsToShoppingItems,
  toShoppingItems,
  type MergeableIngredient,
} from "@/utils/shopping-merge";
import type { ShoppingItem } from "@/types/shopping";
import { formatCurrency } from "@/utils/currency";

export function sumPlannedNutrition(meals: PlannedMeal[]): Nutrition {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.nutrition.calories,
      protein: acc.protein + meal.nutrition.protein,
      carbs: acc.carbs + meal.nutrition.carbs,
      fat: acc.fat + meal.nutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function estimateWeeklyGroceryCost(mealCount: number): number {
  return mealCount * 8.5;
}

export function generateShoppingFromPlan(
  plannedMeals: PlannedMeal[],
  recipes: Recipe[]
): ShoppingItem[] {
  const ingredients: MergeableIngredient[] = [];

  for (const planned of plannedMeals) {
    const recipe = recipes.find((r) => r.id === planned.recipeId);
    if (!recipe) continue;

    const ratio = planned.servings / (recipe.servings > 0 ? recipe.servings : 1);

    for (const ingredient of recipe.ingredients) {
      ingredients.push({
        name: ingredient.name,
        quantity: ingredient.quantity * ratio,
        unit: ingredient.unit,
        category: ingredientToShoppingCategory(ingredient),
        sourceRecipeIds: [recipe.id],
      });
    }
  }

  const merged = mergeIngredientsToShoppingItems(ingredients);
  return toShoppingItems(merged);
}

export function formatWeeklyCost(mealCount: number): string {
  return formatCurrency(estimateWeeklyGroceryCost(mealCount));
}

export const PLANNER_MEAL_SLOTS: Array<{
  type: PlannedMeal["mealType"];
  label: string;
}> = [
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "dinner", label: "Dinner" },
  { type: "snacks", label: "Snacks" },
];
