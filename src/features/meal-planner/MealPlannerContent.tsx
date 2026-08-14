"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus, ShoppingCart, Trash2, Copy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { Select } from "@/components/common/Select";
import { Input } from "@/components/common/Input";
import { StatCard } from "@/components/common/StatCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Modal } from "@/components/common/Modal";
import { AddPlannedMealModal } from "@/components/planner/AddPlannedMealModal";
import { useMealPlannerStore } from "@/stores/meal-planner.store";
import { useRecipeStore } from "@/stores/recipe.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { PLANNER_DAYS } from "@/features/recipes/constants";
import {
  sumPlannedNutrition,
  generateShoppingFromPlan,
  formatWeeklyCost,
  PLANNER_MEAL_SLOTS,
} from "@/features/meal-planner/utils";
import { getPerServingNutrition } from "@/features/recipes/utils";
import type { PlannedMeal } from "@/types/meal";
import { parseNumericInput } from "@/features/meal-calculator/validation";

export function MealPlannerContent() {
  const plan = useMealPlannerStore((s) => s.plan);
  const addPlannedMeal = useMealPlannerStore((s) => s.addPlannedMeal);
  const updatePlannedMeal = useMealPlannerStore((s) => s.updatePlannedMeal);
  const removePlannedMeal = useMealPlannerStore((s) => s.removePlannedMeal);
  const movePlannedMeal = useMealPlannerStore((s) => s.movePlannedMeal);
  const copyDay = useMealPlannerStore((s) => s.copyDay);
  const clearDay = useMealPlannerStore((s) => s.clearDay);
  const clearWeek = useMealPlannerStore((s) => s.clearWeek);

  const recipes = useRecipeStore((s) => s.recipes);
  const addShoppingItem = useShoppingListStore((s) => s.addItem);

  const [selectedDay, setSelectedDay] = useState(() => {
    const weekday = new Date()
      .toLocaleDateString("en-AU", { weekday: "long" })
      .toLowerCase();
    return PLANNER_DAYS.some((d) => d.value === weekday) ? weekday : "monday";
  });
  const [addOpen, setAddOpen] = useState(false);
  const [clearWeekOpen, setClearWeekOpen] = useState(false);
  const [copyDayOpen, setCopyDayOpen] = useState(false);
  const [copyFromDay, setCopyFromDay] = useState("monday");
  const [copyToDay, setCopyToDay] = useState("tuesday");
  const [moveMeal, setMoveMeal] = useState<PlannedMeal | null>(null);
  const [moveToDay, setMoveToDay] = useState("monday");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const weeklyTotals = sumPlannedNutrition(plan.meals);

  const mealsByDay = useMemo(() => {
    const map: Record<string, PlannedMeal[]> = {};
    for (const day of PLANNER_DAYS) {
      map[day.value] = plan.meals.filter((m) => m.day === day.value);
    }
    return map;
  }, [plan.meals]);

  const showMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleGenerateShoppingList = () => {
    const items = generateShoppingFromPlan(plan.meals, recipes);
    for (const item of items) {
      addShoppingItem({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        purchased: false,
        sourceRecipeIds: item.sourceRecipeIds,
      });
    }
    showMessage(`${items.length} items added to shopping list.`);
  };

  const handleServingsChange = (meal: PlannedMeal, servings: number) => {
    const recipe = recipes.find((r) => r.id === meal.recipeId);
    if (!recipe) {
      updatePlannedMeal(meal.id, { servings });
      return;
    }
    const perServing = getPerServingNutrition(recipe);
    updatePlannedMeal(meal.id, {
      servings,
      nutrition: {
        calories: perServing.calories * servings,
        protein: perServing.protein * servings,
        carbs: perServing.carbs * servings,
        fat: perServing.fat * servings,
      },
    });
  };

  const renderDayCard = (day: (typeof PLANNER_DAYS)[number]) => (
    <Card key={day.value} padding="sm" className="min-w-0">
      <CardHeader className="mb-3">
        <CardTitle className="text-sm">{day.label}</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {PLANNER_MEAL_SLOTS.map((slot) => {
          const slotMeals =
            mealsByDay[day.value]?.filter((m) => m.mealType === slot.type) ??
            [];
          return (
            <div key={slot.type}>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {slot.label}
              </p>
              {slotMeals.length === 0 ? (
                <p className="text-xs text-muted-foreground/70">—</p>
              ) : (
                <ul className="space-y-2">
                  {slotMeals.map((meal) => (
                    <li
                      key={meal.id}
                      className="rounded-lg border border-border p-2 text-sm"
                    >
                      <p className="truncate font-medium">{meal.recipeName}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Input
                          type="number"
                          min={1}
                          value={meal.servings}
                          onChange={(e) =>
                            handleServingsChange(
                              meal,
                              Math.max(1, parseNumericInput(e.target.value))
                            )
                          }
                          className="h-10 !py-1 sm:h-8"
                          aria-label="Servings"
                        />
                        <span className="text-muted-foreground">srv</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        {Math.round(meal.nutrition.calories)} cal
                      </p>
                      <div className="mt-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => {
                            setMoveMeal(meal);
                            setMoveToDay(meal.day);
                          }}
                        >
                          Move
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => removePlannedMeal(meal.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 w-full"
        onClick={() => clearDay(day.value)}
      >
        Clear day
      </Button>
    </Card>
  );

  return (
    <>
      <PageHeader
        title="Meal Planner"
        description="Plan your week and generate a combined shopping list from planned recipes."
      >
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add meal
        </Button>
      </PageHeader>

      {actionMessage ? (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success" role="status">
          {actionMessage}
          <Link href="/shopping-list" className="ml-2 underline">View list</Link>
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Weekly calories" value={Math.round(weeklyTotals.calories)} icon={CalendarDays} />
        <StatCard label="Protein" value={`${weeklyTotals.protein.toFixed(0)}g`} />
        <StatCard label="Carbs" value={`${weeklyTotals.carbs.toFixed(0)}g`} />
        <StatCard label="Fat" value={`${weeklyTotals.fat.toFixed(0)}g`} />
        <StatCard label="Est. grocery" value={formatWeeklyCost(plan.meals.length)} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setCopyDayOpen(true)}>
          <Copy className="h-4 w-4" />
          Copy day
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setClearWeekOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Clear week
        </Button>
        <Button variant="secondary" size="sm" onClick={handleGenerateShoppingList}>
          <ShoppingCart className="h-4 w-4" />
          Generate Shopping List
        </Button>
      </div>

      <div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 pb-1 lg:hidden">
        {PLANNER_DAYS.map((day) => {
          const isSelected = selectedDay === day.value;
          const count = mealsByDay[day.value]?.length ?? 0;
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => setSelectedDay(day.value)}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              {day.label.slice(0, 3)}
              {count > 0 ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      <div className="lg:hidden">
        {PLANNER_DAYS.filter((day) => day.value === selectedDay).map(
          renderDayCard
        )}
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-7">
        {PLANNER_DAYS.map(renderDayCard)}
      </div>

      <AddPlannedMealModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        recipes={recipes}
        onAdd={addPlannedMeal}
      />

      <ConfirmDialog
        isOpen={clearWeekOpen}
        onClose={() => setClearWeekOpen(false)}
        onConfirm={() => {
          clearWeek();
          setClearWeekOpen(false);
        }}
        title="Clear week"
        description="Remove all planned meals for this week?"
        confirmLabel="Clear week"
        isDestructive
      />

      <Modal isOpen={copyDayOpen} onClose={() => setCopyDayOpen(false)} title="Copy day" size="sm">
        <div className="space-y-4">
          <Select label="From" value={copyFromDay} options={PLANNER_DAYS} onChange={(e) => setCopyFromDay(e.target.value)} />
          <Select label="To" value={copyToDay} options={PLANNER_DAYS} onChange={(e) => setCopyToDay(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCopyDayOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                copyDay(copyFromDay, copyToDay);
                setCopyDayOpen(false);
                showMessage("Day copied.");
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={moveMeal !== null} onClose={() => setMoveMeal(null)} title="Move meal" size="sm">
        <div className="space-y-4">
          <Select label="Move to day" value={moveToDay} options={PLANNER_DAYS} onChange={(e) => setMoveToDay(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setMoveMeal(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (moveMeal) {
                  movePlannedMeal(moveMeal.id, moveToDay);
                  setMoveMeal(null);
                  showMessage("Meal moved.");
                }
              }}
            >
              Move
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
