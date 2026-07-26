import { validateSaveRecipeForm } from "@/features/meal-calculator/validation";

describe("meal calculator validation", () => {
  it("requires recipe name and valid servings", () => {
    expect(
      validateSaveRecipeForm({
        name: "",
        category: "meal-prep",
        description: "",
        servings: 1,
        prepTimeMinutes: 0,
        cookTimeMinutes: 0,
        notes: "",
        isFavourite: false,
      })
    ).toBe("Recipe name is required.");

    expect(
      validateSaveRecipeForm({
        name: "Test",
        category: "meal-prep",
        description: "",
        servings: 0,
        prepTimeMinutes: 0,
        cookTimeMinutes: 0,
        notes: "",
        isFavourite: false,
      })
    ).toBe("Number of servings must be greater than zero.");
  });
});
