export type BiologicalSex = "male" | "female";

export type NutritionGoal = "weight-loss" | "maintain" | "muscle-gain";

export type ActivityLevel =
  | "sedentary"
  | "lightly-active"
  | "moderately-active"
  | "very-active";

export interface BodyMetricsInput {
  age: number;
  gender: BiologicalSex;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goal: NutritionGoal;
  activityLevel: ActivityLevel;
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  proteinGramsPerKg: number;
  calorieAdjustment: number;
  activityMultiplier: number;
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  "lightly-active": 1.375,
  "moderately-active": 1.55,
  "very-active": 1.725,
};

/** Weight loss: ~0.5 kg/week. Muscle gain: midpoint of +300–500 kcal. */
export const CALORIE_ADJUSTMENTS: Record<NutritionGoal, number> = {
  "weight-loss": -500,
  maintain: 0,
  "muscle-gain": 400,
};

/**
 * Protein g per kg current body weight.
 * Weight loss uses 2.0 (midpoint of 1.8–2.2).
 */
export const PROTEIN_G_PER_KG: Record<NutritionGoal, number> = {
  "weight-loss": 2.0,
  maintain: 1.6,
  "muscle-gain": 2.0,
};

export const FAT_CALORIE_FRACTION = 0.25;
export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

export const GOAL_LABELS: Record<NutritionGoal, string> = {
  "weight-loss": "Weight Loss",
  maintain: "Maintain Weight",
  "muscle-gain": "Muscle Gain / Weight Gain",
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  "lightly-active": "Lightly Active",
  "moderately-active": "Moderately Active",
  "very-active": "Very Active",
};

export const ACTIVITY_HINTS: Record<ActivityLevel, string> = {
  sedentary: "Little to no exercise · ×1.2",
  "lightly-active": "Light exercise 1–3 days/week · ×1.375",
  "moderately-active": "Moderate exercise 3–5 days/week · ×1.55",
  "very-active": "Hard exercise 6–7 days/week · ×1.725",
};
