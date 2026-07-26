import type { MealEntry } from "@/types/meal";
import type { Nutrition } from "@/types/nutrition";

export function sumMealNutrition(meals: MealEntry[]): Nutrition {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.nutrition.calories,
      protein: acc.protein + meal.nutrition.protein,
      carbs: acc.carbs + meal.nutrition.carbs,
      fat: acc.fat + meal.nutrition.fat,
      fibre: (acc.fibre ?? 0) + (meal.nutrition.fibre ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 }
  );
}

export const MEAL_SECTIONS: Array<{
  type: MealEntry["mealType"];
  label: string;
}> = [
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "dinner", label: "Dinner" },
  { type: "snacks", label: "Snacks" },
];
