export const STORAGE_KEYS = {
  RECIPES: "mealprep-pro:recipes",
  DAILY_TRACKER: "mealprep-pro:daily-tracker",
  MEAL_PLANNER: "mealprep-pro:meal-planner",
  SHOPPING_LIST: "mealprep-pro:shopping-list",
  PANTRY: "mealprep-pro:pantry",
  WEIGHT_TRACKER: "mealprep-pro:weight-tracker",
  SETTINGS: "mealprep-pro:settings",
  PRICE_SELECTIONS: "mealprep-pro:price-selections",
  RECENT_INGREDIENTS: "mealprep-pro:recent-ingredients",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
