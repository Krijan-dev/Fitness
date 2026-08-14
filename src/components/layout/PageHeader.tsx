import Link from "next/link";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader as UiPageHeader } from "@/components/ui/PageHeader";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  children,
}: PageHeaderProps) {
  const actions = (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      {action ? (
        action.href ? (
          <Link href={action.href}>
            <Button>{action.label}</Button>
          </Link>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      ) : null}
      {children}
    </div>
  );

  return (
    <div className="mb-2 border-b border-border pb-6">
      <UiPageHeader
        title={title}
        description={description}
        actions={action || children ? actions : undefined}
      />
    </div>
  );
}
