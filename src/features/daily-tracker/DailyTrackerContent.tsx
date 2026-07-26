"use client";

import { useMemo, useState } from "react";
import { Activity, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { MealEntryRow } from "@/components/tracking/MealEntryRow";
import { AddMealModal } from "@/components/tracking/AddMealModal";
import { useDailyTrackerStore } from "@/stores/daily-tracker.store";
import { useRecipeStore } from "@/stores/recipe.store";
import { useSettingsStore } from "@/stores/settings.store";
import { formatDate, formatDisplayDate, getDaysAgo } from "@/utils/date";
import { MEAL_SECTIONS, sumMealNutrition } from "@/features/daily-tracker/utils";
import type { MealEntry } from "@/types/meal";
import type { MealType } from "@/types/common";

export function DailyTrackerContent() {
  const allMeals = useDailyTrackerStore((s) => s.meals);
  const addMeal = useDailyTrackerStore((s) => s.addMeal);
  const updateMeal = useDailyTrackerStore((s) => s.updateMeal);
  const removeMeal = useDailyTrackerStore((s) => s.removeMeal);
  const duplicateMeal = useDailyTrackerStore((s) => s.duplicateMeal);
  const copyMealsFromDate = useDailyTrackerStore((s) => s.copyMealsFromDate);
  const clearDayMeals = useDailyTrackerStore((s) => s.clearDay);

  const recipes = useRecipeStore((s) => s.recipes);
  const settings = useSettingsStore((s) => s.settings);

  const [selectedDate, setSelectedDate] = useState(formatDate());
  const [addOpen, setAddOpen] = useState(false);
  const [addMealType, setAddMealType] = useState<MealType>("breakfast");
  const [editMeal, setEditMeal] = useState<MealEntry | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const dayMeals = useMemo(
    () => allMeals.filter((m) => m.date === selectedDate),
    [allMeals, selectedDate]
  );

  const totals = sumMealNutrition(dayMeals);
  const calorieGoal = settings.nutritionGoals.dailyCalorieGoal;
  const proteinGoal = settings.nutritionGoals.dailyProteinGoal;
  const caloriesRemaining = Math.max(calorieGoal - totals.calories, 0);

  const handleCopyYesterday = () => {
    const yesterday = getDaysAgo(1);
    copyMealsFromDate(yesterday, selectedDate);
  };

  return (
    <>
      <PageHeader
        title="Daily Tracker"
        description="Log meals and track calories and macros for any day."
      >
        <Button onClick={() => { setAddMealType("lunch"); setAddOpen(true); }}>
          <Plus className="h-4 w-4" />
          Log meal
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3 sm:items-end">
          <Button variant="secondary" size="sm" onClick={handleCopyYesterday}>
            Copy yesterday
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setClearOpen(true)}>
            Clear day
          </Button>
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {formatDisplayDate(selectedDate)}
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Calories" value={Math.round(totals.calories)} subValue={`${Math.round(caloriesRemaining)} left`} icon={Activity} />
        <StatCard label="Protein" value={`${totals.protein.toFixed(1)}g`} subValue={`Goal ${proteinGoal}g`} />
        <StatCard label="Carbs" value={`${totals.carbs.toFixed(1)}g`} />
        <StatCard label="Fat" value={`${totals.fat.toFixed(1)}g`} />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily progress</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <ProgressBar label="Calories" value={totals.calories} max={calorieGoal} />
          <ProgressBar label="Protein" value={totals.protein} max={proteinGoal} color="success" />
          <ProgressBar label="Carbs" value={totals.carbs} max={settings.nutritionGoals.dailyCarbGoal} />
          <ProgressBar label="Fat" value={totals.fat} max={settings.nutritionGoals.dailyFatGoal} color="warning" />
        </div>
      </Card>

      <div className="space-y-6">
        {MEAL_SECTIONS.map((section) => {
          const sectionMeals = dayMeals.filter((m) => m.mealType === section.type);
          return (
            <Card key={section.type}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>{section.label}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAddMealType(section.type);
                    setAddOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </CardHeader>
              {sectionMeals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No meals logged.</p>
              ) : (
                <ul className="space-y-2">
                  {sectionMeals.map((meal) => (
                    <li key={meal.id}>
                      <MealEntryRow
                        meal={meal}
                        onEdit={setEditMeal}
                        onDelete={(m) => removeMeal(m.id)}
                        onDuplicate={(m) => duplicateMeal(m.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      {dayMeals.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No meals logged"
          description="Add a saved recipe or custom entry to start tracking."
          actionLabel="Log meal"
          onAction={() => setAddOpen(true)}
        />
      ) : null}

      <AddMealModal
        isOpen={addOpen || editMeal !== null}
        onClose={() => {
          setAddOpen(false);
          setEditMeal(null);
        }}
        recipes={recipes}
        defaultMealType={addMealType}
        selectedDate={selectedDate}
        editMeal={editMeal}
        onSave={(meal) => addMeal(meal)}
        onUpdate={(id, updates) => updateMeal(id, updates)}
      />

      <ConfirmDialog
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          clearDayMeals(selectedDate);
          setClearOpen(false);
        }}
        title="Clear day"
        description={`Remove all meals logged for ${formatDisplayDate(selectedDate)}?`}
        confirmLabel="Clear day"
        isDestructive
      />
    </>
  );
}
