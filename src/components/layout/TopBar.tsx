"use client";

import Link from "next/link";
import { Menu, Settings } from "lucide-react";
import { APP_NAME } from "@/utils/constants";
import { Button } from "@/components/common/Button";
import { useState } from "react";
import { NAV_ITEMS } from "@/utils/constants";
import { navIconMap } from "./nav-icons";
import { usePathname } from "next/navigation";

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4 lg:px-6">
        <div className="flex items-center gap-3 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="font-semibold text-foreground">
            {APP_NAME}
          </Link>
        </div>
        <div className="hidden lg:block">
          <p className="text-sm text-muted-foreground">
            Track meals, plan prep, and optimise your nutrition
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
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-4">
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
            <nav>
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = navIconMap[item.icon];
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
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
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
