import { create } from "zustand";
import type { MealEntry } from "@/types/meal";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";
import mockDailyMeals from "@/data/mock-daily-meals.json";
import { generateId } from "@/utils/ids";
import { formatDate } from "@/utils/date";

interface DailyTrackerState {
  meals: MealEntry[];
  hydrated: boolean;
  hydrate: () => void;
  addMeal: (meal: Omit<MealEntry, "id">) => void;
  updateMeal: (id: string, updates: Partial<MealEntry>) => void;
  removeMeal: (id: string) => void;
  duplicateMeal: (id: string) => void;
  copyMealsFromDate: (fromDate: string, toDate: string) => void;
  clearDay: (date: string) => void;
  reset: () => void;
}

function loadMeals(): MealEntry[] {
  const stored = localStorageService.getItem<MealEntry[]>(STORAGE_KEYS.DAILY_TRACKER);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  return mockDailyMeals as MealEntry[];
}

export const useDailyTrackerStore = create<DailyTrackerState>((set, get) => ({
  meals: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ meals: loadMeals(), hydrated: true });
  },

  addMeal: (meal) => {
    const newMeal: MealEntry = { ...meal, id: generateId() };
    const meals = [...get().meals, newMeal];
    localStorageService.setItem(STORAGE_KEYS.DAILY_TRACKER, meals);
    set({ meals });
  },

  updateMeal: (id, updates) => {
    const meals = get().meals.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    localStorageService.setItem(STORAGE_KEYS.DAILY_TRACKER, meals);
    set({ meals });
  },

  removeMeal: (id) => {
    const meals = get().meals.filter((m) => m.id !== id);
    localStorageService.setItem(STORAGE_KEYS.DAILY_TRACKER, meals);
    set({ meals });
  },

  duplicateMeal: (id) => {
    const meal = get().meals.find((m) => m.id === id);
    if (!meal) return;
    const copy: MealEntry = { ...meal, id: generateId(), name: `${meal.name} (copy)` };
    const meals = [...get().meals, copy];
    localStorageService.setItem(STORAGE_KEYS.DAILY_TRACKER, meals);
    set({ meals });
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
    localStorageService.setItem(STORAGE_KEYS.DAILY_TRACKER, meals);
    set({ meals });
  },

  clearDay: (date) => {
    const meals = get().meals.filter((m) => m.date !== date);
    localStorageService.setItem(STORAGE_KEYS.DAILY_TRACKER, meals);
    set({ meals });
  },

  reset: () => {
    const meals = mockDailyMeals as MealEntry[];
    localStorageService.setItem(STORAGE_KEYS.DAILY_TRACKER, meals);
    set({ meals });
  },
}));

export function getTodayMeals(): MealEntry[] {
  const date = formatDate();
  return useDailyTrackerStore.getState().meals.filter((m) => m.date === date);
}
