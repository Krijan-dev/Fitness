"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { ShoppingItem } from "@/types/shopping";
import { Button } from "@/components/common/Button";
import { SHOPPING_CATEGORY_LABELS } from "@/features/shopping-list/constants";

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onTogglePurchased: (item: ShoppingItem) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (item: ShoppingItem) => void;
}

export function ShoppingItemRow({
  item,
  onTogglePurchased,
  onEdit,
  onDelete,
}: ShoppingItemRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
        item.purchased
          ? "border-border/50 bg-muted/30 opacity-70"
          : "border-border"
      }`}
    >
      <input
        type="checkbox"
        checked={item.purchased}
        onChange={() => onTogglePurchased(item)}
        className="h-4 w-4 shrink-0 rounded border-border accent-primary"
        aria-label={`Mark ${item.name} as purchased`}
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${item.purchased ? "line-through" : ""}`}>
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.quantity} {item.unit} · {SHOPPING_CATEGORY_LABELS[item.category]}
          {item.preferredBrand ? ` · ${item.preferredBrand}` : ""}
          {item.notes ? ` · ${item.notes}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(item)} aria-label="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(item)} aria-label="Delete">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
