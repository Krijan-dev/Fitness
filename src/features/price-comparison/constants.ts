import type { StoreName, DataSource } from "@/types/common";

export const LOCATION_OPTIONS = [
  { value: "Canberra", label: "Canberra" },
  { value: "Sydney", label: "Sydney" },
  { value: "Melbourne", label: "Melbourne" },
  { value: "Brisbane", label: "Brisbane" },
  { value: "Adelaide", label: "Adelaide" },
  { value: "Perth", label: "Perth" },
  { value: "Hobart", label: "Hobart" },
  { value: "Darwin", label: "Darwin" },
] as const;

export const STORE_LABELS: Record<StoreName, string> = {
  coles: "Coles",
  woolworths: "Woolworths",
  aldi: "Aldi",
  iga: "IGA",
  costco: "Costco",
  "harris-farm": "Harris Farm",
};

export const ALL_STORES: StoreName[] = [
  "coles",
  "woolworths",
  "aldi",
  "iga",
  "costco",
  "harris-farm",
];

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  "live-api": "Live",
  cached: "Cached",
  mock: "Mock",
  manual: "Manual",
};

export const DATA_SOURCE_STYLES: Record<DataSource, string> = {
  "live-api": "bg-emerald-50 text-emerald-700",
  cached: "bg-sky-50 text-sky-700",
  mock: "bg-slate-100 text-slate-600",
  manual: "bg-amber-50 text-amber-700",
};
