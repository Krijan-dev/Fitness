import type { Recipe } from "@/types/recipe";
import { filterRecipes, sortRecipes } from "../utils";

const recipes: Recipe[] = [
  {
    id: "1",
    name: "High Protein Bowl",
    category: "high-protein",
    ingredients: [{ id: "i1", name: "Chicken", quantity: 100, unit: "g", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 }],
    totalNutrition: { calories: 400, protein: 40, carbs: 30, fat: 10 },
    servingSize: 350,
    servings: 2,
    isFavourite: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
  {
    id: "2",
    name: "Oat Breakfast",
    category: "breakfast",
    ingredients: [{ id: "i2", name: "Oats", quantity: 80, unit: "g", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 }],
    totalNutrition: { calories: 200, protein: 10, carbs: 40, fat: 5 },
    servingSize: 300,
    servings: 1,
    isFavourite: false,
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
  },
];

describe("recipe utils", () => {
  it("filters favourites and search query", () => {
    const favourites = filterRecipes(recipes, "", "favourite");
    expect(favourites).toHaveLength(1);
    expect(favourites[0].name).toBe("High Protein Bowl");

    const byIngredient = filterRecipes(recipes, "oats", "all");
    expect(byIngredient).toHaveLength(1);
    expect(byIngredient[0].name).toBe("Oat Breakfast");
  });

  it("sorts recipes by calories and alphabetically", () => {
    const byCalories = sortRecipes(recipes, "calories");
    expect(byCalories[0].name).toBe("High Protein Bowl");

    const alpha = sortRecipes(recipes, "alphabetical");
    expect(alpha[0].name).toBe("High Protein Bowl");
    expect(alpha[1].name).toBe("Oat Breakfast");
  });
});
