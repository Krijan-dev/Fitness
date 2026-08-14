"use client";

import type { StoreName } from "@/types/common";
import { STORE_LABELS } from "@/features/price-comparison/constants";

/** Soft pill badges with subtle brand accents */
const STORE_COLORS: Record<StoreName, string> = {
  woolworths: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
  coles: "bg-rose-50 text-rose-800 ring-1 ring-rose-100",
  aldi: "bg-sky-50 text-sky-800 ring-1 ring-sky-100",
  costco: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  "harris-farm": "bg-lime-50 text-lime-800 ring-1 ring-lime-100",
};

const STORE_SHORT: Partial<Record<StoreName, string>> = {
  coles: "Coles",
  woolworths: "Woolies",
  aldi: "ALDI",
  costco: "Costco",
  "harris-farm": "Harris Farm",
};

interface StoreBadgeProps {
  store: StoreName;
  className?: string;
}

/** Soft pill-shaped store brand badge for price rows. */
export function StoreBadge({ store, className = "" }: StoreBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${STORE_COLORS[store]} ${className}`}
      title={STORE_LABELS[store]}
      aria-label={STORE_LABELS[store]}
    >
      {STORE_SHORT[store] ?? STORE_LABELS[store]}
    </span>
  );
}
