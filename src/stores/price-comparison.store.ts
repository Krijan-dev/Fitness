import { create } from "zustand";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";

/** Maps shopping list item IDs to selected StoreProductPrice IDs */
type PriceSelections = Record<string, string>;

interface PriceComparisonState {
  selections: PriceSelections;
  hydrated: boolean;
  hydrate: () => void;
  setSelection: (shoppingItemId: string, priceId: string) => void;
  clearSelections: () => void;
  reset: () => void;
}

function loadSelections(): PriceSelections {
  const stored = localStorageService.getItem<PriceSelections>(
    STORAGE_KEYS.PRICE_SELECTIONS
  );
  if (stored && typeof stored === "object") {
    return stored;
  }
  return {};
}

export const usePriceComparisonStore = create<PriceComparisonState>(
  (set, get) => ({
    selections: {},
    hydrated: false,

    hydrate: () => {
      if (get().hydrated) return;
      set({ selections: loadSelections(), hydrated: true });
    },

    setSelection: (shoppingItemId, priceId) => {
      const selections = { ...get().selections, [shoppingItemId]: priceId };
      localStorageService.setItem(STORAGE_KEYS.PRICE_SELECTIONS, selections);
      set({ selections });
    },

    clearSelections: () => {
      localStorageService.setItem(STORAGE_KEYS.PRICE_SELECTIONS, {});
      set({ selections: {} });
    },

    reset: () => {
      localStorageService.setItem(STORAGE_KEYS.PRICE_SELECTIONS, {});
      set({ selections: {} });
    },
  })
);
