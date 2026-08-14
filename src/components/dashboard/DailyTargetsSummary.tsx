import Link from "next/link";
import { Flame, Beef, Wheat, Droplet, Scale } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import type { UserSettings } from "@/types/settings";
import { GOAL_LABELS } from "@/types/onboarding";

interface DailyTargetsSummaryProps {
  settings: UserSettings;
  currentWeightKg?: number;
}

export function DailyTargetsSummary({
  settings,
  currentWeightKg,
}: DailyTargetsSummaryProps) {
  const { nutritionGoals, profile } = settings;
  const current = currentWeightKg ?? profile.currentWeightKg;
  const target = profile.targetWeightKg;
  const start = profile.startingWeightKg ?? current;
  const progress = weightProgressPercent(start, current, target);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Targets Summary</CardTitle>
        <CardDescription>
          {profile.goal ? GOAL_LABELS[profile.goal] : "Personalised from your profile"}
          {profile.tdee ? ` · TDEE ${Math.round(profile.tdee)} kcal` : ""}
        </CardDescription>
      </CardHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TargetTile
          icon={Flame}
          label="Calories"
          value={`${Math.round(nutritionGoals.dailyCalorieGoal)}`}
          unit="kcal"
        />
        <TargetTile
          icon={Beef}
          label="Protein"
          value={`${Math.round(nutritionGoals.dailyProteinGoal)}`}
          unit="g"
        />
        <TargetTile
          icon={Wheat}
          label="Carbs"
          value={`${Math.round(nutritionGoals.dailyCarbGoal)}`}
          unit="g"
        />
        <TargetTile
          icon={Droplet}
          label="Fats"
          value={`${Math.round(nutritionGoals.dailyFatGoal)}`}
          unit="g"
        />
      </div>

      {current != null && target != null ? (
        <div className="mt-5 rounded-xl border border-border bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Scale className="h-4 w-4 text-emerald-600" />
              Weight progress
            </span>
            <span className="tabular-nums text-muted-foreground">
              {current} kg → {target} kg
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-card"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress toward target weight"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {progress.toFixed(0)}% of the way from your starting weight
            {start != null ? ` (${start} kg)` : ""}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Add a target weight in{" "}
          <Link href="/settings" className="font-medium text-emerald-700 underline">
            Settings
          </Link>{" "}
          to track progress.
        </p>
      )}

      <div className="mt-4">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            Recalculate in settings
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function TargetTile({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-emerald-600" />
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">
        {value}
        <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

export function weightProgressPercent(
  start: number | undefined,
  current: number | undefined,
  target: number | undefined
): number {
  if (start == null || current == null || target == null) return 0;
  const total = target - start;
  if (Math.abs(total) < 0.05) {
    return current === target ? 100 : 0;
  }
  const done = current - start;
  const raw = (done / total) * 100;
  return Math.min(100, Math.max(0, raw));
}
