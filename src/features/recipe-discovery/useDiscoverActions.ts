import type { DiscoveredRecipe } from "@/types/recipe";
import type { MealType } from "@/types/common";
import { useRecipeStore } from "@/stores/recipe.store";
import { useMealPlannerStore } from "@/stores/meal-planner.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { discoveredToRecipe } from "./utils";
import type { Ingredient } from "@/types/ingredient";
import type { ShoppingCategory } from "@/types/common";

function ingredientToShoppingCategory(
  ingredient: Ingredient
): ShoppingCategory {
  const map: Partial<Record<string, ShoppingCategory>> = {
    meat: "meat",
    seafood: "seafood",
    dairy: "dairy",
    vegetables: "vegetables",
    fruits: "fruit",
    grains: "pantry",
    oils: "pantry",
    other: "other",
  };
  return map[ingredient.category ?? "other"] ?? "other";
}

function mealTypeFromDiscovered(recipe: DiscoveredRecipe): MealType {
  switch (recipe.mealType?.toLowerCase()) {
    case "breakfast":
      return "breakfast";
    case "dinner":
      return "dinner";
    case "snack":
    case "snacks":
      return "snacks";
    default:
      return "lunch";
  }
}

export function useDiscoverActions() {
  const addRecipe = useRecipeStore((s) => s.addRecipe);
  const addPlannedMeal = useMealPlannerStore((s) => s.addPlannedMeal);
  const addShoppingItem = useShoppingListStore((s) => s.addItem);

  const saveToMyRecipes = (discovered: DiscoveredRecipe) => {
    addRecipe(discoveredToRecipe(discovered));
  };

  const addToMealPlanner = (
    discovered: DiscoveredRecipe,
    day: string,
    mealType: MealType,
    servings = 1
  ) => {
    addPlannedMeal({
      recipeId: discovered.id,
      recipeName: discovered.title,
      mealType,
      day,
      servings,
      nutrition: {
        calories: discovered.caloriesPerServing * servings,
        protein: discovered.proteinPerServing * servings,
        carbs: discovered.carbsPerServing * servings,
        fat: discovered.fatPerServing * servings,
      },
    });
  };

  const addIngredientsToShoppingList = (
    discovered: DiscoveredRecipe,
    ingredients: Ingredient[]
  ) => {
    for (const ingredient of ingredients) {
      addShoppingItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredientToShoppingCategory(ingredient),
        preferredBrand: ingredient.brand,
        purchased: false,
        sourceRecipeIds: [discovered.id],
      });
    }
  };

  return {
    saveToMyRecipes,
    addToMealPlanner,
    addIngredientsToShoppingList,
    defaultMealType: mealTypeFromDiscovered,
  };
}
