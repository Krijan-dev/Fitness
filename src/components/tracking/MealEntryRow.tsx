"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import type { MealEntry } from "@/types/meal";
import { Button } from "@/components/common/Button";

interface MealEntryRowProps {
  meal: MealEntry;
  onEdit: (meal: MealEntry) => void;
  onDelete: (meal: MealEntry) => void;
  onDuplicate: (meal: MealEntry) => void;
}

export function MealEntryRow({
  meal,
  onEdit,
  onDelete,
  onDuplicate,
}: MealEntryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{meal.name}</p>
        <p className="text-xs text-muted-foreground">
          {Math.round(meal.nutrition.calories)} cal ·{" "}
          {meal.nutrition.protein.toFixed(1)}g protein ·{" "}
          {meal.servingAmount} serving
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="sm" onClick={() => onDuplicate(meal)} aria-label="Duplicate">
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(meal)} aria-label="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(meal)} aria-label="Delete">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
