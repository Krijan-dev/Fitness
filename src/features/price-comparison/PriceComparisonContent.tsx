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
import { BarcodeLookup } from "@/components/grocery/BarcodeLookup";
import { NearbyStoresPanel } from "@/components/grocery/NearbyStoresPanel";
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
  const [manualQuery, setManualQuery] = useState("");
  const [manualResults, setManualResults] = useState<StoreProductPrice[]>([]);
  const [manualLoading, setManualLoading] = useState(false);

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

  const searchManual = async () => {
    const q = manualQuery.trim();
    if (!q) return;
    setManualLoading(true);
    try {
      const params = new URLSearchParams({ query: q, location });
      const response = await fetch(`/api/prices?${params}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Search failed");
      setManualResults(body.data as StoreProductPrice[]);
    } catch {
      setManualResults([]);
    } finally {
      setManualLoading(false);
    }
  };

  const anyLoading =
    isRefreshing ||
    Object.values(fetchStates).some((s) => s.loading);

  return (
    <>
      <PageHeader
        title="Price Comparison"
        description="Compare Coles, Woolworths, and ALDI prices, highlight specials, and find the cheapest basket."
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
            Find cheapest basket
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
          Live RapidAPI / Apify providers are used when API keys are set;
          otherwise mock AU prices are shown.
        </p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <BarcodeLookup
          location={location}
          onMatchedPrices={(prices) => setManualResults(prices)}
        />
        <NearbyStoresPanel location={location} />
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Search products across stores</h3>
        <div className="flex flex-wrap gap-2">
          <input
            value={manualQuery}
            onChange={(e) => setManualQuery(e.target.value)}
            placeholder="e.g. greek yoghurt"
            className="flex-1 min-w-[180px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") void searchManual();
            }}
          />
          <Button onClick={() => void searchManual()} disabled={manualLoading}>
            {manualLoading ? "Searching…" : "Search"}
          </Button>
        </div>
        {manualResults.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {manualResults
              .slice()
              .sort((a, b) => a.currentPrice - b.currentPrice)
              .slice(0, 12)
              .map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <span>
                    <span className="font-medium">{p.store}</span> · {p.productName}
                    {p.isOnSpecial ? (
                      <span className="ml-2 text-xs text-success">Special</span>
                    ) : null}
                    {p.unitPrice != null ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ${p.unitPrice.toFixed(2)} {p.unitLabel}
                      </span>
                    ) : null}
                    {p.catalogueExpiresAt ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        until{" "}
                        {new Date(p.catalogueExpiresAt).toLocaleDateString(
                          "en-AU"
                        )}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-semibold">
                    ${p.currentPrice.toFixed(2)}
                  </span>
                </li>
              ))}
          </ul>
        ) : null}
      </div>

      {unpurchasedItems.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-6 w-6" aria-hidden />}
          title="No shopping-list items to compare"
          description="Add unpurchased items to your shopping list, or use product search / barcode above."
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
            <h2 className="text-lg font-semibold">Shopping list matches</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select the correct product match for each item. Defaults to the
              cheapest option. Specials and unit prices are highlighted when available.
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
