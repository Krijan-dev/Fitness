import { UserSettings } from "@/models/UserSettings";
import { calculateNutritionTargets } from "@/services/nutrition/tdee.service";
import type { OnboardingFormValues } from "@/lib/onboarding-schema";
import type { UserSettings as UserSettingsType } from "@/types/settings";
import { settingsToDb, toClientSettings } from "@/lib/mappers";

export async function getOnboardingCompleted(userId: string): Promise<boolean> {
  const doc = await UserSettings.findOne({ userId })
    .select("profile.onboardingCompleted")
    .lean();
  const profile = doc?.profile as { onboardingCompleted?: boolean } | undefined;
  return Boolean(profile?.onboardingCompleted);
}

export async function saveOnboardingProfile(
  userId: string,
  input: OnboardingFormValues,
  displayName?: string
): Promise<UserSettingsType> {
  const targets = calculateNutritionTargets(input);
  const existing = await UserSettings.findOne({ userId });
  const current = toClientSettings(existing);
  const startingWeightKg =
    current.profile.startingWeightKg ?? input.currentWeightKg;

  const merged: UserSettingsType = {
    ...current,
    profile: {
      ...current.profile,
      displayName: displayName || current.profile.displayName,
      heightCm: input.heightCm,
      currentWeightKg: input.currentWeightKg,
      targetWeightKg: input.targetWeightKg,
      startingWeightKg,
      age: input.age,
      gender: input.gender,
      activityLevel: input.activityLevel,
      goal: input.goal,
      onboardingCompleted: true,
      bmr: targets.bmr,
      tdee: targets.tdee,
    },
    nutritionGoals: {
      dailyCalorieGoal: targets.targetCalories,
      dailyProteinGoal: targets.targetProtein,
      dailyCarbGoal: targets.targetCarbs,
      dailyFatGoal: targets.targetFats,
    },
  };

  const doc = await UserSettings.findOneAndUpdate(
    { userId },
    {
      $set: settingsToDb(merged),
      $setOnInsert: { userId },
    },
    { upsert: true, new: true }
  );

  return toClientSettings(doc);
}
