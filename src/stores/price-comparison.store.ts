import { create } from "zustand";
import { apiSend, syncInBackground } from "@/lib/api-client";
import { useSettingsStore } from "@/stores/settings.store";

/** Maps shopping list item IDs to selected StoreProductPrice IDs */
type PriceSelections = Record<string, string>;

interface PriceComparisonState {
  selections: PriceSelections;
  hydrated: boolean;
  hydrate: () => void;
  hydrateFromServer: (selections: PriceSelections) => void;
  setSelection: (shoppingItemId: string, priceId: string) => void;
  clearSelections: () => void;
  reset: () => void;
}

function persistSelections(selections: PriceSelections) {
  const settings = useSettingsStore.getState().settings;
  syncInBackground(() =>
    apiSend("/api/settings", "PUT", { settings, priceSelections: selections })
  );
}

export const usePriceComparisonStore = create<PriceComparisonState>(
  (set, get) => ({
    selections: {},
    hydrated: false,

    hydrate: () => {
      // Hydrated via settings store; mark ready if already set.
      if (get().hydrated) return;
      set({ hydrated: true });
    },

    hydrateFromServer: (selections) => {
      set({ selections, hydrated: true });
    },

    setSelection: (shoppingItemId, priceId) => {
      const selections = { ...get().selections, [shoppingItemId]: priceId };
      set({ selections });
      persistSelections(selections);
    },

    clearSelections: () => {
      set({ selections: {} });
      persistSelections({});
    },

    reset: () => {
      set({ selections: {} });
      persistSelections({});
    },
  })
);
