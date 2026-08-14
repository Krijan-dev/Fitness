import { z } from "zod";

export const biologicalSexSchema = z.enum(["male", "female"], {
  message: "Select male or female",
});

export const nutritionGoalSchema = z.enum(
  ["weight-loss", "maintain", "muscle-gain"],
  { message: "Select a primary goal" }
);

export const activityLevelSchema = z.enum(
  ["sedentary", "lightly-active", "moderately-active", "very-active"],
  { message: "Select your activity level" }
);

export const onboardingSchema = z.object({
  age: z.coerce
    .number({ message: "Age is required" })
    .int("Age must be a whole number")
    .min(13, "You must be at least 13")
    .max(100, "Enter a realistic age"),
  gender: biologicalSexSchema,
  heightCm: z.coerce
    .number({ message: "Height is required" })
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be at most 250 cm"),
  currentWeightKg: z.coerce
    .number({ message: "Current weight is required" })
    .min(30, "Weight must be at least 30 kg")
    .max(300, "Weight must be at most 300 kg"),
  targetWeightKg: z.coerce
    .number({ message: "Target weight is required" })
    .min(30, "Target weight must be at least 30 kg")
    .max(300, "Target weight must be at most 300 kg"),
  goal: nutritionGoalSchema,
  activityLevel: activityLevelSchema,
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const onboardingStepFields = {
  0: ["age", "gender"],
  1: ["heightCm", "currentWeightKg", "targetWeightKg"],
  2: ["goal", "activityLevel"],
  3: [],
} as const;
