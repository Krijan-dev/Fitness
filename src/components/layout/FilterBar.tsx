import { type ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

/** Grouped filters and search controls with consistent spacing. */
export function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card/80 p-4 shadow-card sm:p-5 ${className}`}
    >
      <div className="relative flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        {children}
      </div>
    </div>
  );
}
