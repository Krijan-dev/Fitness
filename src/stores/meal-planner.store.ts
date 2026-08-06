import { create } from "zustand";
import type { PlannedMeal, WeeklyMealPlan } from "@/types/meal";
import { apiGet, apiSend, syncInBackground } from "@/lib/api-client";
import { generateId } from "@/utils/ids";
import { getWeekStart } from "@/utils/date";

interface MealPlannerState {
  plan: WeeklyMealPlan;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addPlannedMeal: (meal: Omit<PlannedMeal, "id">) => void;
  updatePlannedMeal: (id: string, updates: Partial<PlannedMeal>) => void;
  removePlannedMeal: (id: string) => void;
  movePlannedMeal: (
    id: string,
    day: string,
    mealType?: PlannedMeal["mealType"]
  ) => void;
  copyDay: (fromDay: string, toDay: string) => void;
  clearDay: (day: string) => void;
  clearWeek: () => void;
  reset: () => void;
}

function emptyPlan(): WeeklyMealPlan {
  return { id: generateId(), weekStart: getWeekStart(), meals: [] };
}

function persistPlan(plan: WeeklyMealPlan) {
  syncInBackground(() =>
    apiSend("/api/planner", "PUT", {
      weekStart: plan.weekStart,
      meals: plan.meals,
      clientId: plan.id,
      id: plan.id,
    })
  );
}

export const useMealPlannerStore = create<MealPlannerState>((set, get) => ({
  plan: { id: "", weekStart: "", meals: [] },
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const weekStart = getWeekStart();
      const res = await apiGet<{ data: WeeklyMealPlan }>(
        `/api/planner?weekStart=${encodeURIComponent(weekStart)}`
      );
      set({ plan: res.data || emptyPlan(), hydrated: true });
    } catch (error) {
      console.error("Failed to hydrate planner", error);
      set({ plan: emptyPlan(), hydrated: true });
    }
  },

  addPlannedMeal: (meal) => {
    const newMeal: PlannedMeal = { ...meal, id: generateId() };
    const plan = {
      ...get().plan,
      meals: [...get().plan.meals, newMeal],
    };
    set({ plan });
    persistPlan(plan);
  },

  removePlannedMeal: (id) => {
    const plan = {
      ...get().plan,
      meals: get().plan.meals.filter((m) => m.id !== id),
    };
    set({ plan });
    persistPlan(plan);
  },

  updatePlannedMeal: (id, updates) => {
    const plan = {
      ...get().plan,
      meals: get().plan.meals.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    };
    set({ plan });
    persistPlan(plan);
  },

  movePlannedMeal: (id, day, mealType) => {
    const plan = {
      ...get().plan,
      meals: get().plan.meals.map((m) =>
        m.id === id ? { ...m, day, mealType: mealType ?? m.mealType } : m
      ),
    };
    set({ plan });
    persistPlan(plan);
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
    set({ plan });
    persistPlan(plan);
  },

  clearDay: (day) => {
    const plan = {
      ...get().plan,
      meals: get().plan.meals.filter((m) => m.day !== day),
    };
    set({ plan });
    persistPlan(plan);
  },

  clearWeek: () => {
    const plan = { ...get().plan, meals: [] };
    set({ plan });
    persistPlan(plan);
  },

  reset: () => {
    const plan = emptyPlan();
    set({ plan });
    persistPlan(plan);
  },
}));
