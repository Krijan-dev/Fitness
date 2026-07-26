"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeEditModal } from "@/components/recipes/RecipeEditModal";
import { AddToPlannerModal } from "@/components/recipes/AddToPlannerModal";
import { useRecipeStore } from "@/stores/recipe.store";
import { useDebounce } from "@/hooks/useDebounce";
import { useRecipeActions } from "@/features/recipes/useRecipeActions";
import {
  filterRecipes,
  sortRecipes,
  type RecipeFilterOption,
  type RecipeSortOption,
} from "@/features/recipes/utils";
import {
  RECIPE_FILTER_OPTIONS,
  RECIPE_SORT_OPTIONS,
} from "@/features/recipes/constants";
import type { Recipe } from "@/types/recipe";

export function RecipeLibraryContent() {
  const recipes = useRecipeStore((s) => s.recipes);
  const actions = useRecipeActions();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RecipeFilterOption>("all");
  const [sort, setSort] = useState<RecipeSortOption>("newest");
  const debouncedSearch = useDebounce(search, 300);

  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [plannerRecipe, setPlannerRecipe] = useState<Recipe | null>(null);
  const [deleteRecipe, setDeleteRecipe] = useState<Recipe | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    const filtered = filterRecipes(recipes, debouncedSearch, filter);
    return sortRecipes(filtered, sort);
  }, [recipes, debouncedSearch, filter, sort]);

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleDeleteConfirm = () => {
    if (deleteRecipe) {
      actions.deleteRecipe(deleteRecipe.id);
      setDeleteRecipe(null);
      showMessage("Recipe deleted.");
    }
  };

  return (
    <>
      <PageHeader
        title="My Recipes"
        description="Browse, search, and manage your personal recipe library."
      >
        <Link href="/meal-calculator">
          <Button>
            <Plus className="h-4 w-4" />
            New Recipe
          </Button>
        </Link>
      </PageHeader>

      {actionMessage ? (
        <div
          className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search recipes or ingredients..."
          label="Search"
        />
        <Select
          label="Filter"
          value={filter}
          options={RECIPE_FILTER_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) =>
            setFilter(e.target.value as RecipeFilterOption)
          }
        />
        <Select
          label="Sort"
          value={sort}
          options={RECIPE_SORT_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) => setSort(e.target.value as RecipeSortOption)}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {RECIPE_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {filteredRecipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={recipes.length === 0 ? "No recipes yet" : "No matching recipes"}
          description={
            recipes.length === 0
              ? "Create a recipe with the Meal Calculator or save one from Discover."
              : "Try adjusting your search or filters."
          }
          actionLabel={recipes.length === 0 ? "Calculate a meal" : undefined}
          onAction={
            recipes.length === 0
              ? () => {
                  window.location.assign("/meal-calculator");
                }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={setEditRecipe}
              onDuplicate={(r) => {
                actions.duplicateRecipe(r);
                showMessage("Recipe duplicated.");
              }}
              onDelete={setDeleteRecipe}
              onToggleFavourite={actions.toggleFavourite}
              onAddToTracker={(r) => {
                actions.addToDailyTracker(r);
                showMessage("Added to daily tracker.");
              }}
              onAddToPlanner={setPlannerRecipe}
              onAddToShoppingList={(r) => {
                actions.addIngredientsToShoppingList(r);
                showMessage("Ingredients added to shopping list.");
              }}
            />
          ))}
        </div>
      )}

      <RecipeEditModal
        recipe={editRecipe}
        isOpen={editRecipe !== null}
        onClose={() => setEditRecipe(null)}
        onSave={(id, updates) => {
          actions.updateRecipe(id, updates);
          showMessage("Recipe updated.");
        }}
      />

      <AddToPlannerModal
        recipe={plannerRecipe}
        isOpen={plannerRecipe !== null}
        onClose={() => setPlannerRecipe(null)}
        onConfirm={(day, mealType, servings) => {
          if (plannerRecipe) {
            actions.addToMealPlanner(plannerRecipe, day, mealType, servings);
            showMessage("Added to meal planner.");
          }
        }}
      />

      <ConfirmDialog
        isOpen={deleteRecipe !== null}
        onClose={() => setDeleteRecipe(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete recipe"
        description={
          deleteRecipe
            ? `Are you sure you want to delete "${deleteRecipe.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        isDestructive
      />
    </>
  );
}
