"use client";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
} from "lucide-react";
import type { Ingredient } from "@/types/ingredient";
import type { WeightUnit } from "@/types/common";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { getUnitOptions, requiresGramEquivalent } from "@/utils/units";
import {
  calculateIngredientNutrition,
  getIngredientGrams,
} from "@/services/nutrition/nutrition-calculator.service";
import { parseNumericInput } from "@/features/meal-calculator/validation";

interface IngredientRowProps {
  ingredient: Ingredient;
  index: number;
  totalCount: number;
  error?: string;
  onChange: (updates: Partial<Ingredient>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function IngredientRow({
  ingredient,
  index,
  totalCount,
  error,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: IngredientRowProps) {
  const rowNutrition = calculateIngredientNutrition(ingredient);
  const needsGramEquivalent =
    requiresGramEquivalent(ingredient.unit) && getIngredientGrams(ingredient) === null;

  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 ${
        error ? "border-destructive/50" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Ingredient {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move ingredient up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
            aria-label="Move ingredient down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            aria-label="Duplicate ingredient"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            aria-label="Delete ingredient"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Name"
          value={ingredient.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Chicken breast"
        />
        <Input
          label="Quantity"
          type="number"
          min={0}
          step="any"
          value={ingredient.quantity || ""}
          onChange={(e) =>
            onChange({ quantity: parseNumericInput(e.target.value) })
          }
        />
        <Select
          label="Unit"
          value={ingredient.unit}
          options={getUnitOptions()}
          onChange={(e) =>
            onChange({ unit: e.target.value as WeightUnit })
          }
        />
        <Input
          label="Brand (optional)"
          value={ingredient.brand ?? ""}
          onChange={(e) => onChange({ brand: e.target.value })}
          placeholder="Optional"
        />
      </div>

      {needsGramEquivalent ? (
        <div className="mt-3">
          <Input
            label="Gram equivalent"
            type="number"
            min={0}
            step="any"
            value={ingredient.gramEquivalent ?? ""}
            onChange={(e) =>
              onChange({ gramEquivalent: parseNumericInput(e.target.value) })
            }
            placeholder="Weight in grams for this quantity"
          />
          <p className="mt-1 text-xs text-warning">
            This unit requires a gram equivalent for accurate calculations.
          </p>
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Cal / 100g"
          type="number"
          min={0}
          step="any"
          value={ingredient.caloriesPer100g || ""}
          onChange={(e) =>
            onChange({ caloriesPer100g: parseNumericInput(e.target.value) })
          }
        />
        <Input
          label="Protein / 100g"
          type="number"
          min={0}
          step="any"
          value={ingredient.proteinPer100g || ""}
          onChange={(e) =>
            onChange({ proteinPer100g: parseNumericInput(e.target.value) })
          }
        />
        <Input
          label="Carbs / 100g"
          type="number"
          min={0}
          step="any"
          value={ingredient.carbsPer100g || ""}
          onChange={(e) =>
            onChange({ carbsPer100g: parseNumericInput(e.target.value) })
          }
        />
        <Input
          label="Fat / 100g"
          type="number"
          min={0}
          step="any"
          value={ingredient.fatPer100g || ""}
          onChange={(e) =>
            onChange({ fatPer100g: parseNumericInput(e.target.value) })
          }
        />
        <Input
          label="Fibre / 100g"
          type="number"
          min={0}
          step="any"
          value={ingredient.fibrePer100g ?? ""}
          onChange={(e) =>
            onChange({
              fibrePer100g: parseNumericInput(e.target.value) || undefined,
            })
          }
          placeholder="Optional"
        />
      </div>

      <div className="mt-3">
        <Input
          label="Notes (optional)"
          value={ingredient.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Preparation notes"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>Row total: {Math.round(rowNutrition.calories)} cal</span>
        <span>{rowNutrition.protein.toFixed(1)}g protein</span>
        <span>{rowNutrition.carbs.toFixed(1)}g carbs</span>
        <span>{rowNutrition.fat.toFixed(1)}g fat</span>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
