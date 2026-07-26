"use client";

import { useEffect, useState } from "react";
import type { MealEntry } from "@/types/meal";
import type { MealType } from "@/types/common";
import type { Recipe } from "@/types/recipe";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { MEAL_TYPE_OPTIONS } from "@/features/recipes/constants";
import { getPerServingNutrition } from "@/features/recipes/utils";
import { parseNumericInput } from "@/features/meal-calculator/validation";

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  defaultMealType?: MealType;
  selectedDate: string;
  editMeal?: MealEntry | null;
  onSave: (meal: Omit<MealEntry, "id">) => void;
  onUpdate?: (id: string, updates: Partial<MealEntry>) => void;
}

export function AddMealModal({
  isOpen,
  onClose,
  recipes,
  defaultMealType = "lunch",
  selectedDate,
  editMeal,
  onSave,
  onUpdate,
}: AddMealModalProps) {
  const [mode, setMode] = useState<"recipe" | "custom">("recipe");
  const [recipeId, setRecipeId] = useState("");
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [servings, setServings] = useState(1);
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editMeal) {
      setMode("custom");
      setName(editMeal.name);
      setMealType(editMeal.mealType);
      setServings(editMeal.servingAmount);
      setCalories(editMeal.nutrition.calories);
      setProtein(editMeal.nutrition.protein);
      setCarbs(editMeal.nutrition.carbs);
      setFat(editMeal.nutrition.fat);
      setDate(editMeal.date);
      setRecipeId(editMeal.recipeId ?? "");
    } else {
      setMode("recipe");
      setRecipeId(recipes[0]?.id ?? "");
      setName("");
      setMealType(defaultMealType);
      setServings(1);
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);
      setDate("");
    }
    setError(null);
  }, [isOpen, editMeal, recipes, defaultMealType, selectedDate]);

  useEffect(() => {
    if (isOpen && !editMeal) {
      setDate(selectedDate);
    }
  }, [isOpen, editMeal, selectedDate]);

  const handleRecipeSelect = (id: string) => {
    setRecipeId(id);
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      const nutrition = getPerServingNutrition(recipe);
      setName(recipe.name);
      setCalories(nutrition.calories);
      setProtein(nutrition.protein);
      setCarbs(nutrition.carbs);
      setFat(nutrition.fat);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("Food name is required.");
      return;
    }
    const entry: Omit<MealEntry, "id"> = {
      name: name.trim(),
      servingAmount: servings,
      nutrition: { calories, protein, carbs, fat },
      mealType,
      date,
      recipeId: mode === "recipe" && recipeId ? recipeId : undefined,
    };

    if (editMeal && onUpdate) {
      onUpdate(editMeal.id, entry);
    } else {
      onSave(entry);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMeal ? "Edit meal" : "Log meal"}
      size="md"
    >
      <div className="space-y-4">
        {!editMeal ? (
          <div className="flex gap-2">
            <Button
              variant={mode === "recipe" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setMode("recipe")}
            >
              From recipe
            </Button>
            <Button
              variant={mode === "custom" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setMode("custom")}
            >
              Custom entry
            </Button>
          </div>
        ) : null}

        {mode === "recipe" && !editMeal ? (
          <Select
            label="Saved recipe"
            value={recipeId}
            options={recipes.map((r) => ({ value: r.id, label: r.name }))}
            onChange={(e) => handleRecipeSelect(e.target.value)}
          />
        ) : null}

        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select
          label="Meal"
          value={mealType}
          options={MEAL_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(e) => setMealType(e.target.value as MealType)}
        />
        <Input
          label="Servings"
          type="number"
          min={0.5}
          step="any"
          value={servings}
          onChange={(e) => {
            const s = parseNumericInput(e.target.value);
            setServings(s);
            if (mode === "recipe" && recipeId) {
              const recipe = recipes.find((r) => r.id === recipeId);
              if (recipe) {
                const n = getPerServingNutrition(recipe);
                setCalories(n.calories * s);
                setProtein(n.protein * s);
                setCarbs(n.carbs * s);
                setFat(n.fat * s);
              }
            }
          }}
        />

        {mode === "custom" || editMeal ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Calories"
              type="number"
              min={0}
              value={calories}
              onChange={(e) => setCalories(parseNumericInput(e.target.value))}
            />
            <Input
              label="Protein (g)"
              type="number"
              min={0}
              value={protein}
              onChange={(e) => setProtein(parseNumericInput(e.target.value))}
            />
            <Input
              label="Carbs (g)"
              type="number"
              min={0}
              value={carbs}
              onChange={(e) => setCarbs(parseNumericInput(e.target.value))}
            />
            <Input
              label="Fat (g)"
              type="number"
              min={0}
              value={fat}
              onChange={(e) => setFat(parseNumericInput(e.target.value))}
            />
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editMeal ? "Save" : "Log meal"}</Button>
        </div>
      </div>
    </Modal>
  );
}
