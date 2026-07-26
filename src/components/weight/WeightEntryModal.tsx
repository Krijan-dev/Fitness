"use client";

import { useEffect, useState } from "react";
import type { WeightEntry } from "@/types/weight";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { parseNumericInput } from "@/features/meal-calculator/validation";
import { formatDate } from "@/utils/date";

interface WeightEntryModalProps {
  entry: WeightEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<WeightEntry, "id">) => void;
  onUpdate?: (id: string, updates: Partial<WeightEntry>) => void;
}

export function WeightEntryModal({
  entry,
  isOpen,
  onClose,
  onSave,
  onUpdate,
}: WeightEntryModalProps) {
  const isEdit = entry !== null;

  const [date, setDate] = useState(formatDate());
  const [weight, setWeight] = useState(80);
  const [waist, setWaist] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setDate(entry.date);
        setWeight(entry.weight);
        setWaist(
          entry.waistMeasurement !== undefined
            ? String(entry.waistMeasurement)
            : ""
        );
        setNotes(entry.notes ?? "");
      } else {
        setDate(formatDate());
        setWeight(80);
        setWaist("");
        setNotes("");
      }
      setError(null);
    }
  }, [entry, isOpen]);

  const handleSave = () => {
    if (!date) {
      setError("Date is required.");
      return;
    }
    if (weight <= 0) {
      setError("Weight must be greater than zero.");
      return;
    }

    const waistVal = waist.trim() ? parseNumericInput(waist) : undefined;
    const data: Omit<WeightEntry, "id"> = {
      date,
      weight,
      waistMeasurement: waistVal,
      notes: notes.trim() || undefined,
    };

    if (isEdit && entry && onUpdate) {
      onUpdate(entry.id, data);
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Entry" : "Log Weight"}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Weight (kg)"
          type="number"
          min={0}
          step="any"
          value={weight}
          onChange={(e) => setWeight(parseNumericInput(e.target.value))}
        />
        <Input
          label="Waist measurement (cm)"
          type="number"
          min={0}
          step="any"
          value={waist}
          onChange={(e) => setWaist(e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <p className="text-xs text-muted-foreground">
          For tracking only — not medical advice.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{isEdit ? "Save" : "Add entry"}</Button>
        </div>
      </div>
    </Modal>
  );
}
