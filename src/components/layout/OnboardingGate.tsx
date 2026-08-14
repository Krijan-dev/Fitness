"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Sends signed-in users who have not finished profile setup to /onboarding.
 */
export function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "admin") return;
    if (pathname.startsWith("/onboarding")) {
      if (user.onboardingCompleted) {
        router.replace("/dashboard");
      }
      return;
    }
    if (!user.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [loading, user, pathname, router]);

  return null;
}
