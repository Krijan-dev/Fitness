"use client";

import { useEffect, useState } from "react";
import type { Nutrition } from "@/types/nutrition";
import type { RecipeCategory } from "@/types/common";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { RECIPE_CATEGORY_OPTIONS } from "@/features/meal-calculator/constants";
import {
  type SaveRecipeFormData,
  validateSaveRecipeForm,
  parseNumericInput,
} from "@/features/meal-calculator/validation";

interface SaveRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: SaveRecipeFormData) => void;
  defaultServingSize: number;
  defaultServings: number;
  totalNutrition: Nutrition;
}

export function SaveRecipeModal({
  isOpen,
  onClose,
  onSave,
  defaultServingSize,
  defaultServings,
  totalNutrition,
}: SaveRecipeModalProps) {
  const [form, setForm] = useState<SaveRecipeFormData>({
    name: "",
    category: "meal-prep",
    description: "",
    servings: defaultServings > 0 ? defaultServings : 1,
    prepTimeMinutes: 0,
    cookTimeMinutes: 0,
    notes: "",
    isFavourite: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        category: "meal-prep",
        description: "",
        servings: defaultServings > 0 ? defaultServings : 1,
        prepTimeMinutes: 0,
        cookTimeMinutes: 0,
        notes: "",
        isFavourite: false,
      });
      setError(null);
    }
  }, [isOpen, defaultServings]);

  const handleSave = () => {
    const validationError = validateSaveRecipeForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save as Recipe"
      description={`Save this meal with ${Math.round(totalNutrition.calories)} total calories.`}
      size="lg"
    >
      <div className="space-y-4">
        <Input
          label="Recipe name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Chicken & Rice Bowl"
        />
        <Select
          label="Category"
          value={form.category}
          options={RECIPE_CATEGORY_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value as RecipeCategory })
          }
        />
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short description"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Servings"
            type="number"
            min={1}
            value={form.servings}
            onChange={(e) =>
              setForm({ ...form, servings: parseNumericInput(e.target.value) })
            }
          />
          <Input
            label="Serving size (g)"
            type="number"
            min={0}
            value={defaultServingSize}
            disabled
          />
          <Input
            label="Prep time (min)"
            type="number"
            min={0}
            value={form.prepTimeMinutes}
            onChange={(e) =>
              setForm({
                ...form,
                prepTimeMinutes: parseNumericInput(e.target.value),
              })
            }
          />
        </div>
        <Input
          label="Cook time (min)"
          type="number"
          min={0}
          value={form.cookTimeMinutes}
          onChange={(e) =>
            setForm({
              ...form,
              cookTimeMinutes: parseNumericInput(e.target.value),
            })
          }
        />
        <Input
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Optional notes"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFavourite}
            onChange={(e) =>
              setForm({ ...form, isFavourite: e.target.checked })
            }
            className="h-4 w-4 rounded border-border"
          />
          Mark as favourite
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Recipe</Button>
        </div>
      </div>
    </Modal>
  );
}
