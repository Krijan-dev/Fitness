"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, NAV_GROUPS } from "@/utils/constants";
import { navIconMap } from "./nav-icons";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-border/80 lg:bg-card/40 lg:backdrop-blur-sm lg:fixed lg:inset-y-0"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center border-b border-border/80 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm">
            M
          </div>
          <span className="font-semibold text-foreground">{APP_NAME}</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-7">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isActive
                            ? "bg-primary/15 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon
                          className="h-[18px] w-[18px] shrink-0"
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
    </aside>
  );
}
