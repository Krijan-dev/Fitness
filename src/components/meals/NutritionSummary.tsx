import type { Nutrition } from "@/types/nutrition";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";

interface NutritionSummaryProps {
  title: string;
  nutrition: Nutrition;
  subtitle?: string;
  className?: string;
}

function formatValue(value: number | undefined, decimals = 0): string {
  if (value === undefined) return "—";
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}

export function NutritionSummary({
  title,
  nutrition,
  subtitle,
  className = "",
}: NutritionSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="mb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle ? (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        ) : null}
      </CardHeader>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Calories</dt>
          <dd className="text-lg font-semibold">{formatValue(nutrition.calories)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Protein</dt>
          <dd className="text-lg font-semibold">
            {formatValue(nutrition.protein, 1)}g
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Carbs</dt>
          <dd className="text-lg font-semibold">
            {formatValue(nutrition.carbs, 1)}g
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fat</dt>
          <dd className="text-lg font-semibold">
            {formatValue(nutrition.fat, 1)}g
          </dd>
        </div>
        {nutrition.fibre !== undefined && nutrition.fibre > 0 ? (
          <div>
            <dt className="text-xs text-muted-foreground">Fibre</dt>
            <dd className="text-lg font-semibold">
              {formatValue(nutrition.fibre, 1)}g
            </dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
