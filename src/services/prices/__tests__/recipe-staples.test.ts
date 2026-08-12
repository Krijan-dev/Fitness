import {
  buildIngredientSearchQueries,
  findStaplePrice,
} from "../recipe-staples";
import { priceThemealdbMeal } from "../recipe-pricing.service";
import type { ThemealdbMeal } from "../../recipes/themealdb.client";

jest.mock("../../grocery/grocery-search.service", () => ({
  searchStorePrices: jest.fn(async () => ({ data: [], source: "empty" })),
}));

describe("recipe staples", () => {
  it("builds useful search query variants", () => {
    const queries = buildIngredientSearchQueries("Minced Garlic");
    expect(queries.some((q) => q.toLowerCase().includes("garlic"))).toBe(true);
  });

  it("maps cornstarch to cornflour", () => {
    const queries = buildIngredientSearchQueries("Cornstarch");
    expect(queries.some((q) => q.includes("cornflour"))).toBe(true);
  });

  it("finds Coles and ALDI staple prices for everyday items", () => {
    for (const item of [
      "chicken breast",
      "soy sauce",
      "garlic",
      "rice",
      "onion",
      "olive oil",
      "butter",
      "milk",
      "sugar",
      "eggs",
    ]) {
      expect(findStaplePrice(item, "coles")?.currentPrice).toBeGreaterThan(0);
      expect(findStaplePrice(item, "aldi")?.currentPrice).toBeGreaterThan(0);
      expect(findStaplePrice(item, "woolworths")?.currentPrice).toBeGreaterThan(
        0
      );
    }
  });
});

describe("priceThemealdbMeal staple fill", () => {
  it("does not mark common Coles/ALDI staples as missing when live search is empty", async () => {
    const meal: ThemealdbMeal = {
      id: "1",
      name: "Test stir fry",
      ingredients: [
        {
          rawName: "Chicken Breast",
          cleanedName: "Chicken Breast",
          measure: "400g",
        },
        { rawName: "Soy Sauce", cleanedName: "Soy Sauce", measure: "2 tbsp" },
        { rawName: "Garlic", cleanedName: "Garlic", measure: "2 cloves" },
        { rawName: "Rice", cleanedName: "Rice", measure: "2 cups" },
        { rawName: "Onion", cleanedName: "Onion", measure: "1" },
        { rawName: "Olive Oil", cleanedName: "Olive Oil", measure: "1 tbsp" },
      ],
    };

    const result = await priceThemealdbMeal(meal, "Canberra");

    for (const store of ["coles", "aldi", "woolworths"] as const) {
      const total = result.storeTotals.find((s) => s.store === store)!;
      expect(total.missingCount).toBe(0);
      expect(total.matchedCount).toBe(meal.ingredients.length);
      expect(total.total).toBeGreaterThan(0);
    }

    for (const line of result.ingredients) {
      for (const match of line.matches) {
        expect(match.missing).toBe(false);
        expect(match.product?.currentPrice).toBeGreaterThan(0);
      }
    }
  });
});
