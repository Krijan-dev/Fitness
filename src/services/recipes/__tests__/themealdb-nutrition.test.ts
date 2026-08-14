import {
  enrichThemealdbNutrition,
  parseMeasure,
  resolveGramEquivalent,
  matchNutritionProfile,
} from "../themealdb-nutrition";
import type { ThemealdbMeal } from "../themealdb.client";

describe("parseMeasure", () => {
  it("parses mass units into grams", () => {
    expect(parseMeasure("500g")).toEqual({ quantity: 500, unit: "g" });
    expect(parseMeasure("1.2 kg").quantity).toBeCloseTo(1200);
    expect(parseMeasure("1.2 kg").unit).toBe("g");
  });

  it("parses spoon and cup measures", () => {
    expect(parseMeasure("1 tbsp")).toEqual({
      quantity: 1,
      unit: "tablespoon",
    });
    expect(parseMeasure("½ tsp")).toEqual({ quantity: 0.5, unit: "teaspoon" });
    expect(parseMeasure("2 cups")).toEqual({ quantity: 2, unit: "cup" });
  });

  it("parses item counts with per-item gram hints", () => {
    const cloves = parseMeasure("8 cloves");
    expect(cloves.quantity).toBe(8);
    expect(cloves.unit).toBe("item");
    expect(cloves.gramEquivalent).toBe(3);
  });
});

describe("resolveGramEquivalent", () => {
  it("returns total grams for volume and item units", () => {
    expect(
      resolveGramEquivalent({ quantity: 2, unit: "tablespoon" })
    ).toBe(30);
    expect(resolveGramEquivalent({ quantity: 1, unit: "cup" })).toBe(240);
    expect(
      resolveGramEquivalent({ quantity: 8, unit: "item", gramEquivalent: 3 })
    ).toBe(24);
  });

  it("skips mass units (convertToGrams handles them)", () => {
    expect(resolveGramEquivalent({ quantity: 500, unit: "g" })).toBeUndefined();
  });
});

describe("enrichThemealdbNutrition", () => {
  it("estimates non-zero per-serving nutrition from ingredients", () => {
    const meal: ThemealdbMeal = {
      id: "1",
      name: "Test chicken rice",
      ingredients: [
        {
          rawName: "Chicken Breast",
          cleanedName: "Chicken Breast",
          measure: "400g",
        },
        { rawName: "Rice", cleanedName: "Rice", measure: "200g" },
        {
          rawName: "Olive Oil",
          cleanedName: "Olive Oil",
          measure: "1 tbsp",
        },
      ],
    };

    const result = enrichThemealdbNutrition(meal, 4);
    expect(result.estimated).toBe(true);
    expect(result.caloriesPerServing).toBeGreaterThan(50);
    expect(result.proteinPerServing).toBeGreaterThan(10);
    expect(result.ingredients).toHaveLength(3);
    // tbsp should carry a gramEquivalent so oil contributes calories
    const oil = result.ingredients.find((i) =>
      i.name.toLowerCase().includes("olive")
    );
    expect(oil?.gramEquivalent).toBe(15);
  });
});

describe("matchNutritionProfile", () => {
  it("matches known staples", () => {
    const chicken = matchNutritionProfile("Chicken Breast");
    expect(chicken.proteinPer100g).toBeGreaterThan(15);
    const oil = matchNutritionProfile("Olive Oil");
    expect(oil.fatPer100g).toBeGreaterThan(90);
  });
});
