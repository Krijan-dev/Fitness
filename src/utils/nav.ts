export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" }],
  },
  {
    label: "Meals & recipes",
    items: [
      { href: "/meal-calculator", label: "Meal Calculator", icon: "Calculator" },
      { href: "/recipes", label: "My Recipes", icon: "BookOpen" },
      { href: "/discover", label: "Discover", icon: "Compass" },
      { href: "/meal-planner", label: "Meal Planner", icon: "CalendarDays" },
      { href: "/daily-tracker", label: "Daily Tracker", icon: "Activity" },
    ],
  },
  {
    label: "Shopping",
    items: [
      { href: "/shopping-list", label: "Shopping List", icon: "ShoppingCart" },
      { href: "/price-comparison", label: "Price Compare", icon: "Tags" },
      { href: "/pantry", label: "Pantry", icon: "Package" },
    ],
  },
  {
    label: "Progress",
    items: [
      { href: "/weight-tracker", label: "Weight Tracker", icon: "Scale" },
      { href: "/settings", label: "Settings", icon: "Settings" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function getNavLabelForPath(pathname: string): string {
  const exact = NAV_ITEMS.find((item) => item.href === pathname);
  if (exact) return exact.label;

  const nested = NAV_ITEMS.find(
    (item) => item.href !== "/dashboard" && pathname.startsWith(item.href)
  );
  return nested?.label ?? "MealPrep Pro";
}
