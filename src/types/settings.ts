import type { NutritionGoals } from "./nutrition";
import type { ThemeMode, UnitSystem } from "./common";

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
}

export interface UserSettings {
  profile: ProfileSettings;
  nutritionGoals: NutritionGoals;
  units: UnitSystem;
  location: LocationSettings;
  theme: ThemeMode;
}
