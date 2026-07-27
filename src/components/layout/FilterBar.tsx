import { type ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

/** Grouped filters and search controls with consistent spacing. */
export function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <div
      className={`rounded-xl border border-border/80 bg-card/60 p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        {children}
      </div>
    </div>
  );
}
