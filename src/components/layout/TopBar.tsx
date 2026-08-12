"use client";

import Link from "next/link";
import { Menu, Settings } from "lucide-react";
import { APP_NAME, NAV_GROUPS, getNavLabelForPath } from "@/utils/constants";
import { Button } from "@/components/common/Button";
import { useState } from "react";
import { navIconMap } from "./nav-icons";
import { usePathname } from "next/navigation";

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = getNavLabelForPath(pathname);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-foreground truncate">
            {pageTitle}
          </span>
        </div>
        <div className="hidden lg:block min-w-0">
          <p className="text-sm font-medium text-foreground">{pageTitle}</p>
          <p className="text-xs text-muted-foreground truncate">
            {pathname === "/dashboard"
              ? "Your nutrition and meal prep at a glance"
              : APP_NAME}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="sm" aria-label="Settings">
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
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">{APP_NAME}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </Button>
            </div>
            <nav className="space-y-6">
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
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
