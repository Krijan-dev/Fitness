import {
  createElement,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  /** Prefer a rendered element (`<Tags />`) or a Lucide/forwardRef component. */
  icon?: ComponentType<{ className?: string }> | ReactNode;
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
  const iconNode = resolveIcon(icon);

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

function resolveIcon(icon: EmptyStateProps["icon"]): ReactNode {
  if (icon == null || icon === false) return null;
  if (isValidElement(icon)) return icon;

  // Functions and React.forwardRef objects (Lucide icons) — never render raw
  if (typeof icon === "function" || isForwardRefComponent(icon)) {
    return createElement(icon as ComponentType<{ className?: string }>, {
      className: "h-6 w-6",
      "aria-hidden": true,
    });
  }

  return null;
}

function isForwardRefComponent(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "$$typeof" in value &&
    "render" in (value as object)
  );
}
