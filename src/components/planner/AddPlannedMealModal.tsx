"use client";

import { useEffect, useState } from "react";
import type { PlannedMeal } from "@/types/meal";
import type { MealType } from "@/types/common";
import type { Recipe } from "@/types/recipe";
import { Modal } from "@/components/common/Modal";
import { Select } from "@/components/common/Select";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { PLANNER_DAYS, MEAL_TYPE_OPTIONS } from "@/features/recipes/constants";
import { getPerServingNutrition } from "@/features/recipes/utils";
import { parseNumericInput } from "@/features/meal-calculator/validation";

interface AddPlannedMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  defaultDay?: string;
  defaultMealType?: MealType;
  onAdd: (meal: Omit<PlannedMeal, "id">) => void;
}

export function AddPlannedMealModal({
  isOpen,
  onClose,
  recipes,
  defaultDay = "monday",
  defaultMealType = "lunch",
  onAdd,
}: AddPlannedMealModalProps) {
  const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? "");
  const [day, setDay] = useState(defaultDay);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setRecipeId(recipes[0]?.id ?? "");
      setDay(defaultDay);
      setMealType(defaultMealType);
      setServings(1);
    }
  }, [isOpen, recipes, defaultDay, defaultMealType]);

  const handleAdd = () => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    const perServing = getPerServingNutrition(recipe);
    onAdd({
      recipeId: recipe.id,
      recipeName: recipe.name,
      mealType,
      day,
      servings,
      nutrition: {
        calories: perServing.calories * servings,
        protein: perServing.protein * servings,
        carbs: perServing.carbs * servings,
        fat: perServing.fat * servings,
      },
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add planned meal" size="sm">
      <div className="space-y-4">
        <Select
          label="Recipe"
          value={recipeId}
          options={recipes.map((r) => ({ value: r.id, label: r.name }))}
          onChange={(e) => setRecipeId(e.target.value)}
        />
        <Select label="Day" value={day} options={PLANNER_DAYS} onChange={(e) => setDay(e.target.value)} />
        <Select
          label="Meal"
          value={mealType}
          options={MEAL_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(e) => setMealType(e.target.value as MealType)}
        />
        <Input
          label="Servings"
          type="number"
          min={1}
          value={servings}
          onChange={(e) => setServings(parseNumericInput(e.target.value))}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd}>Add meal</Button>
        </div>
      </div>
    </Modal>
  );
}
