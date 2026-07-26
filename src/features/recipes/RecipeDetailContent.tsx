"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Copy,
  Trash2,
  Activity,
  CalendarDays,
  ShoppingCart,
  Pencil,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RecipeEditModal } from "@/components/recipes/RecipeEditModal";
import { AddToPlannerModal } from "@/components/recipes/AddToPlannerModal";
import { NutritionSummary } from "@/components/meals/NutritionSummary";
import { useRecipeStore } from "@/stores/recipe.store";
import { useRecipeActions } from "@/features/recipes/useRecipeActions";
import {
  formatCategoryLabel,
  getPerServingNutrition,
} from "@/features/recipes/utils";
import { CATEGORY_PLACEHOLDER_COLORS } from "@/features/recipes/constants";

interface RecipeDetailContentProps {
  id: string;
}

export function RecipeDetailContent({ id }: RecipeDetailContentProps) {
  const recipes = useRecipeStore((s) => s.recipes);
  const recipe = useMemo(
    () => recipes.find((r) => r.id === id),
    [recipes, id]
  );
  const actions = useRecipeActions();

  const [editOpen, setEditOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!recipe) {
    return (
      <EmptyState
        icon={ArrowLeft}
        title="Recipe not found"
        description="This recipe may have been deleted or the link is invalid."
        actionLabel="Back to recipes"
        onAction={() => (window.location.href = "/recipes")}
      />
    );
  }

  const perServing = getPerServingNutrition(recipe);
  const placeholderGradient =
    CATEGORY_PLACEHOLDER_COLORS[recipe.category] ?? "from-muted to-muted";

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const totalTime =
    (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <>
      <div className="mb-4">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to recipes
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
          <div
            className={`relative h-48 sm:h-64 rounded-xl bg-gradient-to-br ${placeholderGradient} flex items-center justify-center overflow-hidden`}
          >
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            ) : (
              <span className="text-6xl font-bold text-muted-foreground/30">
                {recipe.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <PageHeader
            title={recipe.name}
            description={recipe.description}
          />

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="capitalize rounded-full bg-muted px-3 py-1">
              {formatCategoryLabel(recipe.category)}
            </span>
            {totalTime > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <Clock className="h-3.5 w-3.5" />
                {totalTime} min total
              </span>
            ) : null}
            <span className="rounded-full bg-muted px-3 py-1">
              {recipe.servings} servings · {recipe.servingSize}g each
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient) => (
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

          {recipe.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <p className="text-sm text-muted-foreground">{recipe.notes}</p>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <NutritionSummary
            title="Per serving"
            nutrition={perServing}
            subtitle="Estimated nutrition per serving"
          />

          <Card>
            <CardHeader>
              <CardTitle>Total recipe</CardTitle>
            </CardHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Calories</dt>
                <dd className="font-semibold">
                  {Math.round(recipe.totalNutrition.calories)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Protein</dt>
                <dd className="font-semibold">
                  {recipe.totalNutrition.protein.toFixed(1)}g
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Carbs</dt>
                <dd className="font-semibold">
                  {recipe.totalNutrition.carbs.toFixed(1)}g
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fat</dt>
                <dd className="font-semibold">
                  {recipe.totalNutrition.fat.toFixed(1)}g
                </dd>
              </div>
              {recipe.cookedWeight ? (
                <div>
                  <dt className="text-muted-foreground">Cooked weight</dt>
                  <dd className="font-semibold">{recipe.cookedWeight}g</dd>
                </div>
              ) : null}
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
                onClick={() => actions.toggleFavourite(recipe)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    recipe.isFavourite ? "fill-primary text-primary" : ""
                  }`}
                />
                {recipe.isFavourite ? "Remove favourite" : "Add to favourites"}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit recipe
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  actions.duplicateRecipe(recipe);
                  showMessage("Recipe duplicated.");
                }}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  actions.addToDailyTracker(recipe);
                  showMessage("Added to daily tracker.");
                }}
              >
                <Activity className="h-4 w-4" />
                Add to Daily Tracker
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
                  actions.addIngredientsToShoppingList(recipe);
                  showMessage("Ingredients added to shopping list.");
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Shopping List
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete recipe
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <RecipeEditModal
        recipe={recipe}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(recipeId, updates) => {
          actions.updateRecipe(recipeId, updates);
          showMessage("Recipe updated.");
        }}
      />

      <AddToPlannerModal
        recipe={recipe}
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        onConfirm={(day, mealType, servings) => {
          actions.addToMealPlanner(recipe, day, mealType, servings);
          showMessage("Added to meal planner.");
        }}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          actions.deleteRecipe(recipe.id);
          window.location.href = "/recipes";
        }}
        title="Delete recipe"
        description={`Are you sure you want to delete "${recipe.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
      />
    </>
  );
}
