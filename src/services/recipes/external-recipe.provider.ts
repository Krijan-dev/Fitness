import type { DiscoveredRecipe, RecipeSearchParams } from "@/types/recipe";
import type { RecipeProvider } from "./recipe-provider.interface";

/**
 * Placeholder for future external recipe API integration (Spoonacular, Edamam, etc.).
 * API keys must only be used through Next.js server routes.
 */
export class ExternalRecipeProvider implements RecipeProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async searchRecipes(params: RecipeSearchParams): Promise<DiscoveredRecipe[]> {
    if (!this.apiKey || !this.baseUrl) {
      throw new Error("External recipe API is not configured.");
    }
    void params;
    return [];
  }

  async getRecipeById(id: string): Promise<DiscoveredRecipe | null> {
    if (!this.apiKey || !this.baseUrl) {
      throw new Error("External recipe API is not configured.");
    }
    void id;
    return null;
  }
}
