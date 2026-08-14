import { mealToDiscovered } from "../themealdb.provider";
import type { ThemealdbMeal } from "../themealdb.client";

test("mealToDiscovered estimates nutrition for a real TheMealDB-shaped meal", () => {
  const meal: ThemealdbMeal = {
    id: "52772",
    name: "Teriyaki Chicken Casserole",
    ingredients: [
      { rawName: "soy sauce", cleanedName: "Soy Sauce", measure: "3/4 cup" },
      { rawName: "water", cleanedName: "Water", measure: "1/2 cup" },
      { rawName: "brown sugar", cleanedName: "Brown Sugar", measure: "1/2 cup" },
      { rawName: "ground ginger", cleanedName: "Ground Ginger", measure: "1/2 teaspoon" },
      { rawName: "minced garlic", cleanedName: "Minced Garlic", measure: "1/2 teaspoon" },
      { rawName: "cornstarch", cleanedName: "Cornstarch", measure: "4 Tablespoons" },
      { rawName: "chicken breasts", cleanedName: "Chicken Breasts", measure: "2" },
      { rawName: "stir-fry vegetables", cleanedName: "Stir-Fry Vegetables", measure: "1 (12 oz.)" },
      { rawName: "brown rice", cleanedName: "Brown Rice", measure: "3 cups" },
    ],
  };
  const r = mealToDiscovered(meal);
  expect(r.caloriesPerServing).toBeGreaterThan(100);
  expect(r.proteinPerServing).toBeGreaterThan(5);
  expect(r.ingredients.length).toBe(9);
});
