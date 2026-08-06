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
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAuthRoute) {
      void fetchUser();
    }
  }, [fetchUser, isAuthRoute]);

  const hydrated = useStoreHydration();

  if (isAuthRoute || isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background app-shell-bg">
      <SkipLink />
      <Sidebar />
      <div className="lg:pl-72">
        <TopBar />
        <main
          id="main-content"
          className="mx-auto max-w-6xl px-4 py-8 pb-28 lg:px-8 lg:pb-10"
        >
          {!hydrated ? (
            <LoadingState message="Loading your data..." />
          ) : (
            <ErrorBoundary>
              <div className="flex flex-col gap-10">{children}</div>
            </ErrorBoundary>
          )}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}

// Avoid hydrating API stores on public auth pages.
export function shouldHydrateAppData(pathname: string): boolean {
  return (
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/register") &&
    !pathname.startsWith("/forgot-password") &&
    !pathname.startsWith("/admin")
  );
}
