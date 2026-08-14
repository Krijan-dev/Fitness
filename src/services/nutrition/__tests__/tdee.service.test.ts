import {
  calculateBmr,
  calculateNutritionTargets,
  calculateTdee,
} from "../tdee.service";

describe("Mifflin–St Jeor nutrition engine", () => {
  it("calculates male BMR", () => {
    // 80 kg, 180 cm, 30 y: 10*80 + 6.25*180 - 5*30 + 5 = 1780
    expect(calculateBmr(80, 180, 30, "male")).toBe(1780);
  });

  it("calculates female BMR", () => {
    // 65 kg, 165 cm, 28 y: 10*65 + 6.25*165 - 5*28 - 161 = 1380.25
    expect(calculateBmr(65, 165, 28, "female")).toBe(1380.25);
  });

  it("applies sedentary TDEE multiplier", () => {
    expect(calculateTdee(1780, "sedentary")).toBeCloseTo(2136);
  });

  it("sets a 500 kcal deficit for weight loss and protein at 2.0 g/kg", () => {
    const result = calculateNutritionTargets({
      age: 30,
      gender: "male",
      heightCm: 180,
      currentWeightKg: 80,
      targetWeightKg: 75,
      goal: "weight-loss",
      activityLevel: "sedentary",
    });

    expect(result.bmr).toBe(1780);
    expect(result.tdee).toBe(2136);
    expect(result.calorieAdjustment).toBe(-500);
    expect(result.targetCalories).toBe(1636);
    expect(result.targetProtein).toBe(160);
    expect(result.targetFats).toBe(Math.round((1636 * 0.25) / 9));
    const fatKcal = result.targetFats * 9;
    const proteinKcal = 160 * 4;
    expect(result.targetCarbs).toBe(
      Math.round((1636 - proteinKcal - fatKcal) / 4)
    );
  });

  it("keeps TDEE for maintain and uses 1.6 g/kg protein", () => {
    const result = calculateNutritionTargets({
      age: 30,
      gender: "male",
      heightCm: 180,
      currentWeightKg: 80,
      targetWeightKg: 80,
      goal: "maintain",
      activityLevel: "sedentary",
    });
    expect(result.targetCalories).toBe(2136);
    expect(result.targetProtein).toBe(128);
  });

  it("adds 400 kcal for muscle gain and 2.0 g/kg protein", () => {
    const result = calculateNutritionTargets({
      age: 30,
      gender: "male",
      heightCm: 180,
      currentWeightKg: 80,
      targetWeightKg: 85,
      goal: "muscle-gain",
      activityLevel: "very-active",
    });
    expect(result.activityMultiplier).toBe(1.725);
    expect(result.targetCalories).toBe(Math.round(1780 * 1.725 + 400));
    expect(result.targetProtein).toBe(160);
  });
});
