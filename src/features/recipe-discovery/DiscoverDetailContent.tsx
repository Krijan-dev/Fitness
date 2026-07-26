"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookmarkPlus,
  CalendarDays,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { AddToPlannerModal } from "@/components/recipes/AddToPlannerModal";
import { NutritionSummary } from "@/components/meals/NutritionSummary";
import type { DiscoveredRecipe } from "@/types/recipe";
import { useDiscoverActions } from "@/features/recipe-discovery/useDiscoverActions";
import {
  getTotalCookTime,
  scaleIngredients,
} from "@/features/recipe-discovery/utils";
import { parseNumericInput } from "@/features/meal-calculator/validation";

interface DiscoverDetailContentProps {
  id: string;
}

export function DiscoverDetailContent({ id }: DiscoverDetailContentProps) {
  const actions = useDiscoverActions();

  const [recipe, setRecipe] = useState<DiscoveredRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(1);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) {
          throw new Error("Not found");
        }
        const json = (await response.json()) as { data: DiscoveredRecipe };
        if (!cancelled) {
          setRecipe(json.data);
          setServings(json.data.servings);
        }
      } catch {
        if (!cancelled) {
          setError("Recipe not found or could not be loaded.");
          setRecipe(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return scaleIngredients(
      recipe.ingredients,
      recipe.servings,
      servings
    );
  }, [recipe, servings]);

  const perServingNutrition = recipe
    ? {
        calories: recipe.caloriesPerServing,
        protein: recipe.proteinPerServing,
        carbs: recipe.carbsPerServing,
        fat: recipe.fatPerServing,
      }
    : null;

  const batchNutrition = recipe
    ? {
        calories: recipe.caloriesPerServing * servings,
        protein: recipe.proteinPerServing * servings,
        carbs: recipe.carbsPerServing * servings,
        fat: recipe.fatPerServing * servings,
      }
    : null;

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 3000);
  };

  if (loading) {
    return <LoadingState message="Loading recipe..." />;
  }

  if (error || !recipe) {
    return (
      <EmptyState
        icon={ArrowLeft}
        title="Recipe not found"
        description={error ?? "This discovered recipe could not be loaded."}
        actionLabel="Back to Discover"
        onAction={() => window.location.assign("/discover")}
      />
    );
  }

  const totalTime = getTotalCookTime(recipe);

  return (
    <>
      <div className="mb-4">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </Link>
      </div>

      {actionMessage ? (
        <div
          className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden bg-muted">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            ) : null}
          </div>

          <PageHeader title={recipe.title} description={recipe.description} />

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {recipe.cuisine ? (
              <span className="rounded-full bg-muted px-3 py-1">
                {recipe.cuisine}
              </span>
            ) : null}
            {recipe.mealType ? (
              <span className="rounded-full bg-muted px-3 py-1 capitalize">
                {recipe.mealType}
              </span>
            ) : null}
            {totalTime > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <Clock className="h-3.5 w-3.5" />
                {recipe.prepTimeMinutes} prep · {recipe.cookTimeMinutes} cook
              </span>
            ) : null}
            {recipe.difficulty ? (
              <span className="rounded-full bg-muted px-3 py-1 capitalize">
                {recipe.difficulty}
              </span>
            ) : null}
            {recipe.source ? (
              <span className="rounded-full bg-muted px-3 py-1">
                Source: {recipe.source}
              </span>
            ) : null}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <ul className="space-y-2">
              {scaledIngredients.map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="flex justify-between gap-4 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{ingredient.name}</span>
                  <span className="text-muted-foreground shrink-0">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <ol className="space-y-3">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Servings</CardTitle>
            </CardHeader>
            <Input
              label="Adjust servings"
              type="number"
              min={1}
              value={servings}
              onChange={(e) =>
                setServings(Math.max(1, parseNumericInput(e.target.value)))
              }
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Ingredient quantities scale automatically.
            </p>
          </Card>

          {perServingNutrition ? (
            <NutritionSummary
              title="Per serving"
              nutrition={perServingNutrition}
              subtitle="Per single serving at published nutrition"
            />
          ) : null}

          {batchNutrition && servings !== 1 ? (
            <NutritionSummary
              title={`Total (${servings} servings)`}
              nutrition={batchNutrition}
            />
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Per original serving</CardTitle>
            </CardHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Calories</dt>
                <dd className="font-semibold">
                  {Math.round(recipe.caloriesPerServing)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Protein</dt>
                <dd className="font-semibold">{recipe.proteinPerServing}g</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Carbs</dt>
                <dd className="font-semibold">{recipe.carbsPerServing}g</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fat</dt>
                <dd className="font-semibold">{recipe.fatPerServing}g</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  actions.saveToMyRecipes({
                    ...recipe,
                    ingredients: scaledIngredients,
                    servings,
                  });
                  showMessage("Saved to My Recipes.");
                }}
              >
                <BookmarkPlus className="h-4 w-4" />
                Save to My Recipes
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setPlannerOpen(true)}
              >
                <CalendarDays className="h-4 w-4" />
                Add to Meal Planner
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  actions.addIngredientsToShoppingList(recipe, scaledIngredients);
                  showMessage("Ingredients added to shopping list.");
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Shopping List
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <AddToPlannerModal
        recipe={null}
        recipeName={recipe.title}
        defaultMealType={actions.defaultMealType(recipe)}
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        onConfirm={(day, mealType, plannerServings) => {
          actions.addToMealPlanner(recipe, day, mealType, plannerServings);
          showMessage("Added to meal planner.");
        }}
      />
    </>
  );
}
