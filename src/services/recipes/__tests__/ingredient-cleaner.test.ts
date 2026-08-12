import { cleanIngredientName } from "../themealdb.client";

describe("cleanIngredientName", () => {
  it("strips leading mass quantities", () => {
    expect(cleanIngredientName("500g Beef")).toBe("Beef");
    expect(cleanIngredientName("200 g chicken breast")).toMatch(/Chicken Breast/i);
  });

  it("strips spoon measures", () => {
    expect(cleanIngredientName("1 tsp Salt")).toBe("Salt");
    expect(cleanIngredientName("2 tbsp Olive Oil")).toMatch(/Olive Oil/i);
  });

  it("keeps plain ingredient names", () => {
    expect(cleanIngredientName("Beef mince")).toMatch(/Beef Mince/i);
    expect(cleanIngredientName("Garlic")).toBe("Garlic");
  });

  it("handles empty input", () => {
    expect(cleanIngredientName("")).toBe("");
    expect(cleanIngredientName("   ")).toBe("");
  });
});
