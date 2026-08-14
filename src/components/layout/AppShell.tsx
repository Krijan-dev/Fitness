"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNavigation } from "./MobileNavigation";
import { useStoreHydration } from "@/hooks/useStoreHydration";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SkipLink } from "./SkipLink";
import { useAuthStore } from "@/stores/auth-store";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { OnboardingGate } from "./OnboardingGate";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAuthRoute) {
      void fetchUser();
    }
  }, [fetchUser, isAuthRoute]);

  const hydrated = useStoreHydration();

  if (isAuthRoute || isAdminRoute || isOnboardingRoute) {
    return (
      <>
        <OnboardingGate />
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background app-shell-bg">
      <OnboardingGate />
      <SkipLink />
      <Sidebar />
      <div className="lg:pl-[19rem]">
        <TopBar />
        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl overflow-x-clip px-3 py-5 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] sm:px-4 sm:py-8 lg:px-8 lg:pb-10"
        >
          {!hydrated ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
              <LoadingState message="Loading your workspace..." />
            </div>
          ) : (
            <ErrorBoundary>
              <div className="page-enter flex flex-col gap-8">{children}</div>
            </ErrorBoundary>
          )}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
