import { type ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  children,
  className = "",
}: PageSectionProps) {
  return (
    <section className={`space-y-5 ${className}`}>
      {title ? (
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-2xl">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
