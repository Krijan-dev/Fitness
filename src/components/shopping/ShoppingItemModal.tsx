"use client";

import { useEffect, useState } from "react";
import type { ShoppingItem } from "@/types/shopping";
import type { ShoppingCategory } from "@/types/common";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { SHOPPING_CATEGORY_OPTIONS } from "@/features/shopping-list/constants";
import { parseNumericInput } from "@/features/meal-calculator/validation";
import { WEIGHT_UNITS, UNIT_LABELS } from "@/utils/units";

interface ShoppingItemModalProps {
  item: ShoppingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ShoppingItem, "id">) => void;
  onUpdate?: (id: string, updates: Partial<ShoppingItem>) => void;
}

export function ShoppingItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  onUpdate,
}: ShoppingItemModalProps) {
  const isEdit = item !== null;

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("item");
  const [category, setCategory] = useState<ShoppingCategory>("other");
  const [preferredBrand, setPreferredBrand] = useState("");
  const [preferredStore, setPreferredStore] = useState("");
  const [notes, setNotes] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setName(item.name);
        setQuantity(item.quantity);
        setUnit(item.unit);
        setCategory(item.category);
        setPreferredBrand(item.preferredBrand ?? "");
        setPreferredStore(item.preferredStore ?? "");
        setNotes(item.notes ?? "");
        setPurchased(item.purchased);
      } else {
        setName("");
        setQuantity(1);
        setUnit("item");
        setCategory("other");
        setPreferredBrand("");
        setPreferredStore("");
        setNotes("");
        setPurchased(false);
      }
      setError(null);
    }
  }, [item, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    const data: Omit<ShoppingItem, "id"> = {
      name: name.trim(),
      quantity,
      unit,
      category,
      preferredBrand: preferredBrand.trim() || undefined,
      preferredStore: preferredStore.trim() || undefined,
      notes: notes.trim() || undefined,
      purchased,
      sourceRecipeIds: item?.sourceRecipeIds,
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
      title={isEdit ? "Edit Item" : "Add Item"}
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
          options={SHOPPING_CATEGORY_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Preferred brand"
            value={preferredBrand}
            onChange={(e) => setPreferredBrand(e.target.value)}
          />
          <Input
            label="Preferred store"
            value={preferredStore}
            onChange={(e) => setPreferredStore(e.target.value)}
          />
        </div>
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {isEdit ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={purchased}
              onChange={(e) => setPurchased(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            Mark as purchased
          </label>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{isEdit ? "Save" : "Add item"}</Button>
        </div>
      </div>
    </Modal>
  );
}
