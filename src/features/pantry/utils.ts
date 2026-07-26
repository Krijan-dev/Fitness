import type { PantryItem } from "@/types/pantry";
import type { Recipe } from "@/types/recipe";
import { pantryHasIngredient } from "@/utils/ingredient-match";
import type { PantryFilterOption } from "./constants";
import { EXPIRY_WARNING_DAYS } from "./constants";

export interface RecipePantryMatch {
  recipe: Recipe;
  availableCount: number;
  totalCount: number;
  missingCount: number;
  matchPercentage: number;
  missingIngredients: string[];
}

export function filterPantryItems(
  items: PantryItem[],
  search: string,
  category: PantryFilterOption
): PantryItem[] {
  const query = search.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query)
    );
  });
}

export function isLowStock(item: PantryItem): boolean {
  return (
    item.lowStockThreshold !== undefined &&
    item.quantity <= item.lowStockThreshold
  );
}

export function isExpiringSoon(item: PantryItem, withinDays = EXPIRY_WARNING_DAYS): boolean {
  if (!item.expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(item.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= withinDays;
}

export function isExpired(item: PantryItem): boolean {
  if (!item.expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(item.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today;
}

export function matchRecipesToPantry(
  recipes: Recipe[],
  pantryItems: PantryItem[]
): RecipePantryMatch[] {
  const pantryNames = pantryItems
    .filter((p) => p.quantity > 0)
    .map((p) => p.name);

  return recipes
    .filter((r) => r.ingredients.length > 0)
    .map((recipe) => {
      const missingIngredients: string[] = [];
      let availableCount = 0;

      for (const ingredient of recipe.ingredients) {
        if (pantryHasIngredient(pantryNames, ingredient.name)) {
          availableCount += 1;
        } else {
          missingIngredients.push(ingredient.name);
        }
      }

      const totalCount = recipe.ingredients.length;
      const missingCount = missingIngredients.length;
      const matchPercentage =
        totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;

      return {
        recipe,
        availableCount,
        totalCount,
        missingCount,
        matchPercentage,
        missingIngredients,
      };
    })
    .sort((a, b) => {
      if (a.missingCount !== b.missingCount) {
        return a.missingCount - b.missingCount;
      }
      return b.matchPercentage - a.matchPercentage;
    });
}

export function groupCookMatches(matches: RecipePantryMatch[]) {
  return {
    canMakeNow: matches.filter((m) => m.missingCount === 0),
    missingOne: matches.filter((m) => m.missingCount === 1),
    missingTwo: matches.filter((m) => m.missingCount === 2),
  };
}
