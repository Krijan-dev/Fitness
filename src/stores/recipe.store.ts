import { create } from "zustand";
import type { Recipe } from "@/types/recipe";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";
import mockRecipes from "@/data/mock-recipes.json";
import { generateId } from "@/utils/ids";

interface RecipeState {
  recipes: Recipe[];
  hydrated: boolean;
  hydrate: () => void;
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
  reset: () => void;
}

function loadRecipes(): Recipe[] {
  const stored = localStorageService.getItem<Recipe[]>(STORAGE_KEYS.RECIPES);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  return mockRecipes as Recipe[];
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ recipes: loadRecipes(), hydrated: true });
  },

  addRecipe: (recipe) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const recipes = [...get().recipes, newRecipe];
    localStorageService.setItem(STORAGE_KEYS.RECIPES, recipes);
    set({ recipes });
  },

  updateRecipe: (id, updates) => {
    const recipes = get().recipes.map((r) =>
      r.id === id
        ? { ...r, ...updates, updatedAt: new Date().toISOString() }
        : r
    );
    localStorageService.setItem(STORAGE_KEYS.RECIPES, recipes);
    set({ recipes });
  },

  removeRecipe: (id) => {
    const recipes = get().recipes.filter((r) => r.id !== id);
    localStorageService.setItem(STORAGE_KEYS.RECIPES, recipes);
    set({ recipes });
  },

  reset: () => {
    localStorageService.removeItem(STORAGE_KEYS.RECIPES);
    set({ recipes: mockRecipes as Recipe[] });
    localStorageService.setItem(STORAGE_KEYS.RECIPES, mockRecipes as Recipe[]);
  },
}));
