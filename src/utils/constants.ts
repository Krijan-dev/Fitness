export const APP_NAME = "MealPrep Pro";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/meal-calculator", label: "Meal Calculator", icon: "Calculator" },
  { href: "/recipes", label: "My Recipes", icon: "BookOpen" },
  { href: "/discover", label: "Discover Recipes", icon: "Compass" },
  { href: "/meal-planner", label: "Meal Planner", icon: "CalendarDays" },
  { href: "/daily-tracker", label: "Daily Tracker", icon: "Activity" },
  { href: "/shopping-list", label: "Shopping List", icon: "ShoppingCart" },
  { href: "/price-comparison", label: "Price Comparison", icon: "Tags" },
  { href: "/pantry", label: "Pantry", icon: "Package" },
  { href: "/weight-tracker", label: "Weight Tracker", icon: "Scale" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;

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
