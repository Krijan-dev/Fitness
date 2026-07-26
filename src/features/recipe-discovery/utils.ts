import type { DiscoveredRecipe } from "@/types/recipe";
import type { RecipeSearchParams } from "@/types/recipe";
import type { RecipeCategory } from "@/types/common";
import type { Ingredient } from "@/types/ingredient";
import type { Recipe } from "@/types/recipe";
import { generateId } from "@/utils/ids";

export type DiscoverFilter =
  | "all"
  | "high-protein"
  | "low-calorie"
  | "under-500"
  | "under-700"
  | "protein-30"
  | "protein-40"
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "meal-prep"
  | "under-15"
  | "under-30"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks";

export const DISCOVER_FILTER_OPTIONS: Array<{
  value: DiscoverFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "high-protein", label: "High Protein" },
  { value: "low-calorie", label: "Low Calorie" },
  { value: "under-500", label: "Under 500 cal" },
  { value: "under-700", label: "Under 700 cal" },
  { value: "protein-30", label: "30g+ Protein" },
  { value: "protein-40", label: "40g+ Protein" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten Free" },
  { value: "dairy-free", label: "Dairy Free" },
  { value: "meal-prep", label: "Meal Prep" },
  { value: "under-15", label: "Under 15 min" },
  { value: "under-30", label: "Under 30 min" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
];

export function discoverFilterToSearchParams(
  filter: DiscoverFilter
): RecipeSearchParams {
  switch (filter) {
    case "high-protein":
      return { dietaryTags: ["high-protein"] };
    case "low-calorie":
      return { dietaryTags: ["low-calorie"] };
    case "under-500":
      return { maxCalories: 500 };
    case "under-700":
      return { maxCalories: 700 };
    case "protein-30":
      return { minProtein: 30 };
    case "protein-40":
      return { minProtein: 40 };
    case "vegetarian":
      return { dietaryTags: ["vegetarian"] };
    case "vegan":
      return { dietaryTags: ["vegan"] };
    case "gluten-free":
      return { dietaryTags: ["gluten-free"] };
    case "dairy-free":
      return { dietaryTags: ["dairy-free"] };
    case "meal-prep":
      return { dietaryTags: ["meal-prep"] };
    case "under-15":
      return { maxCookTime: 15 };
    case "under-30":
      return { maxCookTime: 30 };
    case "breakfast":
      return { mealType: "breakfast" };
    case "lunch":
      return { mealType: "lunch" };
    case "dinner":
      return { mealType: "dinner" };
    case "snacks":
      return { mealType: "snack" };
    default:
      return {};
  }
}

export function buildRecipeSearchUrl(
  query: string,
  filter: DiscoverFilter
): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("query", query.trim());

  const filterParams = discoverFilterToSearchParams(filter);
  if (filterParams.cuisine) params.set("cuisine", filterParams.cuisine);
  if (filterParams.mealType) params.set("mealType", filterParams.mealType);
  if (filterParams.maxCalories)
    params.set("maxCalories", String(filterParams.maxCalories));
  if (filterParams.minProtein)
    params.set("minProtein", String(filterParams.minProtein));
  if (filterParams.maxCookTime)
    params.set("maxCookTime", String(filterParams.maxCookTime));
  if (filterParams.dietaryTags?.length)
    params.set("dietaryTags", filterParams.dietaryTags.join(","));

  const qs = params.toString();
  return qs ? `/api/recipes?${qs}` : "/api/recipes";
}

function mealTypeToCategory(mealType?: string): RecipeCategory {
  switch (mealType?.toLowerCase()) {
    case "breakfast":
      return "breakfast";
    case "lunch":
      return "lunch";
    case "dinner":
      return "dinner";
    case "snack":
    case "snacks":
      return "snack";
    default:
      return "meal-prep";
  }
}

export function discoveredToRecipe(
  discovered: DiscoveredRecipe
): Omit<Recipe, "id" | "createdAt" | "updatedAt"> {
  return {
    name: discovered.title,
    category: mealTypeToCategory(discovered.mealType),
    description: discovered.description,
    ingredients: discovered.ingredients.map((i) => ({
      ...i,
      id: generateId(),
    })),
    totalNutrition: {
      calories: discovered.caloriesPerServing * discovered.servings,
      protein: discovered.proteinPerServing * discovered.servings,
      carbs: discovered.carbsPerServing * discovered.servings,
      fat: discovered.fatPerServing * discovered.servings,
    },
    servingSize: 350,
    servings: discovered.servings,
    prepTimeMinutes: discovered.prepTimeMinutes,
    cookTimeMinutes: discovered.cookTimeMinutes,
    notes: discovered.source ? `Source: ${discovered.source}` : undefined,
    isFavourite: false,
    imageUrl: discovered.imageUrl,
  };
}

export function scaleIngredients(
  ingredients: Ingredient[],
  originalServings: number,
  targetServings: number
): Ingredient[] {
  if (originalServings <= 0 || targetServings <= 0) {
    return ingredients;
  }
  const ratio = targetServings / originalServings;
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: Math.round(ingredient.quantity * ratio * 100) / 100,
  }));
}

export function getTotalCookTime(recipe: DiscoveredRecipe): number {
  return recipe.prepTimeMinutes + recipe.cookTimeMinutes;
}
