import type {
  ActivityLevel,
  BiologicalSex,
  BodyMetricsInput,
  NutritionGoal,
  NutritionTargets,
} from "@/types/onboarding";
import {
  ACTIVITY_MULTIPLIERS,
  CALORIE_ADJUSTMENTS,
  FAT_CALORIE_FRACTION,
  KCAL_PER_G_CARB,
  KCAL_PER_G_FAT,
  KCAL_PER_G_PROTEIN,
  PROTEIN_G_PER_KG,
} from "@/types/onboarding";

/**
 * Mifflin–St Jeor BMR (kcal/day).
 * Male: (10 × kg) + (6.25 × cm) − (5 × age) + 5
 * Female: (10 × kg) + (6.25 × cm) − (5 × age) − 161
 */
export function calculateBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: BiologicalSex
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calorieAdjustmentForGoal(goal: NutritionGoal): number {
  return CALORIE_ADJUSTMENTS[goal];
}

function roundCalories(value: number): number {
  return Math.max(1200, Math.round(value));
}

function roundGrams(value: number): number {
  return Math.max(0, Math.round(value));
}

/**
 * Daily calorie and macro targets from body metrics + goal + activity.
 * Fats = 25% of target calories. Protein from g/kg. Carbs take the remainder.
 */
export function calculateNutritionTargets(
  input: BodyMetricsInput
): NutritionTargets {
  const bmr = calculateBmr(
    input.currentWeightKg,
    input.heightCm,
    input.age,
    input.gender
  );
  const activityMultiplier = ACTIVITY_MULTIPLIERS[input.activityLevel];
  const tdee = calculateTdee(bmr, input.activityLevel);
  const calorieAdjustment = calorieAdjustmentForGoal(input.goal);
  const targetCalories = roundCalories(tdee + calorieAdjustment);

  const proteinGramsPerKg = PROTEIN_G_PER_KG[input.goal];
  const targetProtein = roundGrams(input.currentWeightKg * proteinGramsPerKg);

  const fatCalories = targetCalories * FAT_CALORIE_FRACTION;
  const targetFats = roundGrams(fatCalories / KCAL_PER_G_FAT);

  const proteinCalories = targetProtein * KCAL_PER_G_PROTEIN;
  const usedCalories = proteinCalories + targetFats * KCAL_PER_G_FAT;
  const carbCalories = Math.max(0, targetCalories - usedCalories);
  const targetCarbs = roundGrams(carbCalories / KCAL_PER_G_CARB);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFats,
    proteinGramsPerKg,
    calorieAdjustment,
    activityMultiplier,
  };
}

export function isOnboardingMetricsComplete(
  profile: {
    age?: number;
    gender?: string;
    heightCm?: number;
    currentWeightKg?: number;
    onboardingCompleted?: boolean;
  } | undefined
): boolean {
  return Boolean(
    profile?.onboardingCompleted &&
      profile.age &&
      profile.gender &&
      profile.heightCm &&
      profile.currentWeightKg
  );
}
