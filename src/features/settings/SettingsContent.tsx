"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useSettingsStore } from "@/stores/settings.store";
import { useRecipeStore } from "@/stores/recipe.store";
import { useDailyTrackerStore } from "@/stores/daily-tracker.store";
import { useMealPlannerStore } from "@/stores/meal-planner.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { usePantryStore } from "@/stores/pantry.store";
import { useWeightStore } from "@/stores/weight.store";
import { usePriceComparisonStore } from "@/stores/price-comparison.store";
import { parseNumericInput } from "@/features/meal-calculator/validation";
import {
  UNIT_OPTIONS,
  THEME_OPTIONS,
  LOCATION_CITY_OPTIONS,
  AUSTRALIAN_STATES,
  DATA_CLEAR_OPTIONS,
  type DataClearTarget,
} from "@/features/settings/constants";
import {
  collectExportData,
  validateImportData,
  applyImportData,
  clearAllAppData,
  downloadJsonExport,
} from "@/services/data/export-import.service";

export function SettingsContent() {
  const settings = useSettingsStore((s) => s.settings);
  const updateProfile = useSettingsStore((s) => s.updateProfile);
  const updateNutritionGoals = useSettingsStore((s) => s.updateNutritionGoals);
  const updateLocation = useSettingsStore((s) => s.updateLocation);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetSettings = useSettingsStore((s) => s.reset);

  const resetRecipes = useRecipeStore((s) => s.reset);
  const resetDaily = useDailyTrackerStore((s) => s.reset);
  const resetPlanner = useMealPlannerStore((s) => s.reset);
  const resetShopping = useShoppingListStore((s) => s.reset);
  const resetPantry = usePantryStore((s) => s.reset);
  const resetWeight = useWeightStore((s) => s.reset);
  const resetPriceSelections = usePriceComparisonStore((s) => s.reset);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clearTarget, setClearTarget] = useState<DataClearTarget>("recipes");
  const [clearFeatureOpen, setClearFeatureOpen] = useState(false);
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleExport = () => {
    const data = collectExportData();
    downloadJsonExport(data);
    showMessage("All data exported.");
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const validated = validateImportData(parsed);
      if (!validated) {
        setImportError("Invalid backup file. Data was not imported.");
        return;
      }
      applyImportData(validated);
      showMessage("Data imported. Reloading...");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setImportError("Could not read the file. Data was not imported.");
    }

    e.target.value = "";
  };

  const handleClearFeature = () => {
    switch (clearTarget) {
      case "recipes":
        resetRecipes();
        break;
      case "daily-tracker":
        resetDaily();
        break;
      case "meal-planner":
        resetPlanner();
        break;
      case "shopping-list":
        resetShopping();
        break;
      case "pantry":
        resetPantry();
        break;
      case "weight-tracker":
        resetWeight();
        break;
      case "price-selections":
        resetPriceSelections();
        break;
    }
    setClearFeatureOpen(false);
    showMessage(`${DATA_CLEAR_OPTIONS.find((o) => o.value === clearTarget)?.label} data cleared.`);
    setTimeout(() => window.location.reload(), 600);
  };

  const handleResetAll = () => {
    clearAllAppData();
    resetSettings();
    setResetAllOpen(false);
    showMessage("All application data reset. Reloading...");
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, goals, location, display, and data management."
      />

      {actionMessage ? (
        <div
          className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      {importError ? (
        <div
          className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {importError}
        </div>
      ) : null}

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Used for BMI and weight progress tracking.</CardDescription>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Display name"
              value={settings.profile.displayName ?? ""}
              onChange={(e) =>
                updateProfile({ displayName: e.target.value || undefined })
              }
            />
            <Input
              label="Height (cm)"
              type="number"
              min={0}
              value={settings.profile.heightCm ?? ""}
              onChange={(e) =>
                updateProfile({
                  heightCm: e.target.value
                    ? parseNumericInput(e.target.value)
                    : undefined,
                })
              }
            />
            <Input
              label="Current weight (kg)"
              type="number"
              min={0}
              step="any"
              value={settings.profile.currentWeightKg ?? ""}
              onChange={(e) =>
                updateProfile({
                  currentWeightKg: e.target.value
                    ? parseNumericInput(e.target.value)
                    : undefined,
                })
              }
            />
            <Input
              label="Target weight (kg)"
              type="number"
              min={0}
              step="any"
              value={settings.profile.targetWeightKg ?? ""}
              onChange={(e) =>
                updateProfile({
                  targetWeightKg: e.target.value
                    ? parseNumericInput(e.target.value)
                    : undefined,
                })
              }
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrition goals</CardTitle>
            <CardDescription>Daily targets for the tracker and dashboard.</CardDescription>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Calories"
              type="number"
              min={0}
              value={settings.nutritionGoals.dailyCalorieGoal}
              onChange={(e) =>
                updateNutritionGoals({
                  dailyCalorieGoal: parseNumericInput(e.target.value),
                })
              }
            />
            <Input
              label="Protein (g)"
              type="number"
              min={0}
              value={settings.nutritionGoals.dailyProteinGoal}
              onChange={(e) =>
                updateNutritionGoals({
                  dailyProteinGoal: parseNumericInput(e.target.value),
                })
              }
            />
            <Input
              label="Carbs (g)"
              type="number"
              min={0}
              value={settings.nutritionGoals.dailyCarbGoal}
              onChange={(e) =>
                updateNutritionGoals({
                  dailyCarbGoal: parseNumericInput(e.target.value),
                })
              }
            />
            <Input
              label="Fat (g)"
              type="number"
              min={0}
              value={settings.nutritionGoals.dailyFatGoal}
              onChange={(e) =>
                updateNutritionGoals({
                  dailyFatGoal: parseNumericInput(e.target.value),
                })
              }
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Units & location</CardTitle>
            <CardDescription>
              Your city is used for price comparison across Coles, Woolworths,
              and ALDI.
            </CardDescription>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Units"
              value={settings.units}
              options={UNIT_OPTIONS}
              onChange={(e) =>
                updateSettings({ units: e.target.value as "metric" | "imperial" })
              }
            />
            <Select
              label="Theme"
              value={settings.theme}
              options={THEME_OPTIONS}
              onChange={(e) =>
                updateSettings({
                  theme: e.target.value as "dark" | "light" | "system",
                })
              }
            />
            <Input
              label="Country"
              value={settings.location.country}
              onChange={(e) => updateLocation({ country: e.target.value })}
            />
            <Select
              label="State / territory"
              value={settings.location.state}
              options={AUSTRALIAN_STATES}
              onChange={(e) => updateLocation({ state: e.target.value })}
            />
            <Select
              label="City"
              value={settings.location.city}
              options={LOCATION_CITY_OPTIONS}
              onChange={(e) => updateLocation({ city: e.target.value })}
            />
            <Input
              label="Postcode"
              value={settings.location.postcode ?? ""}
              onChange={(e) =>
                updateLocation({ postcode: e.target.value || undefined })
              }
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data management</CardTitle>
            <CardDescription>
              Export, import, or reset your local data. Destructive actions require confirmation.
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export all data (JSON)
            </Button>
            <Button variant="secondary" onClick={handleImportClick}>
              <Upload className="h-4 w-4" />
              Import data (JSON)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-sm font-medium">Clear individual feature</p>
            <div className="flex flex-wrap items-end gap-3">
              <Select
                label="Feature"
                value={clearTarget}
                options={DATA_CLEAR_OPTIONS}
                onChange={(e) =>
                  setClearTarget(e.target.value as DataClearTarget)
                }
              />
              <Button
                variant="destructive"
                onClick={() => setClearFeatureOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Clear data
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <Button variant="destructive" onClick={() => setResetAllOpen(true)}>
              Reset entire application
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Removes all recipes, meals, plans, lists, pantry, weight logs, and settings.
            </p>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={clearFeatureOpen}
        onClose={() => setClearFeatureOpen(false)}
        onConfirm={handleClearFeature}
        title="Clear feature data"
        description={`Reset ${DATA_CLEAR_OPTIONS.find((o) => o.value === clearTarget)?.label} to default mock data? This cannot be undone.`}
        confirmLabel="Clear"
        isDestructive
      />

      <ConfirmDialog
        isOpen={resetAllOpen}
        onClose={() => setResetAllOpen(false)}
        onConfirm={handleResetAll}
        title="Reset application"
        description="Delete all local data and restore defaults? This cannot be undone."
        confirmLabel="Reset all"
        isDestructive
      />
    </>
  );
}
