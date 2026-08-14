"use client";

import Link from "next/link";
import { Menu, Settings, LogOut, Shield, X } from "lucide-react";
import { APP_NAME, NAV_GROUPS, getNavLabelForPath } from "@/utils/constants";
import { Button } from "@/components/common/Button";
import { useEffect, useState } from "react";
import { navIconMap } from "./nav-icons";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = getNavLabelForPath(pathname);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-xl safe-area-pt sm:h-16 sm:px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-11 w-11 shrink-0 p-0"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="truncate font-semibold text-foreground">
            {pageTitle}
          </span>
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="text-sm font-medium text-foreground">{pageTitle}</p>
          <p className="truncate text-xs text-muted-foreground">
            {pathname === "/dashboard"
              ? "Your nutrition and meal prep at a glance"
              : APP_NAME}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 p-0"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 top-0 flex w-80 max-w-[min(85vw,22rem)] flex-col border-r border-border bg-card shadow-xl safe-area-pt">
            <div className="mb-2 flex items-center justify-between px-5 pt-5">
              <span className="font-semibold">{APP_NAME}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-0"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto px-5 pb-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
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
                            onClick={() => setMenuOpen(false)}
                            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="space-y-3 border-t border-border p-4 safe-area-pb">
              {user ? (
                <div className="rounded-2xl border border-border bg-muted/70 px-3 py-3">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  {user.role === "admin" ? (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline"
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
                  setMenuOpen(false);
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
        </div>
      ) : null}
    </>
  );
}
