import { type LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";

interface FeaturePreviewCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

export function FeaturePreviewCard({
  title,
  description,
  icon: Icon,
  features,
}: FeaturePreviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </Card>
  );
}

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  emptyTitle: string;
  emptyDescription: string;
}

export function PlaceholderPage({
  title,
  description,
  icon,
  features,
  emptyTitle,
  emptyDescription,
}: PlaceholderPageProps) {
  const Icon = icon;

  return (
  <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FeaturePreviewCard
          title="Coming in a future phase"
          description="This feature is planned and the foundation is ready."
          icon={Icon}
          features={features}
        />
        <Card>
          <EmptyState
            icon={Icon}
            title={emptyTitle}
            description={emptyDescription}
          />
        </Card>
      </div>
    </>
  );
}
