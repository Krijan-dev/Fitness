import { useRecipeStore } from "@/stores/recipe.store";
import { useDailyTrackerStore } from "@/stores/daily-tracker.store";
import { useMealPlannerStore } from "@/stores/meal-planner.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { usePantryStore } from "@/stores/pantry.store";
import { useWeightStore } from "@/stores/weight.store";
import { useSettingsStore } from "@/stores/settings.store";
import { usePriceComparisonStore } from "@/stores/price-comparison.store";

/** Load all persisted stores from localStorage (client-only). */
export function hydrateAllStores(): void {
  useRecipeStore.getState().hydrate();
  useDailyTrackerStore.getState().hydrate();
  useMealPlannerStore.getState().hydrate();
  useShoppingListStore.getState().hydrate();
  usePantryStore.getState().hydrate();
  useWeightStore.getState().hydrate();
  useSettingsStore.getState().hydrate();
  usePriceComparisonStore.getState().hydrate();
}
