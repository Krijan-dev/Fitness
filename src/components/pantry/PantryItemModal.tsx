"use client";

import { useEffect, useState } from "react";
import type { PantryItem } from "@/types/pantry";
import type { ShoppingCategory } from "@/types/common";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { PANTRY_CATEGORY_OPTIONS } from "@/features/pantry/constants";
import { parseNumericInput } from "@/features/meal-calculator/validation";
import { WEIGHT_UNITS, UNIT_LABELS } from "@/utils/units";

interface PantryItemModalProps {
  item: PantryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PantryItem, "id">) => void;
  onUpdate?: (id: string, updates: Partial<PantryItem>) => void;
}

export function PantryItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  onUpdate,
}: PantryItemModalProps) {
  const isEdit = item !== null;

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("g");
  const [category, setCategory] = useState("pantry");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setName(item.name);
        setQuantity(item.quantity);
        setUnit(item.unit);
        setCategory(item.category);
        setLowStockThreshold(
          item.lowStockThreshold !== undefined
            ? String(item.lowStockThreshold)
            : ""
        );
        setExpiryDate(item.expiryDate ?? "");
        setNotes(item.notes ?? "");
      } else {
        setName("");
        setQuantity(0);
        setUnit("g");
        setCategory("pantry");
        setLowStockThreshold("");
        setExpiryDate("");
        setNotes("");
      }
      setError(null);
    }
  }, [item, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (quantity < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    const threshold = lowStockThreshold.trim()
      ? parseNumericInput(lowStockThreshold)
      : undefined;

    const data: Omit<PantryItem, "id"> = {
      name: name.trim(),
      quantity,
      unit,
      category,
      lowStockThreshold: threshold,
      expiryDate: expiryDate || undefined,
      notes: notes.trim() || undefined,
    };

    if (isEdit && item && onUpdate) {
      onUpdate(item.id, data);
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Pantry Item" : "Add Pantry Item"}
      size="md"
    >
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Quantity"
            type="number"
            min={0}
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(parseNumericInput(e.target.value))}
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
          options={PANTRY_CATEGORY_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Low-stock threshold"
            type="number"
            min={0}
            step="any"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Expiry date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{isEdit ? "Save" : "Add item"}</Button>
        </div>
      </div>
    </Modal>
  );
}
