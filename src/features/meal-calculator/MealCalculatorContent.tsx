"use client";

import type { Ingredient } from "@/types/ingredient";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, Plus, Save } from "lucide-react";
import type { IngredientDatabaseEntry } from "@/types/ingredient";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { IngredientRow } from "@/components/meals/IngredientRow";
import { IngredientPicker } from "@/components/meals/IngredientPicker";
import { NutritionSummary } from "@/components/meals/NutritionSummary";
import { SaveRecipeModal } from "@/components/meals/SaveRecipeModal";
import { useRecipeStore } from "@/stores/recipe.store";
import {
  sumNutrition,
  calculateTotalRawWeight,
  calculateNutritionPerGram,
  calculateNutritionPer100gCooked,
  calculateServingNutrition,
  roundNutrition,
} from "@/services/nutrition/nutrition-calculator.service";
import {
  createEmptyIngredient,
  ingredientFromDatabase,
  duplicateIngredient,
  moveIngredient,
  updateIngredientAt,
} from "@/features/meal-calculator/utils";
import {
  validateIngredient,
  validateCookedAndServing,
  parseNumericInput,
  type SaveRecipeFormData,
} from "@/features/meal-calculator/validation";
import { useRecentIngredients } from "@/features/meal-calculator/useRecentIngredients";

export function MealCalculatorContent() {
  const addRecipe = useRecipeStore((s) => s.addRecipe);
  const { recent, addRecent, hydrated: recentHydrated } = useRecentIngredients();

  const [ingredients, setIngredients] = useState([createEmptyIngredient()]);
  const [cookedWeight, setCookedWeight] = useState<string>("");
  const [servingWeight, setServingWeight] = useState<string>("350");
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const totalNutrition = useMemo(
    () => roundNutrition(sumNutrition(ingredients)),
    [ingredients]
  );
  const totalRawWeight = useMemo(
    () => calculateTotalRawWeight(ingredients),
    [ingredients]
  );

  const cookedWeightNum = parseNumericInput(cookedWeight);
  const servingWeightNum = parseNumericInput(servingWeight);

  const cookedValidation = validateCookedAndServing(
    cookedWeightNum,
    servingWeightNum,
    cookedWeight.trim().length > 0,
    servingWeight.trim().length > 0
  );

  const perGramNutrition =
    cookedWeightNum > 0
      ? roundNutrition(
          calculateNutritionPerGram(totalNutrition, cookedWeightNum)
        )
      : null;

  const per100gCookedNutrition =
    cookedWeightNum > 0
      ? roundNutrition(
          calculateNutritionPer100gCooked(totalNutrition, cookedWeightNum)
        )
      : null;

  const servingNutrition =
    cookedWeightNum > 0 && servingWeightNum > 0
      ? roundNutrition(
          calculateServingNutrition(
            totalNutrition,
            cookedWeightNum,
            servingWeightNum
          )
        )
      : null;

  const estimatedServings =
    cookedWeightNum > 0 && servingWeightNum > 0
      ? Math.max(1, Math.round(cookedWeightNum / servingWeightNum))
      : 1;

  const handleAddFromDatabase = (entry: IngredientDatabaseEntry) => {
    setIngredients((prev) => [...prev, ingredientFromDatabase(entry)]);
    addRecent(entry);
  };

  const handleAddManual = () => {
    setIngredients((prev) => [...prev, createEmptyIngredient()]);
  };

  const handleIngredientChange = (
    index: number,
    updates: Partial<Ingredient>
  ) => {
    setIngredients((prev) => updateIngredientAt(prev, index, updates));
    const id = ingredients[index]?.id;
    if (id && rowErrors[id]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleDuplicate = (index: number) => {
    setIngredients((prev) => [
      ...prev,
      duplicateIngredient(prev[index]),
    ]);
  };

  const handleDelete = (index: number) => {
    setIngredients((prev) => {
      if (prev.length <= 1) {
        return [createEmptyIngredient()];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    setIngredients((prev) => moveIngredient(prev, index, direction));
  };

  const validateAllIngredients = (): boolean => {
    const errors: Record<string, string> = {};
    for (const ingredient of ingredients) {
      const error = validateIngredient(ingredient);
      if (error) {
        errors[ingredient.id] = error;
      }
    }
    setRowErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenSave = () => {
    if (!validateAllIngredients()) return;
    setSaveModalOpen(true);
  };

  const handleSaveRecipe = (form: SaveRecipeFormData) => {
    if (!validateAllIngredients()) return;

    const servingSize = servingWeightNum > 0 ? servingWeightNum : 350;

    addRecipe({
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || undefined,
      ingredients: ingredients.filter((i) => i.name.trim().length > 0),
      totalNutrition,
      cookedWeight: cookedWeightNum > 0 ? cookedWeightNum : undefined,
      servingSize,
      servings: form.servings,
      prepTimeMinutes: form.prepTimeMinutes || undefined,
      cookTimeMinutes: form.cookTimeMinutes || undefined,
      notes: form.notes.trim() || undefined,
      isFavourite: form.isFavourite,
    });

    setSaveModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const hasValidIngredients = ingredients.some((i) => i.name.trim().length > 0);

  return (
    <>
      <PageHeader
        title="Meal Calculator"
        description="Add ingredients, calculate total nutrition, adjust for cooked weight, and determine per-serving macros."
      >
        <Button onClick={handleOpenSave} disabled={!hasValidIngredients}>
          <Save className="h-4 w-4" />
          Save Recipe
        </Button>
      </PageHeader>

      {saveSuccess ? (
        <div
          className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          Recipe saved successfully.{" "}
          <Link href="/recipes" className="underline font-medium">
            View My Recipes
          </Link>
        </div>
      ) : null}

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Ingredients</CardTitle>
          </CardHeader>
          {recentHydrated ? (
            <IngredientPicker
              recentEntries={recent}
              onSelect={handleAddFromDatabase}
              onAddManual={handleAddManual}
            />
          ) : null}
        </Card>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Ingredient List</h2>
          <Button variant="secondary" size="sm" onClick={handleAddManual}>
            <Plus className="h-4 w-4" />
            Add row
          </Button>
        </div>

        {ingredients.length === 0 ? (
          <EmptyState
            icon={Calculator}
            title="No ingredients yet"
            description="Search the database or add a custom ingredient to start calculating."
            actionLabel="Add ingredient"
            onAction={handleAddManual}
          />
        ) : (
          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <IngredientRow
                key={ingredient.id}
                ingredient={ingredient}
                index={index}
                totalCount={ingredients.length}
                error={rowErrors[ingredient.id]}
                onChange={(updates) => handleIngredientChange(index, updates)}
                onDuplicate={() => handleDuplicate(index)}
                onDelete={() => handleDelete(index)}
                onMoveUp={() => handleMove(index, "up")}
                onMoveDown={() => handleMove(index, "down")}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recipe Totals (Raw)</CardTitle>
          </CardHeader>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Total raw weight</dt>
              <dd className="text-xl font-bold">
                {Math.round(totalRawWeight)}g
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total calories</dt>
              <dd className="text-xl font-bold">{totalNutrition.calories}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total protein</dt>
              <dd className="text-xl font-bold">{totalNutrition.protein}g</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total carbs</dt>
              <dd className="text-xl font-bold">{totalNutrition.carbs}g</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total fat</dt>
              <dd className="text-xl font-bold">{totalNutrition.fat}g</dd>
            </div>
            {totalNutrition.fibre !== undefined && totalNutrition.fibre > 0 ? (
              <div>
                <dt className="text-xs text-muted-foreground">Total fibre</dt>
                <dd className="text-xl font-bold">{totalNutrition.fibre}g</dd>
              </div>
            ) : null}
          </dl>
        </Card>

        <NutritionSummary
          title="Raw Nutrition Summary"
          nutrition={totalNutrition}
          subtitle="Based on ingredient quantities before cooking"
        />
      </section>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Cooked Weight Calculator</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter the final cooked weight to calculate nutrition per gram and per
            100g after cooking.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Final cooked weight (g)"
              type="number"
              min={0}
              step="any"
              value={cookedWeight}
              onChange={(e) => setCookedWeight(e.target.value)}
              placeholder="e.g. 1800"
              error={cookedValidation.cookedWeightError}
            />
            <Input
              label="Serving weight (g)"
              type="number"
              min={0}
              step="any"
              value={servingWeight}
              onChange={(e) => setServingWeight(e.target.value)}
              placeholder="e.g. 350"
              error={cookedValidation.servingWeightError}
            />
          </div>
          {cookedValidation.servingWeightWarning ? (
            <p className="mt-2 text-sm text-warning">
              {cookedValidation.servingWeightWarning}
            </p>
          ) : null}
        </Card>
      </section>

      {cookedWeightNum > 0 ? (
        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          {perGramNutrition ? (
            <NutritionSummary
              title="Per 1 gram"
              nutrition={perGramNutrition}
              subtitle={`From ${cookedWeightNum}g cooked weight`}
            />
          ) : null}
          {per100gCookedNutrition ? (
            <NutritionSummary
              title="Per 100g cooked"
              nutrition={per100gCookedNutrition}
            />
          ) : null}
          {servingNutrition ? (
            <NutritionSummary
              title={`Per serving (${servingWeightNum}g)`}
              nutrition={servingNutrition}
              subtitle={`~${estimatedServings} servings total`}
            />
          ) : null}
        </section>
      ) : null}

      <SaveRecipeModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveRecipe}
        defaultServingSize={servingWeightNum > 0 ? servingWeightNum : 350}
        defaultServings={estimatedServings}
        totalNutrition={totalNutrition}
      />
    </>
  );
}
