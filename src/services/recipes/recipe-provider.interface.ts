import type { DiscoveredRecipe, RecipeSearchParams } from "@/types/recipe";

export interface RecipeProvider {
  searchRecipes(params: RecipeSearchParams): Promise<DiscoveredRecipe[]>;
  getRecipeById(id: string): Promise<DiscoveredRecipe | null>;
}
