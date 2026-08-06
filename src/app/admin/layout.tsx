"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Scale,
  Settings,
  ShoppingCart,
  Users,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/common/Button";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/recipes", label: "Recipes", icon: BookOpen },
  { href: "/admin/tracker", label: "Tracker", icon: Activity },
  { href: "/admin/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/admin/weights", label: "Weights", icon: Scale },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/dashboard?error=forbidden");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-zinc-100 flex items-center justify-center">
        <LoadingState message="Loading admin..." />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold">403 Access Denied</h1>
          <p className="text-zinc-400">
            You need an admin account to view this area.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to app
          </Button>
        </div>
      </div>
    );
  }

  const nav = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed || mobileOpen ? <span>{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-zinc-100">
      <div className="lg:hidden flex items-center justify-between border-b border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">Admin</span>
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
          App
        </Link>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-white/10 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <span className="font-semibold">MealPrep Admin</span>
              <button type="button" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="lg:flex">
        <aside
          className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:flex-col border-r border-white/10 bg-[#111827] transition-all ${
            collapsed ? "lg:w-20" : "lg:w-64"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            {!collapsed ? (
              <span className="font-semibold tracking-tight">MealPrep Admin</span>
            ) : (
              <span className="mx-auto font-bold text-indigo-300">A</span>
            )}
            <button
              type="button"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
          {nav}
          <div className="border-t border-white/10 p-3 space-y-2">
            {!collapsed ? (
              <div className="px-2">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-300"
              onClick={() => {
                void logout().then(() => {
                  window.location.href = "/login";
                });
              }}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed ? "Log out" : null}
            </Button>
          </div>
        </aside>

        <main
          className={`flex-1 min-h-screen px-4 py-6 sm:px-6 lg:px-8 ${
            collapsed ? "lg:pl-28" : "lg:pl-72"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
