import type { RecipeCategory } from "@/types/common";
import type { RecipeFilterOption, RecipeSortOption } from "./utils";

export const RECIPE_FILTER_OPTIONS: Array<{
  value: RecipeFilterOption;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "meal-prep", label: "Meal Prep" },
  { value: "high-protein", label: "High Protein" },
  { value: "low-calorie", label: "Low Calorie" },
  { value: "favourite", label: "Favourite" },
];

export const RECIPE_SORT_OPTIONS: Array<{
  value: RecipeSortOption;
  label: string;
}> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "calories", label: "Calories" },
  { value: "protein", label: "Protein" },
  { value: "alphabetical", label: "Alphabetical" },
];

export const PLANNER_DAYS: Array<{ value: string; label: string }> = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export const MEAL_TYPE_OPTIONS: Array<{
  value: import("@/types/common").MealType;
  label: string;
}> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
];

export const CATEGORY_PLACEHOLDER_COLORS: Record<RecipeCategory, string> = {
  breakfast: "from-amber-500/20 to-orange-600/20",
  lunch: "from-emerald-500/20 to-teal-600/20",
  dinner: "from-indigo-500/20 to-purple-600/20",
  snack: "from-pink-500/20 to-rose-600/20",
  "meal-prep": "from-blue-500/20 to-cyan-600/20",
  "high-protein": "from-green-500/20 to-emerald-600/20",
  "low-calorie": "from-sky-500/20 to-blue-600/20",
};
