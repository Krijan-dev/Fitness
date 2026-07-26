import type { Recipe, DiscoveredRecipe } from "@/types/recipe";
import type { RecipeProvider } from "./recipe-provider.interface";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";

export class LocalRecipeProvider implements RecipeProvider {
  async searchRecipes(): Promise<DiscoveredRecipe[]> {
    return [];
  }

  async getRecipeById(id: string): Promise<DiscoveredRecipe | null> {
    const recipes = localStorageService.getItem<Recipe[]>(STORAGE_KEYS.RECIPES);
    const recipe = recipes?.find((r) => r.id === id);
    if (!recipe) return null;
    return recipe as unknown as DiscoveredRecipe;
  }

  getLocalRecipes(): Recipe[] {
    return localStorageService.getItem<Recipe[]>(STORAGE_KEYS.RECIPES) ?? [];
  }
}

export const localRecipeProvider = new LocalRecipeProvider();
