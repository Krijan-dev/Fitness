import type { UnitSystem, ThemeMode } from "@/types/common";
import { AUSTRALIAN_LOCATIONS } from "@/utils/constants";

export const UNIT_OPTIONS: Array<{ value: UnitSystem; label: string }> = [
  { value: "metric", label: "Metric (g, kg, ml)" },
  { value: "imperial", label: "Imperial" },
];

export const THEME_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

export const LOCATION_CITY_OPTIONS = AUSTRALIAN_LOCATIONS.map((city) => ({
  value: city,
  label: city,
}));

export const AUSTRALIAN_STATES = [
  { value: "ACT", label: "ACT" },
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "SA", label: "SA" },
  { value: "WA", label: "WA" },
  { value: "TAS", label: "TAS" },
  { value: "NT", label: "NT" },
];

export type DataClearTarget =
  | "recipes"
  | "daily-tracker"
  | "meal-planner"
  | "shopping-list"
  | "pantry"
  | "weight-tracker"
  | "price-selections";

export const DATA_CLEAR_OPTIONS: Array<{
  value: DataClearTarget;
  label: string;
}> = [
  { value: "recipes", label: "Recipes" },
  { value: "daily-tracker", label: "Daily tracker" },
  { value: "meal-planner", label: "Meal planner" },
  { value: "shopping-list", label: "Shopping list" },
  { value: "pantry", label: "Pantry" },
  { value: "weight-tracker", label: "Weight tracker" },
  { value: "price-selections", label: "Price selections" },
];
