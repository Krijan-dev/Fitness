import { create } from "zustand";
import type { PantryItem } from "@/types/pantry";
import { apiGet, apiSend, syncInBackground } from "@/lib/api-client";
import { generateId } from "@/utils/ids";

interface PantryState {
  items: PantryItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addItem: (item: Omit<PantryItem, "id">) => void;
  updateItem: (id: string, updates: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
  getLowStockItems: () => PantryItem[];
  reset: () => void;
}

function persistAll(items: PantryItem[]) {
  syncInBackground(() => apiSend("/api/pantry", "PUT", { items }));
}

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const res = await apiGet<{ data: PantryItem[] }>("/api/pantry");
      set({ items: res.data, hydrated: true });
    } catch (error) {
      console.error("Failed to hydrate pantry", error);
      set({ items: [], hydrated: true });
    }
  },

  addItem: (item) => {
    const newItem: PantryItem = { ...item, id: generateId() };
    const items = [...get().items, newItem];
    set({ items });
    syncInBackground(() => apiSend("/api/pantry", "POST", newItem));
  },

  updateItem: (id, updates) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    set({ items });
    syncInBackground(() => apiSend(`/api/pantry/${id}`, "PATCH", updates));
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    syncInBackground(() => apiSend(`/api/pantry/${id}`, "DELETE"));
  },

  getLowStockItems: () => {
    return get().items.filter(
      (item) =>
        item.lowStockThreshold !== undefined &&
        item.quantity <= item.lowStockThreshold
    );
  },

  reset: () => {
    set({ items: [] });
    persistAll([]);
  },
}));
