import { create } from "zustand";
import type { UserSettings } from "@/types/settings";
import { apiGet, apiSend, syncInBackground } from "@/lib/api-client";
import {
  DEFAULT_CALORIE_GOAL,
  DEFAULT_PROTEIN_GOAL,
  DEFAULT_CARB_GOAL,
  DEFAULT_FAT_GOAL,
} from "@/utils/constants";

export const defaultSettings: UserSettings = {
  profile: {
    displayName: "User",
    heightCm: 178,
    currentWeightKg: 81.2,
    targetWeightKg: 78,
  },
  nutritionGoals: {
    dailyCalorieGoal: DEFAULT_CALORIE_GOAL,
    dailyProteinGoal: DEFAULT_PROTEIN_GOAL,
    dailyCarbGoal: DEFAULT_CARB_GOAL,
    dailyFatGoal: DEFAULT_FAT_GOAL,
  },
  units: "metric",
  location: {
    country: "Australia",
    state: "ACT",
    city: "Canberra",
    postcode: "2600",
  },
  theme: "dark",
};

interface SettingsState {
  settings: UserSettings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateProfile: (updates: Partial<UserSettings["profile"]>) => void;
  updateNutritionGoals: (
    updates: Partial<UserSettings["nutritionGoals"]>
  ) => void;
  updateLocation: (updates: Partial<UserSettings["location"]>) => void;
  reset: () => void;
}

function persistSettings(
  settings: UserSettings,
  priceSelections?: Record<string, string>
) {
  syncInBackground(() =>
    apiSend("/api/settings", "PUT", { settings, priceSelections })
  );
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const res = await apiGet<{
        data: {
          settings: UserSettings;
          priceSelections: Record<string, string>;
        };
      }>("/api/settings");
      set({
        settings: { ...defaultSettings, ...res.data.settings },
        hydrated: true,
      });
      const { usePriceComparisonStore } = await import(
        "@/stores/price-comparison.store"
      );
      usePriceComparisonStore
        .getState()
        .hydrateFromServer(res.data.priceSelections || {});
    } catch (error) {
      console.error("Failed to hydrate settings", error);
      set({ settings: defaultSettings, hydrated: true });
    }
  },

  updateSettings: (updates) => {
    const settings = { ...get().settings, ...updates };
    set({ settings });
    persistSettings(settings);
  },

  updateProfile: (updates) => {
    const settings = {
      ...get().settings,
      profile: { ...get().settings.profile, ...updates },
    };
    set({ settings });
    persistSettings(settings);
  },

  updateNutritionGoals: (updates) => {
    const settings = {
      ...get().settings,
      nutritionGoals: { ...get().settings.nutritionGoals, ...updates },
    };
    set({ settings });
    persistSettings(settings);
  },

  updateLocation: (updates) => {
    const settings = {
      ...get().settings,
      location: { ...get().settings.location, ...updates },
    };
    set({ settings });
    persistSettings(settings);
  },

  reset: () => {
    set({ settings: defaultSettings });
    persistSettings(defaultSettings, {});
  },
}));
