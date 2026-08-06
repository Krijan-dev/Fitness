import { create } from "zustand";
import type { WeightEntry } from "@/types/weight";
import { apiGet, apiSend, syncInBackground } from "@/lib/api-client";
import { generateId } from "@/utils/ids";

interface WeightState {
  entries: WeightEntry[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addEntry: (entry: Omit<WeightEntry, "id">) => void;
  updateEntry: (id: string, updates: Partial<WeightEntry>) => void;
  removeEntry: (id: string) => void;
  reset: () => void;
}

function persistAll(entries: WeightEntry[]) {
  syncInBackground(() => apiSend("/api/weights", "PUT", { entries }));
}

export const useWeightStore = create<WeightState>((set, get) => ({
  entries: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const res = await apiGet<{ data: WeightEntry[] }>("/api/weights");
      set({ entries: res.data, hydrated: true });
    } catch (error) {
      console.error("Failed to hydrate weights", error);
      set({ entries: [], hydrated: true });
    }
  },

  addEntry: (entry) => {
    const newEntry: WeightEntry = { ...entry, id: generateId() };
    const entries = [...get().entries, newEntry];
    set({ entries });
    syncInBackground(() => apiSend("/api/weights", "POST", newEntry));
  },

  updateEntry: (id, updates) => {
    const entries = get().entries.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    set({ entries });
    syncInBackground(() => apiSend(`/api/weights/${id}`, "PATCH", updates));
  },

  removeEntry: (id) => {
    const entries = get().entries.filter((e) => e.id !== id);
    set({ entries });
    syncInBackground(() => apiSend(`/api/weights/${id}`, "DELETE"));
  },

  reset: () => {
    set({ entries: [] });
    persistAll([]);
  },
}));
