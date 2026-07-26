"use client";

import { AlertTriangle, Calendar, Pencil, Trash2 } from "lucide-react";
import type { PantryItem } from "@/types/pantry";
import { Button } from "@/components/common/Button";
import { formatDisplayDate } from "@/utils/date";
import {
  isExpired,
  isExpiringSoon,
  isLowStock,
} from "@/features/pantry/utils";

interface PantryItemRowProps {
  item: PantryItem;
  onEdit: (item: PantryItem) => void;
  onDelete: (item: PantryItem) => void;
}

export function PantryItemRow({ item, onEdit, onDelete }: PantryItemRowProps) {
  const lowStock = isLowStock(item);
  const expiringSoon = isExpiringSoon(item);
  const expired = isExpired(item);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
        expired
          ? "border-destructive/40 bg-destructive/5"
          : lowStock || expiringSoon
            ? "border-warning/40 bg-warning/5"
            : "border-border"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{item.name}</p>
          {lowStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
              <AlertTriangle className="h-3 w-3" />
              Low stock
            </span>
          ) : null}
          {expired ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">
              Expired
            </span>
          ) : expiringSoon ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
              <Calendar className="h-3 w-3" />
              Expiring soon
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {item.quantity} {item.unit} · {item.category}
          {item.lowStockThreshold !== undefined
            ? ` · Alert below ${item.lowStockThreshold} ${item.unit}`
            : ""}
          {item.expiryDate
            ? ` · Expires ${formatDisplayDate(item.expiryDate)}`
            : ""}
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
