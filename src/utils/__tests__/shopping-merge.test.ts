import {
  mergeIngredients,
  mergeIngredientsToShoppingItems,
} from "@/utils/shopping-merge";

describe("shopping-merge", () => {
  it("merges ingredients with same name and unit", () => {
    const merged = mergeIngredients([
      {
        name: "Chicken breast",
        quantity: 500,
        unit: "g",
        category: "meat",
        sourceRecipeIds: ["a"],
      },
      {
        name: "Chicken Breast",
        quantity: 300,
        unit: "g",
        category: "meat",
        sourceRecipeIds: ["b"],
      },
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(800);
    expect(merged[0].sourceRecipeIds).toEqual(expect.arrayContaining(["a", "b"]));
  });

  it("maps merged items to shopping list shape", () => {
    const items = mergeIngredientsToShoppingItems([
      {
        name: "Oats",
        quantity: 1,
        unit: "kg",
        category: "pantry",
        sourceRecipeIds: ["r1"],
      },
    ]);

    expect(items[0]).toMatchObject({
      name: "Oats",
      quantity: 1,
      unit: "kg",
      category: "pantry",
      purchased: false,
    });
  });
});
