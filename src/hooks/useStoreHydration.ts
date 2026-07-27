"use client";

import { useLayoutEffect, useState } from "react";
import { hydrateAllStores } from "@/services/storage/hydrate-stores";

/**
 * Hydrates persisted Zustand stores on the client before showing app content.
 * Uses local React state so the UI always re-renders after hydration (Zustand
 * `hydrated` flags alone can miss the first paint on initial load).
 */
export function useStoreHydration(): boolean {
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    hydrateAllStores();
    setIsReady(true);
  }, []);

  return isReady;
}
