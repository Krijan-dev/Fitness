"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ShoppingCart, Tags } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterBar } from "@/components/layout/FilterBar";
import { PageSection } from "@/components/layout/PageSection";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ShoppingItemRow } from "@/components/shopping/ShoppingItemRow";
import { ShoppingItemModal } from "@/components/shopping/ShoppingItemModal";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { useDebounce } from "@/hooks/useDebounce";
import {
  SHOPPING_FILTER_OPTIONS,
  type ShoppingFilterOption,
} from "@/features/shopping-list/constants";
import {
  filterShoppingItems,
  groupShoppingByCategory,
} from "@/features/shopping-list/utils";
import type { ShoppingItem } from "@/types/shopping";

export function ShoppingListContent() {
  const items = useShoppingListStore((s) => s.items);
  const addItem = useShoppingListStore((s) => s.addItem);
  const updateItem = useShoppingListStore((s) => s.updateItem);
  const removeItem = useShoppingListStore((s) => s.removeItem);
  const togglePurchased = useShoppingListStore((s) => s.togglePurchased);
  const markAllPurchased = useShoppingListStore((s) => s.markAllPurchased);
  const clearPurchased = useShoppingListStore((s) => s.clearPurchased);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ShoppingFilterOption>("unpurchased");
  const debouncedSearch = useDebounce(search, 300);

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ShoppingItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ShoppingItem | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredItems = useMemo(
    () => filterShoppingItems(items, debouncedSearch, filter),
    [items, debouncedSearch, filter]
  );

  const grouped = useMemo(
    () => groupShoppingByCategory(filteredItems),
    [filteredItems]
  );

  const unpurchasedCount = items.filter((i) => !i.purchased).length;
  const purchasedCount = items.filter((i) => i.purchased).length;

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleClearPurchased = () => {
    clearPurchased();
    setClearOpen(false);
    showMessage("Purchased items removed.");
  };

  return (
    <>
      <PageHeader
        title="Shopping List"
        description="Manage grocery items manually or from recipes and meal plans."
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/price-comparison">
            <Button variant="secondary">
              <Tags className="h-4 w-4" />
              Find cheapest basket
            </Button>
          </Link>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>
      </PageHeader>

      {actionMessage ? (
        <div
          className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      <PageSection>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            compact
            label="To buy"
            value={unpurchasedCount}
            icon={ShoppingCart}
          />
          <StatCard compact label="Purchased" value={purchasedCount} />
          <StatCard compact label="Total" value={items.length} />
        </div>
      </PageSection>

      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search items..."
            label="Search"
          />
        </div>
        <Select
          label="Show"
          value={filter}
          options={SHOPPING_FILTER_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) =>
            setFilter(e.target.value as ShoppingFilterOption)
          }
        />
      </FilterBar>

      <PageSection>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              markAllPurchased();
              showMessage("All items marked purchased.");
            }}
            disabled={unpurchasedCount === 0}
          >
            Mark all purchased
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setClearOpen(true)}
            disabled={purchasedCount === 0}
          >
            Clear purchased
          </Button>
        </div>
      </PageSection>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={items.length === 0 ? "No shopping items yet" : "No matching items"}
          description={
            items.length === 0
              ? "Add items manually or generate from recipes and your meal plan."
              : "Try adjusting your search or filter."
          }
          actionLabel={items.length === 0 ? "Add item" : undefined}
          onAction={items.length === 0 ? () => setAddOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <Card key={group.category}>
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    onTogglePurchased={(i) => togglePurchased(i.id)}
                    onEdit={setEditItem}
                    onDelete={setDeleteItem}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ShoppingItemModal
        item={null}
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(data) => {
          addItem(data);
          showMessage("Item added.");
        }}
      />

      <ShoppingItemModal
        item={editItem}
        isOpen={editItem !== null}
        onClose={() => setEditItem(null)}
        onSave={() => {}}
        onUpdate={(id, updates) => {
          updateItem(id, updates);
          showMessage("Item updated.");
        }}
      />

      <ConfirmDialog
        isOpen={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem) {
            removeItem(deleteItem.id);
            setDeleteItem(null);
            showMessage("Item deleted.");
          }
        }}
        title="Delete item"
        description={`Remove "${deleteItem?.name}" from your shopping list?`}
        confirmLabel="Delete"
        isDestructive
      />

      <ConfirmDialog
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClearPurchased}
        title="Clear purchased items"
        description="Remove all purchased items from your shopping list?"
        confirmLabel="Clear"
        isDestructive
      />
    </>
  );
}
