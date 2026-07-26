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
    <div className="min-h-screen bg-background">
      <SkipLink />
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main
          id="main-content"
          className="px-4 py-6 pb-24 lg:px-8 lg:pb-8 max-w-7xl mx-auto"
        >
          {!hydrated ? (
            <LoadingState message="Loading your data..." />
          ) : (
            <ErrorBoundary>{children}</ErrorBoundary>
          )}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
