import { create } from "zustand";
import type { PlannedMeal, WeeklyMealPlan } from "@/types/meal";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";
import { generateId } from "@/utils/ids";
import { getWeekStart } from "@/utils/date";

interface MealPlannerState {
  plan: WeeklyMealPlan;
  hydrated: boolean;
  hydrate: () => void;
  addPlannedMeal: (meal: Omit<PlannedMeal, "id">) => void;
  updatePlannedMeal: (id: string, updates: Partial<PlannedMeal>) => void;
  removePlannedMeal: (id: string) => void;
  movePlannedMeal: (id: string, day: string, mealType?: PlannedMeal["mealType"]) => void;
  copyDay: (fromDay: string, toDay: string) => void;
  clearDay: (day: string) => void;
  clearWeek: () => void;
  reset: () => void;
}

const defaultPlan = (): WeeklyMealPlan => ({
  id: generateId(),
  weekStart: getWeekStart(),
  meals: [
    {
      id: "planned-1",
      recipeId: "recipe-1",
      recipeName: "Chicken & Rice Bowl",
      mealType: "lunch",
      day: "monday",
      servings: 1,
      nutrition: { calories: 462, protein: 57.4, carbs: 39.1, fat: 6.7 },
    },
    {
      id: "planned-2",
      recipeId: "recipe-3",
      recipeName: "Salmon & Broccoli",
      mealType: "dinner",
      day: "tuesday",
      servings: 1,
      nutrition: { calories: 467, protein: 44.2, carbs: 10.5, fat: 26.6 },
    },
    {
      id: "planned-3",
      recipeId: "recipe-2",
      recipeName: "Greek Yogurt Parfait",
      mealType: "breakfast",
      day: "wednesday",
      servings: 1,
      nutrition: { calories: 381, protein: 29.5, carbs: 55.5, fat: 7.9 },
    },
  ],
});

function loadPlan(): WeeklyMealPlan {
  const stored = localStorageService.getItem<WeeklyMealPlan>(STORAGE_KEYS.MEAL_PLANNER);
  if (stored && stored.meals) {
    return stored;
  }
  return defaultPlan();
}

export const useMealPlannerStore = create<MealPlannerState>((set, get) => ({
  plan: { id: "", weekStart: "", meals: [] },
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ plan: loadPlan(), hydrated: true });
  },

  addPlannedMeal: (meal) => {
    const newMeal: PlannedMeal = { ...meal, id: generateId() };
    const plan = {
      ...get().plan,
      meals: [...get().plan.meals, newMeal],
    };
    localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, plan);
    set({ plan });
  },

  removePlannedMeal: (id) => {
    const plan = {
      ...get().plan,
      meals: get().plan.meals.filter((m) => m.id !== id),
    };
    localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, plan);
    set({ plan });
  },

  updatePlannedMeal: (id, updates) => {
    const plan = {
      ...get().plan,
      meals: get().plan.meals.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    };
    localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, plan);
    set({ plan });
  },

  movePlannedMeal: (id, day, mealType) => {
    const plan = {
      ...get().plan,
      meals: get().plan.meals.map((m) =>
        m.id === id
          ? { ...m, day, mealType: mealType ?? m.mealType }
          : m
      ),
    };
    localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, plan);
    set({ plan });
  },

  copyDay: (fromDay, toDay) => {
    const copies = get()
      .plan.meals.filter((m) => m.day === fromDay)
      .map((m) => ({
        ...m,
        id: generateId(),
        day: toDay,
      }));
    const plan = {
      ...get().plan,
      meals: [...get().plan.meals, ...copies],
    };
    localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, plan);
    set({ plan });
  },

  clearDay: (day) => {
    const plan = {
      ...get().plan,
      meals: get().plan.meals.filter((m) => m.day !== day),
    };
    localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, plan);
    set({ plan });
  },

  clearWeek: () => {
    const plan = { ...get().plan, meals: [] };
    localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, plan);
    set({ plan });
  },

  reset: () => {
    const plan = defaultPlan();
    localStorageService.setItem(STORAGE_KEYS.MEAL_PLANNER, plan);
    set({ plan });
  },
}));
