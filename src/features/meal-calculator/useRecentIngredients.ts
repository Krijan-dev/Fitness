"use client";

import { useCallback, useEffect, useState } from "react";
import type { IngredientDatabaseEntry } from "@/types/ingredient";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";
import { MAX_RECENT_INGREDIENTS } from "@/features/meal-calculator/constants";

export function useRecentIngredients(): {
  recent: IngredientDatabaseEntry[];
  addRecent: (entry: IngredientDatabaseEntry) => void;
  hydrated: boolean;
} {
  const [recent, setRecent] = useState<IngredientDatabaseEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorageService.getItem<IngredientDatabaseEntry[]>(
      STORAGE_KEYS.RECENT_INGREDIENTS
    );
    if (stored && Array.isArray(stored)) {
      setRecent(stored);
    }
    setHydrated(true);
  }, []);

  const addRecent = useCallback((entry: IngredientDatabaseEntry) => {
    setRecent((prev) => {
      const filtered = prev.filter((item) => item.id !== entry.id);
      const updated = [entry, ...filtered].slice(0, MAX_RECENT_INGREDIENTS);
      localStorageService.setItem(STORAGE_KEYS.RECENT_INGREDIENTS, updated);
      return updated;
    });
  }, []);

  return { recent, addRecent, hydrated };
}
