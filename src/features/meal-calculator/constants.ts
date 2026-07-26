import type { RecipeCategory } from "@/types/common";

export const RECIPE_CATEGORY_OPTIONS: Array<{
  value: RecipeCategory;
  label: string;
}> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "meal-prep", label: "Meal Prep" },
  { value: "high-protein", label: "High Protein" },
  { value: "low-calorie", label: "Low Calorie" },
];

export const MAX_RECENT_INGREDIENTS = 8;
