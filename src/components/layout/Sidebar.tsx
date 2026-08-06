"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, NAV_GROUPS } from "@/utils/constants";
import { navIconMap } from "./nav-icons";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/Button";
import { LogOut, Shield } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside
      className="hidden lg:flex lg:w-[17.5rem] lg:flex-col lg:fixed lg:inset-y-4 lg:left-4 lg:z-30"
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-sidebar shadow-soft backdrop-blur-xl">
        <div className="flex h-16 items-center border-b border-border/70 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-glow">
              M
            </div>
            <div>
              <span className="block font-semibold tracking-tight text-foreground">
                {APP_NAME}
              </span>
              <span className="text-[11px] text-text-muted">Nutrition OS</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = navIconMap[item.icon];
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href));

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isActive
                              ? "bg-primary/15 text-primary shadow-glow"
                              : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon
                            className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-primary" : "text-text-muted group-hover:text-foreground"}`}
                            aria-hidden="true"
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-border/70 p-4 space-y-3">
          {user ? (
            <div className="rounded-2xl bg-surface-elevated/80 px-3 py-3">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin portal
                </Link>
              ) : null}
            </div>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              void logout().then(() => {
                window.location.href = "/login";
              });
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </aside>
  );
}
