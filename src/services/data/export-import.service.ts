import type { Recipe } from "@/types/recipe";
import type { MealEntry, WeeklyMealPlan } from "@/types/meal";
import type { ShoppingItem } from "@/types/shopping";
import type { PantryItem } from "@/types/pantry";
import type { WeightEntry } from "@/types/weight";
import type { UserSettings } from "@/types/settings";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";

export const EXPORT_VERSION = "1.0";

export interface AppExportData {
  version: string;
  exportedAt: string;
  recipes: Recipe[];
  dailyMeals: MealEntry[];
  mealPlan: WeeklyMealPlan;
  shoppingList: ShoppingItem[];
  pantry: PantryItem[];
  weightEntries: WeightEntry[];
  settings: UserSettings;
  priceSelections: Record<string, string>;
}

export function collectExportData(): AppExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    recipes: localStorageService.getItem<Recipe[]>(STORAGE_KEYS.RECIPES) ?? [],
    dailyMeals:
      localStorageService.getItem<MealEntry[]>(STORAGE_KEYS.DAILY_TRACKER) ?? [],
    mealPlan:
      localStorageService.getItem<WeeklyMealPlan>(STORAGE_KEYS.MEAL_PLANNER) ?? {
        id: "",
        weekStart: "",
        meals: [],
      },
    shoppingList:
      localStorageService.getItem<ShoppingItem[]>(STORAGE_KEYS.SHOPPING_LIST) ?? [],
    pantry: localStorageService.getItem<PantryItem[]>(STORAGE_KEYS.PANTRY) ?? [],
    weightEntries:
      localStorageService.getItem<WeightEntry[]>(STORAGE_KEYS.WEIGHT_TRACKER) ?? [],
    settings:
      localStorageService.getItem<UserSettings>(STORAGE_KEYS.SETTINGS) ?? {
        profile: {},
        nutritionGoals: {
          dailyCalorieGoal: 2200,
          dailyProteinGoal: 150,
          dailyCarbGoal: 250,
          dailyFatGoal: 70,
        },
        units: "metric",
        location: { country: "Australia", state: "", city: "Canberra" },
        theme: "dark",
      },
    priceSelections:
      localStorageService.getItem<Record<string, string>>(
        STORAGE_KEYS.PRICE_SELECTIONS
      ) ?? {},
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function validateImportData(raw: unknown): AppExportData | null {
  if (!isObject(raw)) return null;

  const requiredArrays = [
    "recipes",
    "dailyMeals",
    "shoppingList",
    "pantry",
    "weightEntries",
  ] as const;

  for (const key of requiredArrays) {
    if (!isArray(raw[key])) return null;
  }

  if (!isObject(raw.mealPlan) || !isArray(raw.mealPlan.meals)) return null;
  if (!isObject(raw.settings)) return null;
  if (!isObject(raw.priceSelections)) return null;

  if (typeof raw.version !== "string" || typeof raw.exportedAt !== "string") {
    return null;
  }

  return raw as unknown as AppExportData;
}

export function applyImportData(data: AppExportData): void {
  localStorageService.setItem(STORAGE_KEYS.RECIPES, data.recipes);
  localStorageService.setItem(STORAGE_KEYS.DAILY_TRACKER, data.dailyMeals);
  localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, data.mealPlan);
  localStorageService.setItem(STORAGE_KEYS.SHOPPING_LIST, data.shoppingList);
  localStorageService.setItem(STORAGE_KEYS.PANTRY, data.pantry);
  localStorageService.setItem(STORAGE_KEYS.WEIGHT_TRACKER, data.weightEntries);
  localStorageService.setItem(STORAGE_KEYS.SETTINGS, data.settings);
  localStorageService.setItem(STORAGE_KEYS.PRICE_SELECTIONS, data.priceSelections);
}

export function clearAllAppData(): void {
  const keys = Object.values(STORAGE_KEYS);
  for (const key of keys) {
    localStorageService.removeItem(key);
  }
}

export function downloadJsonExport(data: AppExportData) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mealprep-pro-backup-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
