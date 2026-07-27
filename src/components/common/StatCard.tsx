import { type LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  compact?: boolean;
}

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  className = "",
  compact = false,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card padding={compact ? "sm" : "md"} className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p
            className={`mt-1.5 font-bold text-foreground truncate ${
              compact ? "text-xl" : "text-2xl"
            }`}
          >
            {value}
          </p>
          {subValue ? (
            <p className={`mt-1 text-sm leading-snug ${trendColor}`}>
              {subValue}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-muted/80 p-2.5 shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
