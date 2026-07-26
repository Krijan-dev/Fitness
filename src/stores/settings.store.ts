import { create } from "zustand";
import type { UserSettings } from "@/types/settings";
import { localStorageService } from "@/services/storage/localStorage.service";
import { STORAGE_KEYS } from "@/services/storage/storage.keys";
import {
  DEFAULT_CALORIE_GOAL,
  DEFAULT_PROTEIN_GOAL,
  DEFAULT_CARB_GOAL,
  DEFAULT_FAT_GOAL,
} from "@/utils/constants";

const defaultSettings: UserSettings = {
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
  hydrate: () => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateProfile: (updates: Partial<UserSettings["profile"]>) => void;
  updateNutritionGoals: (
    updates: Partial<UserSettings["nutritionGoals"]>
  ) => void;
  updateLocation: (updates: Partial<UserSettings["location"]>) => void;
  reset: () => void;
}

function loadSettings(): UserSettings {
  const stored = localStorageService.getItem<UserSettings>(STORAGE_KEYS.SETTINGS);
  if (stored) {
    return { ...defaultSettings, ...stored };
  }
  return defaultSettings;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ settings: loadSettings(), hydrated: true });
  },

  updateSettings: (updates) => {
    const settings = { ...get().settings, ...updates };
    localStorageService.setItem(STORAGE_KEYS.SETTINGS, settings);
    set({ settings });
  },

  updateProfile: (updates) => {
    const settings = {
      ...get().settings,
      profile: { ...get().settings.profile, ...updates },
    };
    localStorageService.setItem(STORAGE_KEYS.SETTINGS, settings);
    set({ settings });
  },

  updateNutritionGoals: (updates) => {
    const settings = {
      ...get().settings,
      nutritionGoals: { ...get().settings.nutritionGoals, ...updates },
    };
    localStorageService.setItem(STORAGE_KEYS.SETTINGS, settings);
    set({ settings });
  },

  updateLocation: (updates) => {
    const settings = {
      ...get().settings,
      location: { ...get().settings.location, ...updates },
    };
    localStorageService.setItem(STORAGE_KEYS.SETTINGS, settings);
    set({ settings });
  },

  reset: () => {
    localStorageService.setItem(STORAGE_KEYS.SETTINGS, defaultSettings);
    set({ settings: defaultSettings });
  },
}));
