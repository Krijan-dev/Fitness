import { create } from "zustand";
import type { PantryItem } from "@/types/pantry";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";
import mockPantry from "@/data/mock-pantry.json";
import { generateId } from "@/utils/ids";

interface PantryState {
  items: PantryItem[];
  hydrated: boolean;
  hydrate: () => void;
  addItem: (item: Omit<PantryItem, "id">) => void;
  updateItem: (id: string, updates: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
  getLowStockItems: () => PantryItem[];
  reset: () => void;
}

function loadPantry(): PantryItem[] {
  const stored = localStorageService.getItem<PantryItem[]>(STORAGE_KEYS.PANTRY);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  return mockPantry as PantryItem[];
}

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ items: loadPantry(), hydrated: true });
  },

  addItem: (item) => {
    const newItem: PantryItem = { ...item, id: generateId() };
    const items = [...get().items, newItem];
    localStorageService.setItem(STORAGE_KEYS.PANTRY, items);
    set({ items });
  },

  updateItem: (id, updates) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    localStorageService.setItem(STORAGE_KEYS.PANTRY, items);
    set({ items });
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    localStorageService.setItem(STORAGE_KEYS.PANTRY, items);
    set({ items });
  },

  getLowStockItems: () => {
    return get().items.filter(
      (item) =>
        item.lowStockThreshold !== undefined &&
        item.quantity <= item.lowStockThreshold
    );
  },

  reset: () => {
    const items = mockPantry as PantryItem[];
    localStorageService.setItem(STORAGE_KEYS.PANTRY, items);
    set({ items });
  },
}));
