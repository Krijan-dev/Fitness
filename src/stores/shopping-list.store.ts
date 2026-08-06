import { create } from "zustand";
import type { ShoppingItem } from "@/types/shopping";
import { apiGet, apiSend, syncInBackground } from "@/lib/api-client";
import { generateId } from "@/utils/ids";

interface ShoppingListState {
  items: ShoppingItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addItem: (item: Omit<ShoppingItem, "id">) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeItem: (id: string) => void;
  togglePurchased: (id: string) => void;
  markAllPurchased: () => void;
  clearPurchased: () => void;
  reset: () => void;
}

function persistAll(items: ShoppingItem[]) {
  syncInBackground(() => apiSend("/api/shopping", "PUT", { items }));
}

export const useShoppingListStore = create<ShoppingListState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const res = await apiGet<{ data: ShoppingItem[] }>("/api/shopping");
      set({ items: res.data, hydrated: true });
    } catch (error) {
      console.error("Failed to hydrate shopping list", error);
      set({ items: [], hydrated: true });
    }
  },

  addItem: (item) => {
    const newItem: ShoppingItem = { ...item, id: generateId() };
    const items = [...get().items, newItem];
    set({ items });
    syncInBackground(() => apiSend("/api/shopping", "POST", newItem));
  },

  updateItem: (id, updates) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    set({ items });
    syncInBackground(() => apiSend(`/api/shopping/${id}`, "PATCH", updates));
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    syncInBackground(() => apiSend(`/api/shopping/${id}`, "DELETE"));
  },

  togglePurchased: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const purchased = !item.purchased;
    const items = get().items.map((i) =>
      i.id === id ? { ...i, purchased } : i
    );
    set({ items });
    syncInBackground(() =>
      apiSend(`/api/shopping/${id}`, "PATCH", { purchased })
    );
  },

  markAllPurchased: () => {
    const items = get().items.map((i) => ({ ...i, purchased: true }));
    set({ items });
    persistAll(items);
  },

  clearPurchased: () => {
    const items = get().items.filter((i) => !i.purchased);
    set({ items });
    persistAll(items);
  },

  reset: () => {
    set({ items: [] });
    persistAll([]);
  },
}));
