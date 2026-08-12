import type { DiscoveredRecipe, RecipeSearchParams } from "@/types/recipe";
import type { Ingredient } from "@/types/ingredient";
import type { RecipeProvider } from "./recipe-provider.interface";
import {
  getThemealdbMealById,
  searchThemealdbMeals,
  type ThemealdbMeal,
} from "./themealdb.client";
import { THEMEALDB_BASE_URL } from "./themealdb.client";
import { generateId } from "@/utils/ids";

/**
 * Free TheMealDB recipe provider — no API key / billing.
 * https://www.themealdb.com/api.php
 */
export class ThemealdbRecipeProvider implements RecipeProvider {
  readonly id = "themealdb";

  async searchRecipes(params: RecipeSearchParams): Promise<DiscoveredRecipe[]> {
    const query = params.query?.trim();
    let meals: ThemealdbMeal[] = [];

    if (query) {
      meals = await searchThemealdbMeals(query);
    } else {
      // Browse: pull a few first-letter lists so Discover isn't empty
      const letters = ["a", "b", "c", "s"];
      const batches = await Promise.all(
        letters.map(async (letter) => {
          try {
            return await searchByFirstLetter(letter);
          } catch {
            return [] as ThemealdbMeal[];
          }
        })
      );
      const seen = new Set<string>();
      for (const batch of batches) {
        for (const meal of batch) {
          if (seen.has(meal.id)) continue;
          seen.add(meal.id);
          meals.push(meal);
        }
      }
    }

    let recipes = meals.map(mealToDiscovered);

    if (params.cuisine) {
      const c = params.cuisine.toLowerCase();
      recipes = recipes.filter((r) => r.cuisine?.toLowerCase() === c);
    }
    if (params.mealType) {
      const m = params.mealType.toLowerCase();
      recipes = recipes.filter(
        (r) =>
          r.mealType?.toLowerCase().includes(m) ||
          r.title.toLowerCase().includes(m)
      );
    }
    if (params.maxCookTime != null) {
      recipes = recipes.filter((r) => r.cookTimeMinutes <= params.maxCookTime!);
    }
    if (params.dietaryTags?.length) {
      const tags = params.dietaryTags.map((t) => t.toLowerCase());
      recipes = recipes.filter((r) =>
        tags.every(
          (tag) =>
            r.dietaryTags.some((t) => t.toLowerCase().includes(tag)) ||
            r.title.toLowerCase().includes(tag) ||
            r.description.toLowerCase().includes(tag)
        )
      );
    }
    if (params.maxCalories != null) {
      recipes = recipes.filter(
        (r) =>
          r.caloriesPerServing === 0 ||
          r.caloriesPerServing <= params.maxCalories!
      );
    }
    if (params.minProtein != null) {
      recipes = recipes.filter(
        (r) =>
          r.proteinPerServing === 0 ||
          r.proteinPerServing >= params.minProtein!
      );
    }

    return recipes;
  }

  async getRecipeById(id: string): Promise<DiscoveredRecipe | null> {
    const rawId = id.replace(/^themealdb-/, "");
    const meal = await getThemealdbMealById(rawId);
    return meal ? mealToDiscovered(meal) : null;
  }
}

async function searchByFirstLetter(letter: string): Promise<ThemealdbMeal[]> {
  const url = `${THEMEALDB_BASE_URL}/search.php?f=${encodeURIComponent(letter)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const body = (await res.json()) as {
    meals?: Record<string, string | null | undefined>[] | null;
  };
  if (!body.meals) return [];

  // Reuse client mapping via searchThemealdbMeals pattern — map inline
  const { extractIngredients } = await import("./themealdb.client");
  return body.meals.map((row) => ({
    id: String(row.idMeal ?? ""),
    name: String(row.strMeal ?? "Untitled meal"),
    thumbnail: row.strMealThumb || undefined,
    category: row.strCategory || undefined,
    area: row.strArea || undefined,
    instructions: row.strInstructions || undefined,
    youtubeUrl: row.strYoutube || undefined,
    sourceUrl: row.strSource || undefined,
    ingredients: extractIngredients(row),
  }));
}

export function mealToDiscovered(meal: ThemealdbMeal): DiscoveredRecipe {
  const instructions = (meal.instructions || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const ingredients: Ingredient[] = meal.ingredients.map((ing) => ({
    id: generateId(),
    name: ing.cleanedName || ing.rawName,
    quantity: 1,
    unit: "item",
    caloriesPer100g: 0,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
    notes: ing.measure ? `Measure: ${ing.measure}` : undefined,
  }));

  const dietaryTags: string[] = [];
  const cat = (meal.category || "").toLowerCase();
  if (cat.includes("vegetarian")) dietaryTags.push("Vegetarian");
  if (cat.includes("vegan")) dietaryTags.push("Vegan");
  if (cat.includes("starter") || cat.includes("breakfast")) {
    dietaryTags.push("Breakfast");
  }
  if (cat.includes("dessert")) dietaryTags.push("Snack");
  if (cat.includes("side")) dietaryTags.push("Side");
  if (cat.includes("seafood") || cat.includes("chicken") || cat.includes("beef")) {
    dietaryTags.push("High Protein");
  }

  return {
    id: `themealdb-${meal.id}`,
    title: meal.name,
    description: [meal.area, meal.category].filter(Boolean).join(" · ") ||
      "Recipe from TheMealDB",
    imageUrl: meal.thumbnail,
    cuisine: meal.area,
    mealType: meal.category,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 4,
    // TheMealDB does not provide nutrition — zeros until enriched elsewhere
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    ingredients,
    instructions,
    dietaryTags,
    difficulty: "medium",
    source: "TheMealDB",
    sourceUrl:
      meal.sourceUrl ||
      `https://www.themealdb.com/meal/${meal.id}`,
  };
}

export const themealdbRecipeProvider = new ThemealdbRecipeProvider();
