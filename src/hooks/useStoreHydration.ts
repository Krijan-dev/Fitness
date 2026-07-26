"use client";

import { useEffect } from "react";
import { useRecipeStore } from "@/stores/recipe.store";
import { useDailyTrackerStore } from "@/stores/daily-tracker.store";
import { useMealPlannerStore } from "@/stores/meal-planner.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { usePantryStore } from "@/stores/pantry.store";
import { useWeightStore } from "@/stores/weight.store";
import { useSettingsStore } from "@/stores/settings.store";
import { usePriceComparisonStore } from "@/stores/price-comparison.store";

export function useStoreHydration(): boolean {
  const recipeHydrated = useRecipeStore((s) => s.hydrated);
  const dailyHydrated = useDailyTrackerStore((s) => s.hydrated);
  const plannerHydrated = useMealPlannerStore((s) => s.hydrated);
  const shoppingHydrated = useShoppingListStore((s) => s.hydrated);
  const pantryHydrated = usePantryStore((s) => s.hydrated);
  const weightHydrated = useWeightStore((s) => s.hydrated);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const priceHydrated = usePriceComparisonStore((s) => s.hydrated);

  useEffect(() => {
    useRecipeStore.getState().hydrate();
    useDailyTrackerStore.getState().hydrate();
    useMealPlannerStore.getState().hydrate();
    useShoppingListStore.getState().hydrate();
    usePantryStore.getState().hydrate();
    useWeightStore.getState().hydrate();
    useSettingsStore.getState().hydrate();
    usePriceComparisonStore.getState().hydrate();
  }, []);

  return (
    recipeHydrated &&
    dailyHydrated &&
    plannerHydrated &&
    shoppingHydrated &&
    pantryHydrated &&
    weightHydrated &&
    settingsHydrated &&
    priceHydrated
  );
}
