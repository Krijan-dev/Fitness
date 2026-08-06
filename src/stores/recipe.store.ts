import { create } from "zustand";
import type { Recipe } from "@/types/recipe";
import { apiGet, apiSend, syncInBackground } from "@/lib/api-client";
import { generateId } from "@/utils/ids";

interface RecipeState {
  recipes: Recipe[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
  reset: () => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const res = await apiGet<{ data: Recipe[] }>("/api/recipes");
      set({ recipes: res.data, hydrated: true });
    } catch (error) {
      console.error("Failed to hydrate recipes", error);
      set({ recipes: [], hydrated: true });
    }
  },

  addRecipe: (recipe) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const recipes = [...get().recipes, newRecipe];
    set({ recipes });
    syncInBackground(() => apiSend("/api/recipes", "POST", newRecipe));
  },

  updateRecipe: (id, updates) => {
    const recipes = get().recipes.map((r) =>
      r.id === id
        ? { ...r, ...updates, updatedAt: new Date().toISOString() }
        : r
    );
    set({ recipes });
    syncInBackground(() => apiSend(`/api/recipes/${id}`, "PATCH", updates));
  },

  removeRecipe: (id) => {
    const recipes = get().recipes.filter((r) => r.id !== id);
    set({ recipes });
    syncInBackground(() => apiSend(`/api/recipes/${id}`, "DELETE"));
  },

  reset: () => {
    set({ recipes: [] });
    syncInBackground(() =>
      apiSend("/api/recipes", "PUT", { recipes: [] })
    );
  },
}));
