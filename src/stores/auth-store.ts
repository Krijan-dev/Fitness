import { create } from "zustand";
import type { PublicUser } from "@/lib/auth";
import { apiGet, apiSend } from "@/lib/api-client";

interface AuthState {
  user: PublicUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  clearError: () => set({ error: null }),

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<{ user: PublicUser }>("/api/auth/me");
      set({
        user: res.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await apiSend<{ user: PublicUser }>("/api/auth/login", "POST", {
        email,
        password,
      });
      set({
        user: res.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
        user: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiSend<{ user: PublicUser }>(
        "/api/auth/register",
        "POST",
        input
      );
      set({
        user: res.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Registration failed",
        user: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await apiSend("/api/auth/logout", "POST");
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  },
}));
