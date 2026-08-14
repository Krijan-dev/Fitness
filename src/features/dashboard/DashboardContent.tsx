"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  BookOpen,
  Activity,
  ShoppingCart,
  Scale,
  Compass,
  Flame,
  Beef,
  CalendarDays,
  TrendingDown,
  Package,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Button } from "@/components/common/Button";
import { WeightProgressChart } from "@/components/charts/WeightProgressChart";
import { useDailyTrackerStore } from "@/stores/daily-tracker.store";
import { useRecipeStore } from "@/stores/recipe.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { usePantryStore } from "@/stores/pantry.store";
import { useWeightStore } from "@/stores/weight.store";
import { useSettingsStore } from "@/stores/settings.store";
import { useMealPlannerStore } from "@/stores/meal-planner.store";
import { formatDate } from "@/utils/date";
import { calculateWeeklyWeightChange } from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";
import { DailyTargetsSummary } from "@/components/dashboard/DailyTargetsSummary";

const quickActions = [
  { label: "Calculate meal", href: "/meal-calculator", icon: Calculator },
  { label: "Log meal", href: "/daily-tracker", icon: Activity },
  { label: "Plan week", href: "/meal-planner", icon: CalendarDays },
  { label: "Shopping list", href: "/shopping-list", icon: ShoppingCart },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Log weight", href: "/weight-tracker", icon: Scale },
];

export function DashboardContent() {
  const today = formatDate();
  const allMeals = useDailyTrackerStore((s) => s.meals);
  const meals = useMemo(
    () => allMeals.filter((m) => m.date === today),
    [allMeals, today]
  );
  const recipes = useRecipeStore((s) => s.recipes);
  const shoppingItems = useShoppingListStore((s) => s.items);
  const pantryItems = usePantryStore((s) => s.items);
  const weightEntries = useWeightStore((s) => s.entries);
  const settings = useSettingsStore((s) => s.settings);
  const plannedMeals = useMealPlannerStore((s) => s.plan.meals);

  const todayNutrition = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.nutrition.calories,
      protein: acc.protein + meal.nutrition.protein,
      carbs: acc.carbs + meal.nutrition.carbs,
      fat: acc.fat + meal.nutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calorieGoal = settings.nutritionGoals.dailyCalorieGoal;
  const proteinGoal = settings.nutritionGoals.dailyProteinGoal;
  const caloriesRemaining = Math.max(calorieGoal - todayNutrition.calories, 0);

  const sortedWeights = [...weightEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const currentWeight =
    sortedWeights[sortedWeights.length - 1]?.weight ??
    settings.profile.currentWeightKg ??
    0;
  const targetWeight = settings.profile.targetWeightKg ?? 0;
  const weeklyChange = calculateWeeklyWeightChange(sortedWeights);

  const lowStockCount = pantryItems.filter(
    (item) =>
      item.lowStockThreshold !== undefined &&
      item.quantity <= item.lowStockThreshold
  ).length;

  const unpurchasedCount = shoppingItems.filter((i) => !i.purchased).length;
  const recentRecipes = recipes.slice(0, 3);
  const estimatedGroceryCost = unpurchasedCount * 8.5;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your nutrition, meal prep, and progress at a glance."
      />

      <DailyTargetsSummary
        settings={settings}
        currentWeightKg={currentWeight || undefined}
      />

      <PageSection title="Today">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Calories"
            value={Math.round(todayNutrition.calories)}
            subValue={`${Math.round(caloriesRemaining)} left of ${calorieGoal}`}
            icon={Flame}
          />
          <StatCard
            label="Protein"
            value={`${Math.round(todayNutrition.protein)}g`}
            subValue={`Goal ${proteinGoal}g`}
            icon={Beef}
          />
          <StatCard
            label="Weight"
            value={`${currentWeight} kg`}
            subValue={`Target ${targetWeight} kg`}
            icon={Scale}
          />
          <StatCard
            label="Weekly change"
            value={`${weeklyChange > 0 ? "+" : ""}${weeklyChange.toFixed(1)} kg`}
            subValue="Past 7 days"
            icon={TrendingDown}
            trend={weeklyChange < 0 ? "down" : weeklyChange > 0 ? "up" : "neutral"}
          />
        </div>
      </PageSection>

      <PageSection title="Progress">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition goals</CardTitle>
              <CardDescription>Macros logged today</CardDescription>
            </CardHeader>
            <div className="space-y-5">
              <ProgressBar
                label="Calories"
                value={todayNutrition.calories}
                max={calorieGoal}
              />
              <ProgressBar
                label="Protein"
                value={todayNutrition.protein}
                max={proteinGoal}
                color="success"
              />
              <ProgressBar
                label="Carbs"
                value={todayNutrition.carbs}
                max={settings.nutritionGoals.dailyCarbGoal}
              />
              <ProgressBar
                label="Fat"
                value={todayNutrition.fat}
                max={settings.nutritionGoals.dailyFatGoal}
                color="warning"
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weight trend</CardTitle>
              <CardDescription>Recent entries</CardDescription>
            </CardHeader>
            <WeightProgressChart data={sortedWeights} />
          </Card>
        </div>
      </PageSection>

      <PageSection
        title="Quick actions"
        description="Jump straight to common tasks."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="secondary"
                  className="w-full justify-start h-auto py-3.5 px-4"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </PageSection>

      <PageSection title="Lists & planning">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            compact
            label="To buy"
            value={unpurchasedCount}
            subValue={formatCurrency(estimatedGroceryCost) + " est."}
            icon={ShoppingCart}
          />
          <StatCard
            compact
            label="Pantry alerts"
            value={lowStockCount}
            subValue="Low stock"
            icon={Package}
          />
          <StatCard
            compact
            label="Planned meals"
            value={plannedMeals.length}
            subValue="This week"
            icon={CalendarDays}
          />
          <StatCard
            compact
            label="Recipes"
            value={recipes.length}
            subValue="In your library"
            icon={BookOpen}
          />
        </div>
      </PageSection>

      <PageSection title="Recent activity">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recipes</CardTitle>
              <CardDescription>Recently saved</CardDescription>
            </CardHeader>
            <ul className="space-y-2">
              {recentRecipes.map((recipe) => (
                <li
                  key={recipe.id}
                  className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-3"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-sm truncate">{recipe.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {Math.round(recipe.totalNutrition.calories / recipe.servings)} cal/serving
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize shrink-0">
                    {recipe.category.replace("-", " ")}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meal plan</CardTitle>
              <CardDescription>Coming up this week</CardDescription>
            </CardHeader>
            <ul className="space-y-2">
              {plannedMeals.slice(0, 4).map((meal) => (
                <li
                  key={meal.id}
                  className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-3"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-sm truncate">{meal.recipeName}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {meal.day} · {meal.mealType}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {Math.round(meal.nutrition.calories)} cal
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shopping</CardTitle>
              <CardDescription>Next items to buy</CardDescription>
            </CardHeader>
            <ul className="space-y-2">
              {shoppingItems
                .filter((i) => !i.purchased)
                .slice(0, 4)
                .map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-3"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {item.category}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </PageSection>
    </>
  );
}
