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
  Wheat,
  Droplets,
  Package,
  CalendarDays,
  TrendingDown,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
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

const quickActions = [
  { label: "Calculate Meal", href: "/meal-calculator", icon: Calculator },
  { label: "Add Recipe", href: "/recipes", icon: BookOpen },
  { label: "Log Meal", href: "/daily-tracker", icon: Activity },
  { label: "Add Shopping Item", href: "/shopping-list", icon: ShoppingCart },
  { label: "Log Weight", href: "/weight-tracker", icon: Scale },
  { label: "Discover Recipes", href: "/discover", icon: Compass },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Today's Calories"
          value={Math.round(todayNutrition.calories)}
          subValue={`${Math.round(caloriesRemaining)} remaining`}
          icon={Flame}
        />
        <StatCard
          label="Protein"
          value={`${Math.round(todayNutrition.protein)}g`}
          subValue={`Goal: ${proteinGoal}g`}
          icon={Beef}
        />
        <StatCard
          label="Current Weight"
          value={`${currentWeight} kg`}
          subValue={`Target: ${targetWeight} kg`}
          icon={Scale}
          trend={weeklyChange < 0 ? "down" : weeklyChange > 0 ? "up" : "neutral"}
        />
        <StatCard
          label="Weekly Change"
          value={`${weeklyChange > 0 ? "+" : ""}${weeklyChange.toFixed(1)} kg`}
          subValue="Past 7 days"
          icon={TrendingDown}
          trend={weeklyChange < 0 ? "down" : weeklyChange > 0 ? "up" : "neutral"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Carbohydrates" value={`${Math.round(todayNutrition.carbs)}g`} icon={Wheat} />
        <StatCard label="Fat" value={`${Math.round(todayNutrition.fat)}g`} icon={Droplets} />
        <StatCard label="Meals Logged" value={meals.length} subValue="Today" icon={Activity} />
        <StatCard label="Saved Recipes" value={recipes.length} icon={BookOpen} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Shopping List"
          value={unpurchasedCount}
          subValue="Items to buy"
          icon={ShoppingCart}
        />
        <StatCard
          label="Pantry Alerts"
          value={lowStockCount}
          subValue="Low stock items"
          icon={Package}
        />
        <StatCard
          label="Weekly Grocery Est."
          value={formatCurrency(estimatedGroceryCost)}
          subValue="Based on list"
          icon={ShoppingCart}
        />
        <StatCard
          label="Planned Meals"
          value={plannedMeals.length}
          subValue="This week"
          icon={CalendarDays}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="secondary"
                  className="w-full justify-start h-auto py-3"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Nutrition</CardTitle>
            <CardDescription>Progress toward your daily goals</CardDescription>
          </CardHeader>
          <div className="space-y-4">
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
              label="Carbohydrates"
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
            <CardTitle>Weight Progress</CardTitle>
            <CardDescription>Your weight trend over time</CardDescription>
          </CardHeader>
          <WeightProgressChart data={sortedWeights} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Recipes</CardTitle>
            <CardDescription>Your latest saved meals</CardDescription>
          </CardHeader>
          <ul className="space-y-3">
            {recentRecipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium text-sm">{recipe.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(recipe.totalNutrition.calories / recipe.servings)} cal/serving
                  </p>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {recipe.category.replace("-", " ")}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planned Meals</CardTitle>
            <CardDescription>This week&apos;s meal plan</CardDescription>
          </CardHeader>
          <ul className="space-y-3">
            {plannedMeals.slice(0, 4).map((meal) => (
              <li
                key={meal.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium text-sm">{meal.recipeName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {meal.day} · {meal.mealType}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(meal.nutrition.calories)} cal
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shopping Summary</CardTitle>
            <CardDescription>Items on your list</CardDescription>
          </CardHeader>
          <ul className="space-y-3">
            {shoppingItems
              .filter((i) => !i.purchased)
              .slice(0, 4)
              .map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.category}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
          </ul>
          {lowStockCount > 0 ? (
            <p className="mt-4 text-sm text-warning">
              {lowStockCount} pantry item{lowStockCount !== 1 ? "s" : ""} running low
            </p>
          ) : null}
        </Card>
      </div>
    </>
  );
}
