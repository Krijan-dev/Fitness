"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Flame } from "lucide-react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { AuthFormMessage } from "@/components/auth/AuthShell";
import {
  onboardingSchema,
  onboardingStepFields,
  type OnboardingFormValues,
} from "@/lib/onboarding-schema";
import { zodResolver } from "@/lib/zod-resolver";
import { calculateNutritionTargets } from "@/services/nutrition/tdee.service";
import {
  ACTIVITY_HINTS,
  ACTIVITY_LABELS,
  GOAL_LABELS,
  type ActivityLevel,
  type BiologicalSex,
  type NutritionGoal,
} from "@/types/onboarding";
import { apiSend } from "@/lib/api-client";
import { useSettingsStore } from "@/stores/settings.store";
import { useAuthStore } from "@/stores/auth-store";
import type { UserSettings } from "@/types/settings";
import type { NutritionTargets } from "@/types/onboarding";

const STEPS = [
  { title: "About you", description: "Age and biological sex for an accurate BMR." },
  { title: "Body metrics", description: "Height and weight in metric units." },
  { title: "Goal & activity", description: "How we should set your calorie target." },
  { title: "Your daily targets", description: "Review and save your calculated plan." },
];

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
    defaultValues: {
      age: undefined,
      gender: undefined,
      heightCm: undefined,
      currentWeightKg: undefined,
      targetWeightKg: undefined,
      goal: undefined,
      activityLevel: undefined,
    },
  });

  const values = form.watch();
  const preview = useMemo(() => {
    const parsed = onboardingSchema.safeParse(values);
    if (!parsed.success) return null;
    return calculateNutritionTargets(parsed.data);
  }, [values]);

  const goNext = async () => {
    const fields = onboardingStepFields[step as 0 | 1 | 2 | 3];
    if (fields.length > 0) {
      const ok = await form.trigger(fields as unknown as (keyof OnboardingFormValues)[]);
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setSaving(true);
    setSubmitError(null);
    try {
      const res = await apiSend<{
        data: { settings: UserSettings; targets: NutritionTargets };
      }>("/api/onboarding", "POST", data);
      updateSettings(res.data.settings);
      useAuthStore.setState((state) => ({
        user: state.user
          ? { ...state.user, onboardingCompleted: true }
          : state.user,
      }));
      router.replace("/dashboard");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {STEPS[step].title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {STEPS[step].description}
        </p>
        <div className="mt-4 flex gap-1.5">
          {STEPS.map((item, index) => (
            <div
              key={item.title}
              className={`h-1.5 flex-1 rounded-full ${
                index <= step ? "bg-emerald-600" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {submitError ? <AuthFormMessage tone="error" message={submitError} /> : null}

      {step === 0 ? (
        <div className="space-y-4">
          <Input
            label="Age (years)"
            type="number"
            min={13}
            max={100}
            error={form.formState.errors.age?.message}
            {...form.register("age")}
          />
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-muted-foreground">
              Biological sex
            </legend>
            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["male", "Male"],
                      ["female", "Female"],
                    ] as const
                  ).map(([value, label]) => (
                    <ChoiceButton
                      key={value}
                      selected={field.value === value}
                      title={label}
                      onClick={() => field.onChange(value as BiologicalSex)}
                    />
                  ))}
                </div>
              )}
            />
            {form.formState.errors.gender?.message ? (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.gender.message}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              Used only for the Mifflin–St Jeor BMR equation.
            </p>
          </fieldset>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <Input
            label="Height (cm)"
            type="number"
            min={100}
            max={250}
            step="any"
            error={form.formState.errors.heightCm?.message}
            {...form.register("heightCm")}
          />
          <Input
            label="Current weight (kg)"
            type="number"
            min={30}
            max={300}
            step="any"
            error={form.formState.errors.currentWeightKg?.message}
            {...form.register("currentWeightKg")}
          />
          <Input
            label="Target / desired weight (kg)"
            type="number"
            min={30}
            max={300}
            step="any"
            error={form.formState.errors.targetWeightKg?.message}
            {...form.register("targetWeightKg")}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-muted-foreground">
              Primary goal
            </legend>
            <Controller
              control={form.control}
              name="goal"
              render={({ field }) => (
                <div className="space-y-2">
                  {(Object.keys(GOAL_LABELS) as NutritionGoal[]).map((value) => (
                    <ChoiceButton
                      key={value}
                      selected={field.value === value}
                      title={GOAL_LABELS[value]}
                      hint={
                        value === "weight-loss"
                          ? "About 500 kcal below maintenance"
                          : value === "muscle-gain"
                            ? "About 400 kcal above maintenance"
                            : "Eat at maintenance TDEE"
                      }
                      onClick={() => field.onChange(value)}
                    />
                  ))}
                </div>
              )}
            />
            {form.formState.errors.goal?.message ? (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.goal.message}
              </p>
            ) : null}
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-muted-foreground">
              Daily activity level
            </legend>
            <Controller
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <div className="space-y-2">
                  {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(
                    (value) => (
                      <ChoiceButton
                        key={value}
                        selected={field.value === value}
                        title={ACTIVITY_LABELS[value]}
                        hint={ACTIVITY_HINTS[value]}
                        onClick={() => field.onChange(value)}
                      />
                    )
                  )}
                </div>
              )}
            />
            {form.formState.errors.activityLevel?.message ? (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.activityLevel.message}
              </p>
            ) : null}
          </fieldset>
        </div>
      ) : null}

      {step === 3 ? (
        <TargetsPreview targets={preview} />
      ) : null}

      <div className="flex gap-2">
        {step > 0 ? (
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button type="button" className="flex-1" onClick={() => void goNext()}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" className="flex-1" isLoading={saving} disabled={!preview}>
            <Check className="h-4 w-4" />
            Save and go to dashboard
          </Button>
        )}
      </div>
    </form>
  );
}

function ChoiceButton({
  selected,
  title,
  hint,
  onClick,
}: {
  selected: boolean;
  title: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
        selected
          ? "border-emerald-500 bg-emerald-50 text-emerald-900"
          : "border-border bg-card hover:bg-muted"
      }`}
    >
      <span className="block text-sm font-medium">{title}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </button>
  );
}

function TargetsPreview({ targets }: { targets: NutritionTargets | null }) {
  if (!targets) {
    return (
      <p className="text-sm text-muted-foreground">
        Fill in the previous steps to see your calculated targets.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <Flame className="h-4 w-4" />
          Daily calorie target
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-emerald-900">
          {targets.targetCalories} kcal
        </p>
        <p className="mt-1 text-xs text-emerald-800/80">
          BMR {targets.bmr} · TDEE {targets.tdee}
          {targets.calorieAdjustment !== 0
            ? ` · ${targets.calorieAdjustment > 0 ? "+" : ""}${targets.calorieAdjustment} kcal for your goal`
            : " · maintenance"}
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <MacroTile label="Protein" value={`${targets.targetProtein}g`} />
        <MacroTile label="Carbs" value={`${targets.targetCarbs}g`} />
        <MacroTile label="Fats" value={`${targets.targetFats}g`} />
      </dl>
      <p className="text-xs text-muted-foreground">
        Protein is {targets.proteinGramsPerKg} g per kg of current body weight.
        Fats are 25% of calories; remaining calories go to carbs.
      </p>
    </div>
  );
}

function MacroTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-2 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
