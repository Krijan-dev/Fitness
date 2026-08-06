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
      <div className="min-h-screen bg-[#0A0F1C] text-slate-100 flex items-center justify-center">
        <LoadingState message="Loading admin portal..." />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0A0F1C] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4 rounded-3xl border border-[#2B3548] bg-[#111827] p-8">
          <h1 className="text-2xl font-semibold tracking-tight">403 Access Denied</h1>
          <p className="text-slate-400">
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
        const isUpload = item.href === "/admin/recipes/new" && pathname.startsWith("/admin/recipes/new");
        const isActive = item.href === "/admin/recipes/new" ? isUpload : active;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_24px_rgba(34,197,94,0.18)]"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
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
    <div className="min-h-screen bg-[#0A0F1C] text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 0% 0%, rgba(34,197,94,0.12), transparent), radial-gradient(ellipse 50% 35% at 100% 0%, rgba(59,130,246,0.1), transparent)",
        }}
      />

      <div className="relative lg:hidden flex items-center justify-between border-b border-[#2B3548] px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold tracking-tight">Admin Portal</span>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
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
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-[#2B3548] bg-[#111827]">
            <div className="flex items-center justify-between border-b border-[#2B3548] px-4 py-4">
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
          className={`hidden lg:flex lg:fixed lg:inset-y-4 lg:left-4 lg:flex-col rounded-3xl border border-[#2B3548] bg-[#111827]/80 backdrop-blur-xl shadow-2xl transition-all ${
            collapsed ? "lg:w-20" : "lg:w-64"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-[#2B3548] px-4">
            {!collapsed ? (
              <div>
                <p className="font-semibold tracking-tight">MealPrep Admin</p>
                <p className="text-[11px] text-slate-500">Content & analytics</p>
              </div>
            ) : (
              <span className="mx-auto font-bold text-emerald-300">A</span>
            )}
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
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
          <div className="border-t border-[#2B3548] p-3 space-y-2">
            {!collapsed ? (
              <div className="px-2">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-300"
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
          <div className="page-enter mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
