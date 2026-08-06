import { type LucideIcon } from "lucide-react";
import { type ReactElement, type ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  let iconNode: ReactNode = null;
  if (typeof icon === "function") {
    const Icon = icon as LucideIcon;
    iconNode = <Icon className="h-6 w-6" />;
  } else if (icon) {
    iconNode = icon as ReactElement;
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      {iconNode ? (
        <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
          {iconNode}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
