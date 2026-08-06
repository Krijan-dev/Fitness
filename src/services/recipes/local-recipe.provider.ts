import type { Recipe, DiscoveredRecipe, RecipeSearchParams } from "@/types/recipe";
import type { RecipeProvider } from "./recipe-provider.interface";
import { useRecipeStore } from "@/stores/recipe.store";

export class LocalRecipeProvider implements RecipeProvider {
  async searchRecipes(_params: RecipeSearchParams): Promise<DiscoveredRecipe[]> {
    return [];
  }

  async getRecipeById(id: string): Promise<DiscoveredRecipe | null> {
    const recipe = useRecipeStore.getState().recipes.find((r) => r.id === id);
    if (!recipe) return null;
    return recipe as unknown as DiscoveredRecipe;
  }

  getLocalRecipes(): Recipe[] {
    return useRecipeStore.getState().recipes;
  }
}

export const localRecipeProvider = new LocalRecipeProvider();
