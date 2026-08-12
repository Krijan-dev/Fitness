"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings.store";

function resolveTheme(mode: "dark" | "light" | "system"): "dark" | "light" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

/**
 * Applies the user theme after settings hydrate.
 * Until then, keeps the SSR `data-theme="light"` so the emerald theme
 * does not flash back to a stale dark preference mid-load.
 */
export function ThemeApplier() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const hydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    // Auth/admin routes may never hydrate settings — leave SSR light theme.
    if (!hydrated) return;

    const root = document.documentElement;
    const apply = () => {
      root.setAttribute("data-theme", resolveTheme(theme));
    };

    apply();

    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, hydrated]);

  return null;
}
