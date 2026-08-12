import { create } from "zustand";
import type { MealEntry } from "@/types/meal";
import { apiGet, apiSend, syncInBackground } from "@/lib/api-client";
import { generateId } from "@/utils/ids";
import { formatDate } from "@/utils/date";

interface DailyTrackerState {
  meals: MealEntry[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addMeal: (meal: Omit<MealEntry, "id">) => void;
  updateMeal: (id: string, updates: Partial<MealEntry>) => void;
  removeMeal: (id: string) => void;
  duplicateMeal: (id: string) => void;
  copyMealsFromDate: (fromDate: string, toDate: string) => void;
  clearDay: (date: string) => void;
  reset: () => void;
}

function persistMeals(meals: MealEntry[]) {
  syncInBackground(() => apiSend("/api/tracker", "PUT", { meals }));
}

export const useDailyTrackerStore = create<DailyTrackerState>((set, get) => ({
  meals: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const res = await apiGet<{ data: MealEntry[] }>("/api/tracker");
      set({ meals: res.data, hydrated: true });
    } catch (error) {
      console.error("Failed to hydrate tracker", error);
      set({ meals: [], hydrated: true });
    }
  },

  addMeal: (meal) => {
    const newMeal: MealEntry = { ...meal, id: generateId() };
    const meals = [...get().meals, newMeal];
    set({ meals });
    syncInBackground(() => apiSend("/api/tracker", "POST", newMeal));
  },

  updateMeal: (id, updates) => {
    const meals = get().meals.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    set({ meals });
    syncInBackground(() =>
      apiSend("/api/tracker", "PATCH", { id, ...updates })
    );
  },

  removeMeal: (id) => {
    const meals = get().meals.filter((m) => m.id !== id);
    set({ meals });
    syncInBackground(() =>
      apiSend(`/api/tracker?id=${encodeURIComponent(id)}`, "DELETE")
    );
  },

  duplicateMeal: (id) => {
    const meal = get().meals.find((m) => m.id === id);
    if (!meal) return;
    const copy: MealEntry = {
      ...meal,
      id: generateId(),
      name: `${meal.name} (copy)`,
    };
    const meals = [...get().meals, copy];
    set({ meals });
    syncInBackground(() => apiSend("/api/tracker", "POST", copy));
  },

  copyMealsFromDate: (fromDate, toDate) => {
    const copies = get()
      .meals.filter((m) => m.date === fromDate)
      .map((m) => ({
        ...m,
        id: generateId(),
        date: toDate,
      }));
    const meals = [...get().meals, ...copies];
    set({ meals });
    for (const copy of copies) {
      syncInBackground(() => apiSend("/api/tracker", "POST", copy));
    }
  },

  clearDay: (date) => {
    const meals = get().meals.filter((m) => m.date !== date);
    set({ meals });
    syncInBackground(() =>
      apiSend(`/api/tracker?date=${encodeURIComponent(date)}`, "DELETE")
    );
  },

  reset: () => {
    set({ meals: [] });
    persistMeals([]);
  },
}));

export function getTodayMeals(): MealEntry[] {
  const date = formatDate();
  return useDailyTrackerStore.getState().meals.filter((m) => m.date === date);
}
