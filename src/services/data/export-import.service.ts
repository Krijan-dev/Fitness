import type { Recipe } from "@/types/recipe";
import type { MealEntry, WeeklyMealPlan } from "@/types/meal";
import type { ShoppingItem } from "@/types/shopping";
import type { PantryItem } from "@/types/pantry";
import type { WeightEntry } from "@/types/weight";
import type { UserSettings } from "@/types/settings";
import { useRecipeStore } from "@/stores/recipe.store";
import { useDailyTrackerStore } from "@/stores/daily-tracker.store";
import { useMealPlannerStore } from "@/stores/meal-planner.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { usePantryStore } from "@/stores/pantry.store";
import { useWeightStore } from "@/stores/weight.store";
import { useSettingsStore } from "@/stores/settings.store";
import { usePriceComparisonStore } from "@/stores/price-comparison.store";
import { apiSend, syncInBackground } from "@/lib/api-client";

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
    recipes: useRecipeStore.getState().recipes,
    dailyMeals: useDailyTrackerStore.getState().meals,
    mealPlan: useMealPlannerStore.getState().plan,
    shoppingList: useShoppingListStore.getState().items,
    pantry: usePantryStore.getState().items,
    weightEntries: useWeightStore.getState().entries,
    settings: useSettingsStore.getState().settings,
    priceSelections: usePriceComparisonStore.getState().selections,
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
  useRecipeStore.setState({ recipes: data.recipes, hydrated: true });
  useDailyTrackerStore.setState({ meals: data.dailyMeals, hydrated: true });
  useMealPlannerStore.setState({ plan: data.mealPlan, hydrated: true });
  useShoppingListStore.setState({ items: data.shoppingList, hydrated: true });
  usePantryStore.setState({ items: data.pantry, hydrated: true });
  useWeightStore.setState({ entries: data.weightEntries, hydrated: true });
  useSettingsStore.setState({ settings: data.settings, hydrated: true });
  usePriceComparisonStore.setState({
    selections: data.priceSelections,
    hydrated: true,
  });

  syncInBackground(async () => {
    await Promise.all([
      apiSend("/api/recipes", "PUT", { recipes: data.recipes }),
      apiSend("/api/tracker", "PUT", { meals: data.dailyMeals }),
      apiSend("/api/planner", "PUT", {
        weekStart: data.mealPlan.weekStart,
        meals: data.mealPlan.meals,
        clientId: data.mealPlan.id,
        id: data.mealPlan.id,
      }),
      apiSend("/api/shopping", "PUT", { items: data.shoppingList }),
      apiSend("/api/pantry", "PUT", { items: data.pantry }),
      apiSend("/api/weights", "PUT", { entries: data.weightEntries }),
      apiSend("/api/settings", "PUT", {
        settings: data.settings,
        priceSelections: data.priceSelections,
      }),
    ]);
  });
}

export function clearAllAppData(): void {
  useRecipeStore.getState().reset();
  useDailyTrackerStore.getState().reset();
  useMealPlannerStore.getState().reset();
  useShoppingListStore.getState().reset();
  usePantryStore.getState().reset();
  useWeightStore.getState().reset();
  useSettingsStore.getState().reset();
  usePriceComparisonStore.getState().reset();
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
