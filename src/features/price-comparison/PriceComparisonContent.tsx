"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, ShoppingCart, Tags } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { BasketSummaryCard } from "@/components/prices/BasketSummaryCard";
import { ShoppingItemPriceCard } from "@/components/prices/ShoppingItemPriceCard";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { useSettingsStore } from "@/stores/settings.store";
import { usePriceComparisonStore } from "@/stores/price-comparison.store";
import { LOCATION_OPTIONS } from "@/features/price-comparison/constants";
import {
  buildItemMatches,
  calculateBasketSummary,
} from "@/features/price-comparison/basket-calculator";
import type { StoreProductPrice } from "@/types/price";

interface FetchState {
  loading: boolean;
  error: string | null;
}

export function PriceComparisonContent() {
  const shoppingItems = useShoppingListStore((s) => s.items);
  const settings = useSettingsStore((s) => s.settings);
  const updateLocation = useSettingsStore((s) => s.updateLocation);
  const selections = usePriceComparisonStore((s) => s.selections);
  const setSelection = usePriceComparisonStore((s) => s.setSelection);
  const clearSelections = usePriceComparisonStore((s) => s.clearSelections);

  const unpurchasedItems = useMemo(
    () => shoppingItems.filter((i) => !i.purchased),
    [shoppingItems]
  );

  const location = settings.location.city;

  const [priceMap, setPriceMap] = useState<Record<string, StoreProductPrice[]>>(
    {}
  );
  const [fetchStates, setFetchStates] = useState<Record<string, FetchState>>(
    {}
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPricesForItem = useCallback(
    async (itemId: string, query: string) => {
      setFetchStates((prev) => ({
        ...prev,
        [itemId]: { loading: true, error: null },
      }));

      try {
        const params = new URLSearchParams({
          query,
          location,
        });
        const response = await fetch(`/api/prices?${params.toString()}`);
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.error ?? "Failed to fetch prices.");
        }

        setPriceMap((prev) => ({
          ...prev,
          [itemId]: body.data as StoreProductPrice[],
        }));
        setFetchStates((prev) => ({
          ...prev,
          [itemId]: { loading: false, error: null },
        }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch prices.";
        setFetchStates((prev) => ({
          ...prev,
          [itemId]: { loading: false, error: message },
        }));
      }
    },
    [location]
  );

  const fetchAllPrices = useCallback(async () => {
    if (unpurchasedItems.length === 0) return;
    setIsRefreshing(true);
    await Promise.all(
      unpurchasedItems.map((item) => fetchPricesForItem(item.id, item.name))
    );
    setIsRefreshing(false);
  }, [unpurchasedItems, fetchPricesForItem]);

  useEffect(() => {
    fetchAllPrices();
  }, [fetchAllPrices]);

  const itemMatches = useMemo(
    () => buildItemMatches(unpurchasedItems, priceMap, selections),
    [unpurchasedItems, priceMap, selections]
  );

  const basketSummary = useMemo(
    () => calculateBasketSummary(itemMatches),
    [itemMatches]
  );

  const handleLocationChange = (city: string) => {
    updateLocation({ city });
    clearSelections();
    setPriceMap({});
  };

  const anyLoading =
    isRefreshing ||
    Object.values(fetchStates).some((s) => s.loading);

  return (
    <>
      <PageHeader
        title="Price Comparison"
        description="Compare supermarket prices for your shopping list and find the cheapest basket."
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/shopping-list">
            <Button variant="secondary">
              <ShoppingCart className="h-4 w-4" />
              Shopping list
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => fetchAllPrices()}
            disabled={anyLoading || unpurchasedItems.length === 0}
          >
            <RefreshCw
              className={`h-4 w-4 ${anyLoading ? "animate-spin" : ""}`}
            />
            Refresh prices
          </Button>
        </div>
      </PageHeader>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        <Select
          label="Location"
          value={location}
          options={LOCATION_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onChange={(e) => handleLocationChange(e.target.value)}
        />
        <p className="text-sm text-muted-foreground lg:max-w-xs lg:self-end">
          Location is saved in your settings. Prices shown are mock data until
          live providers are configured.
        </p>
      </div>

      {unpurchasedItems.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No items to compare"
          description="Add unpurchased items to your shopping list to compare prices across supermarkets."
          actionLabel="Go to shopping list"
          onAction={() => window.location.assign("/shopping-list")}
        />
      ) : (
        <>
          {itemMatches.some((m) => m.prices.length > 0) ? (
            <div className="mb-8">
              <BasketSummaryCard summary={basketSummary} />
            </div>
          ) : null}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product matches</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select the correct product match for each item. Defaults to the
              cheapest option.
            </p>
            {itemMatches.map((match) => (
              <ShoppingItemPriceCard
                key={match.shoppingItem.id}
                match={match}
                isLoading={fetchStates[match.shoppingItem.id]?.loading ?? true}
                error={fetchStates[match.shoppingItem.id]?.error ?? null}
                selectedPriceId={selections[match.shoppingItem.id]}
                onSelectPrice={(priceId) =>
                  setSelection(match.shoppingItem.id, priceId)
                }
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
