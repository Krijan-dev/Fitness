"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBasket,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/Button";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/recipes", label: "Recipe Management", icon: BookOpen },
  { href: "/admin/recipes/new", label: "Recipe Upload", icon: Upload },
  { href: "/admin/grocery", label: "Grocery", icon: ShoppingBasket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
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
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void fetchUser().finally(() => setChecked(true));
  }, [fetchUser]);

  if (!checked || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-muted text-foreground">
        <LoadingState message="Loading admin portal..." />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-muted p-6 text-foreground">
        <div className="max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
          <h1 className="text-2xl font-semibold tracking-tight">403 Access Denied</h1>
          <p className="text-muted-foreground">
            This portal is restricted to administrators.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Back to app</Button>
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
          (item.href !== "/admin" &&
            item.href !== "/admin/recipes/new" &&
            pathname.startsWith(item.href) &&
            !(item.href === "/admin/recipes" && pathname.startsWith("/admin/recipes/new")));
        const isUpload =
          item.href === "/admin/recipes/new" &&
          pathname.startsWith("/admin/recipes/new");
        const isActive = item.href === "/admin/recipes/new" ? isUpload : active;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-emerald-50 text-emerald-700 shadow-sm"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
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
    <div className="min-h-screen bg-background-muted text-foreground app-shell-bg">
      <div className="relative flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold tracking-tight">Admin Portal</span>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-emerald-700"
        >
          App
        </Link>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="font-semibold">MealPrep Admin</span>
              <button type="button" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="relative lg:flex">
        <aside
          className={`hidden lg:fixed lg:inset-y-4 lg:left-4 lg:flex lg:flex-col rounded-3xl border border-border bg-sidebar shadow-soft backdrop-blur-xl transition-all ${
            collapsed ? "lg:w-20" : "lg:w-64"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            {!collapsed ? (
              <div>
                <p className="font-semibold tracking-tight">MealPrep Admin</p>
                <p className="text-[11px] text-muted-foreground">Content & analytics</p>
              </div>
            ) : (
              <span className="mx-auto font-bold text-emerald-600">A</span>
            )}
            <button
              type="button"
              className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <div className="space-y-2 border-t border-border p-3">
            {!collapsed ? (
              <div className="rounded-2xl border border-border bg-muted/70 px-3 py-2">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
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
          className={`min-h-screen flex-1 px-4 py-6 sm:px-6 lg:px-8 ${
            collapsed ? "lg:pl-28" : "lg:pl-72"
          }`}
        >
          <div className="page-enter mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
