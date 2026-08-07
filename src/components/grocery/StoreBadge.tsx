"use client";

import type { StoreName } from "@/types/common";
import { STORE_LABELS } from "@/features/price-comparison/constants";

const STORE_COLORS: Record<StoreName, string> = {
  coles: "bg-red-600 text-white",
  woolworths: "bg-green-700 text-white",
  aldi: "bg-blue-700 text-white",
  iga: "bg-red-700 text-white",
  costco: "bg-slate-700 text-white",
  "harris-farm": "bg-lime-700 text-white",
};

const STORE_SHORT: Partial<Record<StoreName, string>> = {
  coles: "C",
  woolworths: "W",
  aldi: "A",
  iga: "IGA",
  costco: "Co",
  "harris-farm": "HF",
};

interface StoreBadgeProps {
  store: StoreName;
  className?: string;
}

/** Compact coloured store logo/badge for price rows. */
export function StoreBadge({ store, className = "" }: StoreBadgeProps) {
  return (
    <span
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[10px] font-bold tracking-wide ${STORE_COLORS[store]} ${className}`}
      title={STORE_LABELS[store]}
      aria-label={STORE_LABELS[store]}
    >
      {STORE_SHORT[store] ?? STORE_LABELS[store].slice(0, 2)}
    </span>
  );
}
