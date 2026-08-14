import type { NutritionGoals } from "./nutrition";
import type { ThemeMode, UnitSystem } from "./common";
import type {
  ActivityLevel,
  BiologicalSex,
  NutritionGoal,
} from "./onboarding";

export interface LocationSettings {
  country: string;
  state: string;
  city: string;
  postcode?: string;
}

export interface ProfileSettings {
  displayName?: string;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  startingWeightKg?: number;
  age?: number;
  gender?: BiologicalSex;
  activityLevel?: ActivityLevel;
  goal?: NutritionGoal;
  onboardingCompleted?: boolean;
  bmr?: number;
  tdee?: number;
}

export interface UserSettings {
  profile: ProfileSettings;
  nutritionGoals: NutritionGoals;
  units: UnitSystem;
  location: LocationSettings;
  theme: ThemeMode;
}
