"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/utils/constants";
import { navIconMap } from "./nav-icons";

const MOBILE_NAV_HREFS = [
  "/dashboard",
  "/daily-tracker",
  "/recipes",
  "/shopping-list",
  "/meal-planner",
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
              ? "Tracker"
              : item.href === "/shopping-list"
                ? "Shop"
                : item.href === "/meal-planner"
                  ? "Plan"
                  : item.label.split(" ")[0];

          return (
            <li key={item.href} className="flex-1 max-w-[5rem]">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2.5 min-h-[3.25rem] text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate w-full text-center">{shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
