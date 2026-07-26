import type { Ingredient } from "@/types/ingredient";
import type { ShoppingCategory } from "@/types/common";
import type { Recipe } from "@/types/recipe";
import type { MealType } from "@/types/common";
import { useRecipeStore } from "@/stores/recipe.store";
import { useDailyTrackerStore } from "@/stores/daily-tracker.store";
import { useMealPlannerStore } from "@/stores/meal-planner.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { formatDate } from "@/utils/date";
import {
  categoryToMealType,
  duplicateRecipeData,
  getPerServingNutrition,
} from "./utils";

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
    legumes: "pantry",
    nuts: "pantry",
    oils: "pantry",
    spices: "pantry",
    beverages: "drinks",
    other: "other",
  };
  return map[ingredient.category ?? "other"] ?? "other";
}

export function useRecipeActions() {
  const addRecipe = useRecipeStore((s) => s.addRecipe);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const removeRecipe = useRecipeStore((s) => s.removeRecipe);
  const addMeal = useDailyTrackerStore((s) => s.addMeal);
  const addPlannedMeal = useMealPlannerStore((s) => s.addPlannedMeal);
  const addShoppingItem = useShoppingListStore((s) => s.addItem);

  const toggleFavourite = (recipe: Recipe) => {
    updateRecipe(recipe.id, { isFavourite: !recipe.isFavourite });
  };

  const duplicateRecipe = (recipe: Recipe) => {
    addRecipe(duplicateRecipeData(recipe));
  };

  const deleteRecipe = (id: string) => {
    removeRecipe(id);
  };

  const addToDailyTracker = (recipe: Recipe, mealType?: MealType) => {
    const nutrition = getPerServingNutrition(recipe);
    addMeal({
      name: recipe.name,
      servingAmount: 1,
      nutrition,
      mealType: mealType ?? categoryToMealType(recipe.category),
      date: formatDate(),
      recipeId: recipe.id,
    });
  };

  const addToMealPlanner = (
    recipe: Recipe,
    day: string,
    mealType: MealType,
    servings = 1
  ) => {
    const perServing = getPerServingNutrition(recipe);
    addPlannedMeal({
      recipeId: recipe.id,
      recipeName: recipe.name,
      mealType,
      day,
      servings,
      nutrition: {
        calories: perServing.calories * servings,
        protein: perServing.protein * servings,
        carbs: perServing.carbs * servings,
        fat: perServing.fat * servings,
        fibre: perServing.fibre ? perServing.fibre * servings : undefined,
      },
    });
  };

  const addIngredientsToShoppingList = (recipe: Recipe) => {
    for (const ingredient of recipe.ingredients) {
      addShoppingItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredientToShoppingCategory(ingredient),
        preferredBrand: ingredient.brand,
        purchased: false,
        sourceRecipeIds: [recipe.id],
      });
    }
  };

  return {
    toggleFavourite,
    duplicateRecipe,
    deleteRecipe,
    addToDailyTracker,
    addToMealPlanner,
    addIngredientsToShoppingList,
    updateRecipe,
  };
}
