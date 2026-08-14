"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { hydrateAllStores } from "@/services/storage/hydrate-stores";

/**
 * Hydrates persisted Zustand stores on the client before showing app content.
 */
export function useStoreHydration(): boolean {
  const pathname = usePathname();
  const skip =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");
  const [isReady, setIsReady] = useState(skip);

  useLayoutEffect(() => {
    if (skip) {
      setIsReady(true);
      return;
    }
    let cancelled = false;
    setIsReady(false);
    void hydrateAllStores().finally(() => {
      if (!cancelled) setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [skip]);

  return isReady;
}
