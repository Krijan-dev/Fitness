"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNavigation } from "./MobileNavigation";
import { useStoreHydration } from "@/hooks/useStoreHydration";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SkipLink } from "./SkipLink";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const hydrated = useStoreHydration();

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
