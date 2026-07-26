import { create } from "zustand";
import type { ShoppingItem } from "@/types/shopping";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";
import { generateId } from "@/utils/ids";

interface ShoppingListState {
  items: ShoppingItem[];
  hydrated: boolean;
  hydrate: () => void;
  addItem: (item: Omit<ShoppingItem, "id">) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeItem: (id: string) => void;
  togglePurchased: (id: string) => void;
  markAllPurchased: () => void;
  clearPurchased: () => void;
  reset: () => void;
}

const defaultItems: ShoppingItem[] = [
  {
    id: "shop-1",
    name: "Chicken breast",
    quantity: 1,
    unit: "kg",
    category: "meat",
    purchased: false,
  },
  {
    id: "shop-2",
    name: "Greek yogurt",
    quantity: 500,
    unit: "g",
    category: "dairy",
    purchased: false,
  },
  {
    id: "shop-3",
    name: "Broccoli",
    quantity: 2,
    unit: "item",
    category: "vegetables",
    purchased: true,
  },
  {
    id: "shop-4",
    name: "Oats",
    quantity: 1,
    unit: "kg",
    category: "pantry",
    purchased: false,
  },
  {
    id: "shop-5",
    name: "Bananas",
    quantity: 6,
    unit: "item",
    category: "fruit",
    purchased: false,
  },
];

function loadItems(): ShoppingItem[] {
  const stored = localStorageService.getItem<ShoppingItem[]>(STORAGE_KEYS.SHOPPING_LIST);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  return defaultItems;
}

export const useShoppingListStore = create<ShoppingListState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ items: loadItems(), hydrated: true });
  },

  addItem: (item) => {
    const newItem: ShoppingItem = { ...item, id: generateId() };
    const items = [...get().items, newItem];
    localStorageService.setItem(STORAGE_KEYS.SHOPPING_LIST, items);
    set({ items });
  },

  updateItem: (id, updates) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    localStorageService.setItem(STORAGE_KEYS.SHOPPING_LIST, items);
    set({ items });
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    localStorageService.setItem(STORAGE_KEYS.SHOPPING_LIST, items);
    set({ items });
  },

  togglePurchased: (id) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, purchased: !i.purchased } : i
    );
    localStorageService.setItem(STORAGE_KEYS.SHOPPING_LIST, items);
    set({ items });
  },

  markAllPurchased: () => {
    const items = get().items.map((i) => ({ ...i, purchased: true }));
    localStorageService.setItem(STORAGE_KEYS.SHOPPING_LIST, items);
    set({ items });
  },

  clearPurchased: () => {
    const items = get().items.filter((i) => !i.purchased);
    localStorageService.setItem(STORAGE_KEYS.SHOPPING_LIST, items);
    set({ items });
  },

  reset: () => {
    localStorageService.setItem(STORAGE_KEYS.SHOPPING_LIST, defaultItems);
    set({ items: defaultItems });
  },
}));
