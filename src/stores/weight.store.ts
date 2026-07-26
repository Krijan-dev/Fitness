import { create } from "zustand";
import type { WeightEntry } from "@/types/weight";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";
import mockWeightHistory from "@/data/mock-weight-history.json";
import { generateId } from "@/utils/ids";

interface WeightState {
  entries: WeightEntry[];
  hydrated: boolean;
  hydrate: () => void;
  addEntry: (entry: Omit<WeightEntry, "id">) => void;
  updateEntry: (id: string, updates: Partial<WeightEntry>) => void;
  removeEntry: (id: string) => void;
  reset: () => void;
}

function loadEntries(): WeightEntry[] {
  const stored = localStorageService.getItem<WeightEntry[]>(STORAGE_KEYS.WEIGHT_TRACKER);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  return mockWeightHistory as WeightEntry[];
}

export const useWeightStore = create<WeightState>((set, get) => ({
  entries: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ entries: loadEntries(), hydrated: true });
  },

  addEntry: (entry) => {
    const newEntry: WeightEntry = { ...entry, id: generateId() };
    const entries = [...get().entries, newEntry];
    localStorageService.setItem(STORAGE_KEYS.WEIGHT_TRACKER, entries);
    set({ entries });
  },

  updateEntry: (id, updates) => {
    const entries = get().entries.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    localStorageService.setItem(STORAGE_KEYS.WEIGHT_TRACKER, entries);
    set({ entries });
  },

  removeEntry: (id) => {
    const entries = get().entries.filter((e) => e.id !== id);
    localStorageService.setItem(STORAGE_KEYS.WEIGHT_TRACKER, entries);
    set({ entries });
  },

  reset: () => {
    const entries = mockWeightHistory as WeightEntry[];
    localStorageService.setItem(STORAGE_KEYS.WEIGHT_TRACKER, entries);
    set({ entries });
  },
}));
