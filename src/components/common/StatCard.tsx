import { type LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  className = "",
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground truncate">
            {value}
          </p>
          {subValue ? (
            <p className={`mt-1 text-sm ${trendColor}`}>{subValue}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-muted p-2 shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
