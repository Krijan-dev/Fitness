import type { Recipe } from "@/types/recipe";
import { generateId } from "@/utils/ids";
import type { Nutrition } from "@/types/nutrition";
import type { RecipeCategory } from "@/types/common";
import type { MealType } from "@/types/common";
import { calculateServingNutrition } from "@/services/nutrition/nutrition-calculator.service";

export type RecipeSortOption =
  | "newest"
  | "oldest"
  | "calories"
  | "protein"
  | "alphabetical";

export type RecipeFilterOption =
  | "all"
  | RecipeCategory
  | "favourite";

export function getPerServingNutrition(recipe: Recipe): Nutrition {
  if (recipe.cookedWeight && recipe.cookedWeight > 0 && recipe.servingSize > 0) {
    return calculateServingNutrition(
      recipe.totalNutrition,
      recipe.cookedWeight,
      recipe.servingSize
    );
  }

  const servings = recipe.servings > 0 ? recipe.servings : 1;
  return {
    calories: recipe.totalNutrition.calories / servings,
    protein: recipe.totalNutrition.protein / servings,
    carbs: recipe.totalNutrition.carbs / servings,
    fat: recipe.totalNutrition.fat / servings,
    fibre: recipe.totalNutrition.fibre
      ? recipe.totalNutrition.fibre / servings
      : undefined,
  };
}

export function categoryToMealType(category: RecipeCategory): MealType {
  switch (category) {
    case "breakfast":
      return "breakfast";
    case "lunch":
    case "meal-prep":
    case "high-protein":
    case "low-calorie":
      return "lunch";
    case "dinner":
      return "dinner";
    case "snack":
      return "snacks";
    default:
      return "lunch";
  }
}

export function formatCategoryLabel(category: RecipeCategory): string {
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function filterRecipes(
  recipes: Recipe[],
  search: string,
  filter: RecipeFilterOption
): Recipe[] {
  let result = [...recipes];

  if (filter === "favourite") {
    result = result.filter((r) => r.isFavourite);
  } else if (filter !== "all") {
    result = result.filter((r) => r.category === filter);
  }

  if (search.trim()) {
    const query = search.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(query))
    );
  }

  return result;
}

export function sortRecipes(
  recipes: Recipe[],
  sort: RecipeSortOption
): Recipe[] {
  const sorted = [...recipes];

  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "calories":
      return sorted.sort(
        (a, b) =>
          getPerServingNutrition(b).calories - getPerServingNutrition(a).calories
      );
    case "protein":
      return sorted.sort(
        (a, b) =>
          getPerServingNutrition(b).protein - getPerServingNutrition(a).protein
      );
    case "alphabetical":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function duplicateRecipeData(recipe: Recipe): Omit<
  Recipe,
  "id" | "createdAt" | "updatedAt"
> {
  return {
    ...recipe,
    name: `${recipe.name} (Copy)`,
    ingredients: recipe.ingredients.map((i) => ({ ...i, id: generateId() })),
    isFavourite: false,
  };
}
