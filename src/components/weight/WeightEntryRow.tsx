"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { WeightEntry } from "@/types/weight";
import { Button } from "@/components/common/Button";
import { formatDisplayDate } from "@/utils/date";

interface WeightEntryRowProps {
  entry: WeightEntry;
  onEdit: (entry: WeightEntry) => void;
  onDelete: (entry: WeightEntry) => void;
}

export function WeightEntryRow({ entry, onEdit, onDelete }: WeightEntryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{formatDisplayDate(entry.date)}</p>
        <p className="text-xs text-muted-foreground">
          {entry.weight} kg
          {entry.waistMeasurement !== undefined
            ? ` · Waist ${entry.waistMeasurement} cm`
            : ""}
          {entry.notes ? ` · ${entry.notes}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(entry)} aria-label="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(entry)} aria-label="Delete">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
