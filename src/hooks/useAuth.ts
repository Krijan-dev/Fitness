"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const clearError = useAuthStore((s) => s.clearError);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
