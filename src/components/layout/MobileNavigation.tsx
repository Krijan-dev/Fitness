"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/utils/constants";
import { navIconMap } from "./nav-icons";

const MOBILE_NAV_HREFS = [
  "/dashboard",
  "/discover",
  "/shopping-list",
  "/meal-planner",
  "/daily-tracker",
] as const;

export function MobileNavigation() {
  const pathname = usePathname();

  const mobileItems = MOBILE_NAV_HREFS.map(
    (href) => NAV_ITEMS.find((item) => item.href === href)!
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-card/95 backdrop-blur-md lg:hidden safe-area-pb"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-stretch justify-around px-1 py-1">
        {mobileItems.map((item) => {
          const Icon = navIconMap[item.icon];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const shortLabel =
            item.href === "/daily-tracker"
              ? "Track"
              : item.href === "/shopping-list"
                ? "Shop"
                : item.href === "/meal-planner"
                  ? "Plan"
                  : item.href === "/discover"
                    ? "Discover"
                    : item.label.split(" ")[0];

          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-muted-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="w-full truncate text-center">{shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
