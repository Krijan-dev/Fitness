import type { DataSource } from "@/types/common";
import {
  DATA_SOURCE_LABELS,
  DATA_SOURCE_STYLES,
} from "@/features/price-comparison/constants";

interface DataSourceBadgeProps {
  source: DataSource;
}

export function DataSourceBadge({ source }: DataSourceBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DATA_SOURCE_STYLES[source]}`}
    >
      {DATA_SOURCE_LABELS[source]}
    </span>
  );
}
