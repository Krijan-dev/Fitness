"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ShoppingCart, Tags } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { ShoppingQuickAdd } from "@/components/shopping/ShoppingQuickAdd";
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

  const [quickAddOpen, setQuickAddOpen] = useState(false);
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

  const handleQuickAdd = (data: Omit<ShoppingItem, "id">) => {
    addItem(data);
    setSearch("");
    setQuickAddOpen(false);
    showMessage(`Added ${data.quantity} ${data.unit} of ${data.name}.`);
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
          <Button onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>
      </PageHeader>

      {actionMessage ? (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
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

      {/* Prominent search + add row */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Search or add items
          </h2>
          <p className="text-sm text-muted-foreground">
            Type a name, then tap <span className="font-medium text-emerald-700">Add item</span> to choose how much to buy.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="e.g. greek yoghurt, chicken breast…"
              label="Search list"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setQuickAddOpen(true);
                }
              }}
            />
          </div>
          <div className="w-full sm:w-auto sm:pb-0">
            <span className="mb-1.5 block text-sm font-medium text-muted-foreground sm:invisible">
              Add
            </span>
            <Button
              type="button"
              size="lg"
              className="h-[50px] w-full rounded-xl sm:w-auto sm:min-w-[10rem]"
              onClick={() => setQuickAddOpen(true)}
            >
              <Plus className="h-5 w-5" />
              {search.trim()
                ? `Add “${search.trim().slice(0, 18)}${search.trim().length > 18 ? "…" : ""}”`
                : "Add item"}
            </Button>
          </div>
          <div className="w-full sm:w-44">
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
          </div>
        </div>

        {quickAddOpen ? (
          <div className="mt-4">
            <ShoppingQuickAdd
              suggestedName={search}
              open={quickAddOpen}
              onOpenChange={setQuickAddOpen}
              onAdd={handleQuickAdd}
            />
          </div>
        ) : null}
      </section>

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
          icon={<ShoppingCart className="h-6 w-6" aria-hidden />}
          title={
            items.length === 0 ? "No shopping items yet" : "No matching items"
          }
          description={
            items.length === 0
              ? "Type an item in search and tap Add item to set the quantity."
              : search.trim()
                ? `Nothing matches “${search.trim()}”. Use Add item beside search to add it with a quantity.`
                : "Try adjusting your search or filter."
          }
          actionLabel={search.trim() ? `Add “${search.trim()}”` : "Add item"}
          onAction={() => setQuickAddOpen(true)}
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
