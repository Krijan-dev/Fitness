"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import type { IngredientDatabaseEntry } from "@/types/ingredient";
import ingredientsData from "@/data/ingredients.json";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/common/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";

interface IngredientPickerProps {
  recentEntries: IngredientDatabaseEntry[];
  onSelect: (entry: IngredientDatabaseEntry) => void;
  onAddManual: () => void;
}

const allIngredients = ingredientsData as IngredientDatabaseEntry[];

export function IngredientPicker({
  recentEntries,
  onSelect,
  onAddManual,
}: IngredientPickerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return allIngredients.slice(0, 8);
    }
    const query = debouncedSearch.toLowerCase();
    return allIngredients.filter((entry) =>
      entry.name.toLowerCase().includes(query)
    );
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search ingredient database..."
          label="Search ingredients"
          className="flex-1"
        />
        <Button variant="secondary" onClick={onAddManual}>
          Add custom ingredient
        </Button>
      </div>

      {recentEntries.length > 0 ? (
        <Card padding="sm">
          <CardHeader className="mb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recently used
            </CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {recentEntries.map((entry) => (
              <Button
                key={entry.id}
                variant="secondary"
                size="sm"
                onClick={() => onSelect(entry)}
              >
                {entry.name}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {debouncedSearch.trim() ? "Search results" : "Common ingredients"}
        </p>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No ingredients found. Try a different search or add a custom ingredient.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="font-medium text-foreground">{entry.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {entry.caloriesPer100g} cal · {entry.proteinPer100g}g protein
                    per 100g
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
