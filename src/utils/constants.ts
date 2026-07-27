export const APP_NAME = "MealPrep Pro";

export { NAV_ITEMS, NAV_GROUPS, getNavLabelForPath } from "./nav";
export type { NavItem, NavGroup } from "./nav";

export const DEFAULT_CALORIE_GOAL = 2200;
export const DEFAULT_PROTEIN_GOAL = 150;
export const DEFAULT_CARB_GOAL = 250;
export const DEFAULT_FAT_GOAL = 70;

export const AUSTRALIAN_LOCATIONS = [
  "Canberra",
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Adelaide",
  "Perth",
  "Hobart",
  "Darwin",
] as const;
