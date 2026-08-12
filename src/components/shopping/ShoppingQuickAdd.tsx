"use client";

import { useEffect, useState } from "react";
import { Plus, ShoppingBag, X } from "lucide-react";
import type { ShoppingItem } from "@/types/shopping";
import type { ShoppingCategory } from "@/types/common";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SHOPPING_CATEGORY_OPTIONS } from "@/features/shopping-list/constants";
import { parseNumericInput } from "@/features/meal-calculator/validation";
import { WEIGHT_UNITS, UNIT_LABELS } from "@/utils/units";

interface ShoppingQuickAddProps {
  suggestedName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<ShoppingItem, "id">) => void;
}

/**
 * Inline quantity picker shown after tapping Add beside search.
 */
export function ShoppingQuickAdd({
  suggestedName = "",
  open,
  onOpenChange,
  onAdd,
}: ShoppingQuickAddProps) {
  const [name, setName] = useState(suggestedName);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("item");
  const [category, setCategory] = useState<ShoppingCategory>("other");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(suggestedName.trim());
      setQuantity(1);
      setUnit("item");
      setCategory(guessCategory(suggestedName));
      setError(null);
    }
  }, [open, suggestedName]);

  if (!open) return null;

  const handleAdd = () => {
    if (!name.trim()) {
      setError("Enter an item name.");
      return;
    }
    if (!(quantity > 0)) {
      setError("Quantity must be greater than zero.");
      return;
    }

    onAdd({
      name: name.trim(),
      quantity,
      unit,
      category,
      purchased: false,
    });
    onOpenChange(false);
  };

  return (
    <div
      id="shopping-quick-add-panel"
      className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-4 shadow-emerald-ring sm:p-5"
      role="dialog"
      aria-label="Choose quantity to buy"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-emerald-600 p-2 text-white">
            <ShoppingBag className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">
              How much do you want to buy?
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              Choose quantity and unit, then add it to your list.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-xl p-2 text-slate-500 hover:bg-white hover:text-slate-800"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <Input
          label="Item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. chicken breast"
          autoFocus={!suggestedName.trim()}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity"
            type="number"
            min={0}
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(parseNumericInput(e.target.value))}
            autoFocus={Boolean(suggestedName.trim())}
          />
          <Select
            label="Unit"
            value={unit}
            options={WEIGHT_UNITS.map((u) => ({
              value: u,
              label: UNIT_LABELS[u],
            }))}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <Select
          label="Category"
          value={category}
          options={SHOPPING_CATEGORY_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add to list
          </Button>
        </div>
      </div>
    </div>
  );
}

function guessCategory(name: string): ShoppingCategory {
  const n = name.toLowerCase();
  if (/chicken|beef|lamb|pork|mince|steak|meat/.test(n)) return "meat";
  if (/fish|salmon|prawn|seafood|tuna/.test(n)) return "seafood";
  if (/milk|yoghurt|yogurt|cheese|butter|cream/.test(n)) return "dairy";
  if (/apple|banana|berry|fruit|orange|grape/.test(n)) return "fruit";
  if (/lettuce|carrot|broccoli|veg|onion|tomato|spinach/.test(n))
    return "vegetables";
  if (/bread|bun|bagel|bakery/.test(n)) return "bakery";
  if (/juice|water|drink|soda|coffee|tea/.test(n)) return "drinks";
  if (/frozen|ice cream/.test(n)) return "frozen";
  if (/rice|pasta|oil|flour|sugar|sauce|pantry/.test(n)) return "pantry";
  return "other";
}
