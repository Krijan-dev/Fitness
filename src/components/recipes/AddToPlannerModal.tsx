"use client";

import { useEffect, useState } from "react";
import type { Recipe } from "@/types/recipe";
import type { MealType } from "@/types/common";
import { Modal } from "@/components/common/Modal";
import { Select } from "@/components/common/Select";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import {
  PLANNER_DAYS,
  MEAL_TYPE_OPTIONS,
} from "@/features/recipes/constants";
import { categoryToMealType } from "@/features/recipes/utils";
import { parseNumericInput } from "@/features/meal-calculator/validation";

interface AddToPlannerModalProps {
  recipe: Recipe | null;
  recipeName?: string;
  defaultMealType?: MealType;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (day: string, mealType: MealType, servings: number) => void;
}

export function AddToPlannerModal({
  recipe,
  recipeName,
  defaultMealType,
  isOpen,
  onClose,
  onConfirm,
}: AddToPlannerModalProps) {
  const [day, setDay] = useState("monday");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [servings, setServings] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    setDay("monday");
    setServings(1);
    if (recipe) {
      setMealType(categoryToMealType(recipe.category));
    } else if (defaultMealType) {
      setMealType(defaultMealType);
    }
  }, [isOpen, recipe, defaultMealType]);

  const handleConfirm = () => {
    onConfirm(day, mealType, servings);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Meal Planner"
      description={
        recipe
          ? `Plan "${recipe.name}" for the week.`
          : recipeName
            ? `Plan "${recipeName}" for the week.`
            : undefined
      }
      size="sm"
    >
      <div className="space-y-4">
        <Select
          label="Day"
          value={day}
          options={PLANNER_DAYS}
          onChange={(e) => setDay(e.target.value)}
        />
        <Select
          label="Meal"
          value={mealType}
          options={MEAL_TYPE_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
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
          <Button onClick={handleConfirm}>Add to planner</Button>
        </div>
      </div>
    </Modal>
  );
}
