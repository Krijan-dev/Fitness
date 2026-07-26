import type { DiscoveredRecipe, RecipeSearchParams } from "@/types/recipe";
import type { RecipeProvider } from "./recipe-provider.interface";
import mockDiscoveredRecipes from "@/data/mock-discovered-recipes.json";

export class MockRecipeProvider implements RecipeProvider {
  async searchRecipes(params: RecipeSearchParams): Promise<DiscoveredRecipe[]> {
    let results = mockDiscoveredRecipes as DiscoveredRecipe[];

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.ingredients.some((i) =>
            i.name.toLowerCase().includes(query)
          )
      );
    }

    if (params.cuisine) {
      results = results.filter(
        (r) => r.cuisine?.toLowerCase() === params.cuisine?.toLowerCase()
      );
    }

    if (params.mealType) {
      results = results.filter(
        (r) => r.mealType?.toLowerCase() === params.mealType?.toLowerCase()
      );
    }

    if (params.maxCalories) {
      results = results.filter((r) => r.caloriesPerServing <= params.maxCalories!);
    }

    if (params.minProtein) {
      results = results.filter((r) => r.proteinPerServing >= params.minProtein!);
    }

    if (params.dietaryTags?.length) {
      results = results.filter((r) =>
        params.dietaryTags!.some((tag) => r.dietaryTags.includes(tag))
      );
    }

    if (params.maxCookTime) {
      results = results.filter(
        (r) => r.prepTimeMinutes + r.cookTimeMinutes <= params.maxCookTime!
      );
    }

    return results;
  }

  async getRecipeById(id: string): Promise<DiscoveredRecipe | null> {
    const recipe = (mockDiscoveredRecipes as DiscoveredRecipe[]).find(
      (r) => r.id === id
    );
    return recipe ?? null;
  }
}

export const mockRecipeProvider = new MockRecipeProvider();
