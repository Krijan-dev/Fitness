"use client";

import { useMemo, useState } from "react";
import { Plus, Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PantryItemRow } from "@/components/pantry/PantryItemRow";
import { PantryItemModal } from "@/components/pantry/PantryItemModal";
import { CookWithWhatIHave } from "@/components/pantry/CookWithWhatIHave";
import { usePantryStore } from "@/stores/pantry.store";
import { useRecipeStore } from "@/stores/recipe.store";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { useDebounce } from "@/hooks/useDebounce";
import {
  PANTRY_FILTER_OPTIONS,
  type PantryFilterOption,
} from "@/features/pantry/constants";
import {
  filterPantryItems,
  groupCookMatches,
  isExpiringSoon,
  isExpired,
  isLowStock,
  matchRecipesToPantry,
} from "@/features/pantry/utils";
import type { PantryItem } from "@/types/pantry";
import type { RecipePantryMatch } from "@/features/pantry/utils";
import type { ShoppingCategory } from "@/types/common";
import { ingredientToShoppingCategory } from "@/utils/shopping-merge";
import type { Ingredient } from "@/types/ingredient";

function pantryCategoryToShopping(category: string): ShoppingCategory {
  const valid: ShoppingCategory[] = [
    "fruit", "vegetables", "meat", "seafood", "dairy",
    "frozen", "bakery", "pantry", "drinks", "household", "other",
  ];
  return valid.includes(category as ShoppingCategory)
    ? (category as ShoppingCategory)
    : "other";
}

export function PantryContent() {
  const items = usePantryStore((s) => s.items);
  const addItem = usePantryStore((s) => s.addItem);
  const updateItem = usePantryStore((s) => s.updateItem);
  const removeItem = usePantryStore((s) => s.removeItem);

  const recipes = useRecipeStore((s) => s.recipes);
  const addShoppingItem = useShoppingListStore((s) => s.addItem);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PantryFilterOption>("all");
  const debouncedSearch = useDebounce(search, 300);

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<PantryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<PantryItem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredItems = useMemo(
    () => filterPantryItems(items, debouncedSearch, categoryFilter),
    [items, debouncedSearch, categoryFilter]
  );

  const lowStockItems = useMemo(() => items.filter(isLowStock), [items]);
  const expiringItems = useMemo(
    () => items.filter((i) => isExpiringSoon(i) || isExpired(i)),
    [items]
  );

  const cookMatches = useMemo(
    () => matchRecipesToPantry(recipes, items),
    [recipes, items]
  );
  const { canMakeNow, missingOne, missingTwo } = groupCookMatches(cookMatches);

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleAddLowStockToShopping = () => {
    let added = 0;
    for (const item of lowStockItems) {
      const needed =
        item.lowStockThreshold !== undefined
          ? Math.max(item.lowStockThreshold - item.quantity, 1)
          : 1;
      addShoppingItem({
        name: item.name,
        quantity: needed,
        unit: item.unit,
        category: pantryCategoryToShopping(item.category),
        purchased: false,
      });
      added += 1;
    }
    showMessage(`${added} low-stock item${added !== 1 ? "s" : ""} added to shopping list.`);
  };

  const handleAddMissingToShopping = (match: RecipePantryMatch) => {
    let added = 0;
    for (const name of match.missingIngredients) {
      const ingredient = match.recipe.ingredients.find((i) => i.name === name);
      const stub: Ingredient = ingredient ?? {
        id: "",
        name,
        quantity: 1,
        unit: "item",
        caloriesPer100g: 0,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 0,
      };
      addShoppingItem({
        name,
        quantity: ingredient?.quantity ?? 1,
        unit: ingredient?.unit ?? "item",
        category: ingredientToShoppingCategory(stub),
        purchased: false,
        sourceRecipeIds: [match.recipe.id],
      });
      added += 1;
    }
    showMessage(`${added} missing ingredient${added !== 1 ? "s" : ""} added to shopping list.`);
  };

  return (
    <>
      <PageHeader
        title="Pantry"
        description="Track ingredients on hand, get alerts, and find recipes you can cook."
      >
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </PageHeader>

      {actionMessage ? (
        <div
          className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total items" value={items.length} icon={Package} />
        <StatCard
          label="Low stock"
          value={lowStockItems.length}
          icon={AlertTriangle}
        />
        <StatCard label="Expiring soon" value={expiringItems.length} />
        <StatCard label="Ready to cook" value={canMakeNow.length} />
      </div>

      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <Card className="mb-6 border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-base">Alerts</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {lowStockItems.length > 0 ? (
              <p>
                <span className="font-medium">{lowStockItems.length}</span> item
                {lowStockItems.length !== 1 ? "s" : ""} running low:{" "}
                {lowStockItems.map((i) => i.name).join(", ")}
              </p>
            ) : null}
            {expiringItems.length > 0 ? (
              <p>
                <span className="font-medium">{expiringItems.length}</span> item
                {expiringItems.length !== 1 ? "s" : ""} expiring soon or expired:{" "}
                {expiringItems.map((i) => i.name).join(", ")}
              </p>
            ) : null}
            {lowStockItems.length > 0 ? (
              <Button variant="secondary" size="sm" onClick={handleAddLowStockToShopping}>
                <ShoppingCart className="h-3.5 w-3.5" />
                Add low-stock to shopping list
              </Button>
            ) : null}
          </div>
        </Card>
      )}

      <CookWithWhatIHave
        canMakeNow={canMakeNow}
        missingOne={missingOne}
        missingTwo={missingTwo}
        onAddMissingToShopping={handleAddMissingToShopping}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search pantry..."
          label="Search"
        />
        <Select
          label="Category"
          value={categoryFilter}
          options={PANTRY_FILTER_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) =>
            setCategoryFilter(e.target.value as PantryFilterOption)
          }
        />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title={items.length === 0 ? "Pantry is empty" : "No matching items"}
          description={
            items.length === 0
              ? "Add ingredients you have on hand to track stock and find recipes."
              : "Try adjusting your search or category filter."
          }
          actionLabel={items.length === 0 ? "Add item" : undefined}
          onAction={items.length === 0 ? () => setAddOpen(true) : undefined}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pantry items</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <PantryItemRow
                key={item.id}
                item={item}
                onEdit={setEditItem}
                onDelete={setDeleteItem}
              />
            ))}
          </div>
        </Card>
      )}

      <PantryItemModal
        item={null}
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(data) => {
          addItem(data);
          showMessage("Pantry item added.");
        }}
      />

      <PantryItemModal
        item={editItem}
        isOpen={editItem !== null}
        onClose={() => setEditItem(null)}
        onSave={() => {}}
        onUpdate={(id, updates) => {
          updateItem(id, updates);
          showMessage("Pantry item updated.");
        }}
      />

      <ConfirmDialog
        isOpen={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem) {
            removeItem(deleteItem.id);
            setDeleteItem(null);
            showMessage("Pantry item deleted.");
          }
        }}
        title="Delete item"
        description={`Remove "${deleteItem?.name}" from your pantry?`}
        confirmLabel="Delete"
        isDestructive
      />
    </>
  );
}
