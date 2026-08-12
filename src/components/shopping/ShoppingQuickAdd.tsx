"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import type { ShoppingItem } from "@/types/shopping";
import type { ShoppingCategory } from "@/types/common";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SHOPPING_CATEGORY_OPTIONS } from "@/features/shopping-list/constants";
import { parseNumericInput } from "@/features/meal-calculator/validation";
import { WEIGHT_UNITS, UNIT_LABELS } from "@/utils/units";

interface ShoppingQuickAddProps {
  /** Prefill from the current search query */
  suggestedName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<ShoppingItem, "id">) => void;
}

/**
 * Search-adjacent quick add: open a quantity panel to choose how much to buy.
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

  const addLabel = suggestedName.trim()
    ? `Add “${truncate(suggestedName.trim(), 22)}”`
    : "Add item";

  return (
    <div className="relative w-full sm:w-auto sm:min-w-[10.5rem]">
      <div className="flex flex-col gap-1.5">
        <span className="block text-sm font-medium text-muted-foreground sm:invisible sm:h-5">
          &nbsp;
        </span>
        <Button
          type="button"
          className="w-full rounded-xl sm:w-auto"
          onClick={() => onOpenChange(true)}
          aria-expanded={open}
          aria-controls="shopping-quick-add-panel"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>

      {open ? (
        <div
          id="shopping-quick-add-panel"
          className="fixed inset-x-4 bottom-24 z-40 rounded-2xl border border-border bg-card p-4 shadow-soft sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:z-20 sm:w-[22rem]"
          role="dialog"
          aria-label="Choose quantity to buy"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                How much do you want to buy?
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Set the quantity, then add it to your list.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
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
              onChange={(e) =>
                setCategory(e.target.value as ShoppingCategory)
              }
            />
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add to list
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
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
