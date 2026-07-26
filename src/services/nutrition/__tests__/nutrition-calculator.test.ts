import type { Ingredient } from "@/types/ingredient";
import {
  calculateIngredientNutrition,
  calculateNutritionPer100gCooked,
  calculateNutritionPerGram,
  calculateServingNutrition,
  sumNutrition,
} from "../nutrition-calculator.service";

const chicken: Ingredient = {
  id: "1",
  name: "Chicken breast",
  quantity: 200,
  unit: "g",
  caloriesPer100g: 165,
  proteinPer100g: 31,
  carbsPer100g: 0,
  fatPer100g: 3.6,
};

describe("nutrition-calculator", () => {
  it("calculates ingredient nutrition from grams", () => {
    const nutrition = calculateIngredientNutrition(chicken);
    expect(nutrition.calories).toBe(330);
    expect(nutrition.protein).toBe(62);
  });

  it("sums nutrition across ingredients", () => {
    const rice: Ingredient = {
      ...chicken,
      id: "2",
      name: "Rice",
      quantity: 100,
      unit: "g",
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
    };
    const total = sumNutrition([chicken, rice]);
    expect(total.calories).toBe(460);
    expect(total.protein).toBe(64.7);
  });

  it("calculates per-gram and per-100g cooked nutrition", () => {
    const total = sumNutrition([chicken]);
    const perGram = calculateNutritionPerGram(total, 180);
    expect(perGram.calories).toBeCloseTo(330 / 180, 5);

    const per100g = calculateNutritionPer100gCooked(total, 180);
    expect(per100g.calories).toBeCloseTo((330 / 180) * 100, 5);
  });

  it("calculates serving nutrition by weight ratio", () => {
    const total = sumNutrition([chicken]);
    const serving = calculateServingNutrition(total, 400, 200);
    expect(serving.calories).toBe(165);
    expect(serving.protein).toBe(31);
  });
});
