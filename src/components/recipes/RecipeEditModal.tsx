"use client";

import { useEffect, useState } from "react";
import type { Recipe } from "@/types/recipe";
import type { RecipeCategory } from "@/types/common";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { RECIPE_CATEGORY_OPTIONS } from "@/features/meal-calculator/constants";
import { parseNumericInput } from "@/features/meal-calculator/validation";

interface RecipeEditModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Recipe>) => void;
}

export function RecipeEditModal({
  recipe,
  isOpen,
  onClose,
  onSave,
}: RecipeEditModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<RecipeCategory>("meal-prep");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(1);
  const [servingSize, setServingSize] = useState(350);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [isFavourite, setIsFavourite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipe && isOpen) {
      setName(recipe.name);
      setCategory(recipe.category);
      setDescription(recipe.description ?? "");
      setServings(recipe.servings);
      setServingSize(recipe.servingSize);
      setPrepTime(recipe.prepTimeMinutes ?? 0);
      setCookTime(recipe.cookTimeMinutes ?? 0);
      setNotes(recipe.notes ?? "");
      setIsFavourite(recipe.isFavourite);
      setError(null);
    }
  }, [recipe, isOpen]);

  const handleSave = () => {
    if (!recipe) return;
    if (!name.trim()) {
      setError("Recipe name is required.");
      return;
    }
    onSave(recipe.id, {
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      servings,
      servingSize,
      prepTimeMinutes: prepTime || undefined,
      cookTimeMinutes: cookTime || undefined,
      notes: notes.trim() || undefined,
      isFavourite,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Recipe"
      size="lg"
    >
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select
          label="Category"
          value={category}
          options={RECIPE_CATEGORY_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) => setCategory(e.target.value as RecipeCategory)}
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Servings"
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(parseNumericInput(e.target.value))}
          />
          <Input
            label="Serving size (g)"
            type="number"
            min={0}
            value={servingSize}
            onChange={(e) => setServingSize(parseNumericInput(e.target.value))}
          />
          <Input
            label="Prep time (min)"
            type="number"
            min={0}
            value={prepTime}
            onChange={(e) => setPrepTime(parseNumericInput(e.target.value))}
          />
        </div>
        <Input
          label="Cook time (min)"
          type="number"
          min={0}
          value={cookTime}
          onChange={(e) => setCookTime(parseNumericInput(e.target.value))}
        />
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFavourite}
            onChange={(e) => setIsFavourite(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Favourite
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </div>
    </Modal>
  );
}
