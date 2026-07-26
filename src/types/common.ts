export type WeightUnit =
  | "g"
  | "kg"
  | "ml"
  | "L"
  | "item"
  | "tablespoon"
  | "teaspoon"
  | "cup";

export type IngredientCategory =
  | "meat"
  | "seafood"
  | "dairy"
  | "vegetables"
  | "fruits"
  | "grains"
  | "legumes"
  | "nuts"
  | "oils"
  | "spices"
  | "beverages"
  | "other";

export type RecipeCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "meal-prep"
  | "high-protein"
  | "low-calorie";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type StoreName =
  | "coles"
  | "woolworths"
  | "aldi"
  | "iga"
  | "costco"
  | "harris-farm";

export type ShoppingCategory =
  | "fruit"
  | "vegetables"
  | "meat"
  | "seafood"
  | "dairy"
  | "frozen"
  | "bakery"
  | "pantry"
  | "drinks"
  | "household"
  | "other";

export type UnitSystem = "metric" | "imperial";

export type ThemeMode = "dark" | "light" | "system";

export type DataSource = "live-api" | "cached" | "mock" | "manual";

export type Availability = "in-stock" | "out-of-stock" | "unknown";
