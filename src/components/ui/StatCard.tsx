import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: string;
  compact?: boolean;
}

export function StatCard({
  label,
  value,
  subValue,
  hint,
  icon: Icon,
  trend,
  compact = false,
}: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden ${compact ? "!p-4" : ""}`}
      padding={compact ? "sm" : "md"}
      hover
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={`mt-1.5 font-semibold tracking-tight tabular-nums ${
              compact ? "text-xl" : "text-3xl"
            }`}
          >
            {value}
          </p>
          {subValue || hint ? (
            <p className="mt-1 text-xs text-text-muted truncate">
              {subValue || hint}
            </p>
          ) : null}
          {trend ? (
            <p className="mt-2 text-xs font-medium text-primary">{trend}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
