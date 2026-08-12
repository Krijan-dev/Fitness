"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, RefreshCw, Search, ShoppingCart, Tags } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { BasketSummaryCard } from "@/components/prices/BasketSummaryCard";
import { ShoppingItemPriceCard } from "@/components/prices/ShoppingItemPriceCard";
import { BarcodeLookup } from "@/components/grocery/BarcodeLookup";
import { NearbyStoresPanel } from "@/components/grocery/NearbyStoresPanel";
import { GroceryDataSourceBanner } from "@/components/grocery/GroceryDataSourceBanner";
import { useShoppingListStore } from "@/stores/shopping-list.store";
import { useSettingsStore } from "@/stores/settings.store";
import { usePriceComparisonStore } from "@/stores/price-comparison.store";
import { LOCATION_OPTIONS } from "@/features/price-comparison/constants";
import {
  buildItemMatches,
  calculateBasketSummary,
} from "@/features/price-comparison/basket-calculator";
import { ProductThumbnail } from "@/components/grocery/ProductThumbnail";
import { StoreBadge } from "@/components/grocery/StoreBadge";
import { ProductSearchSkeleton } from "@/components/ui/Skeleton";
import { compareByUnitThenShelfPrice } from "@/features/price-comparison/sort-prices";
import { formatCurrency } from "@/utils/currency";
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
  const [dataNotice, setDataNotice] = useState<string | null>(null);

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
        if (typeof body.notice === "string") {
          setDataNotice(body.notice);
        }
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
    isRefreshing || Object.values(fetchStates).some((s) => s.loading);

  const cheapestManualId =
    manualResults.length > 0
      ? [...manualResults].sort(compareByUnitThenShelfPrice)[0]?.id
      : null;

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

      <GroceryDataSourceBanner />

      {/* Hero search + location */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Search products across stores
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dataNotice ??
                "Find matching products with thumbnails, unit rates, and best-price highlights."}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-foreground">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
            <label htmlFor="price-location" className="sr-only">
              Location
            </label>
            <select
              id="price-location"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="max-w-[11rem] cursor-pointer border-0 bg-transparent text-sm font-medium text-foreground focus:outline-none focus:ring-0"
            >
              {LOCATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Search e.g. greek yoghurt, chicken breast…"
              className="w-full rounded-xl border border-border bg-muted/80 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-text-muted transition-all focus:border-emerald-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") void searchManual();
              }}
            />
          </div>
          <Button
            className="rounded-xl px-6"
            onClick={() => void searchManual()}
            disabled={manualLoading}
          >
            {manualLoading ? "Searching…" : "Search"}
          </Button>
        </div>

        <div className="mt-4 sm:hidden">
          <Select
            label="Location"
            value={location}
            options={LOCATION_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
        </div>

        {manualLoading ? (
          <div className="mt-6">
            <ProductSearchSkeleton count={4} />
          </div>
        ) : manualResults.length > 0 ? (
          <ul className="product-grid mt-6">
            {manualResults
              .slice()
              .sort(compareByUnitThenShelfPrice)
              .slice(0, 12)
              .map((p) => {
                const isBest = p.id === cheapestManualId;
                const savings =
                  p.regularPrice != null && p.regularPrice > p.currentPrice
                    ? p.regularPrice - p.currentPrice
                    : null;
                return (
                  <li
                    key={p.id}
                    className={`flex flex-col rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-lg ${
                      isBest
                        ? "border-2 border-emerald-500 shadow-emerald-ring"
                        : "border-border"
                    }`}
                  >
                    <div className="relative mb-3 flex justify-center rounded-xl border border-border bg-muted/50 p-3">
                      <ProductThumbnail
                        src={p.imageUrl}
                        alt={p.productName}
                        size={88}
                      />
                      {isBest ? (
                        <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Best Price
                        </span>
                      ) : null}
                    </div>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      <StoreBadge store={p.store} />
                      {p.isOnSpecial ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          Special
                        </span>
                      ) : null}
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold text-foreground">
                      {p.productName}
                    </p>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                      <div>
                        <p
                          className={`text-lg font-bold tabular-nums ${
                            isBest ? "text-emerald-600" : "text-foreground"
                          }`}
                        >
                          {formatCurrency(p.currentPrice)}
                        </p>
                        {p.unitPrice != null ? (
                          <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {formatCurrency(p.unitPrice)} {p.unitLabel ?? ""}
                          </span>
                        ) : null}
                      </div>
                      {savings != null && savings > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          You Save {formatCurrency(savings)}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
          </ul>
        ) : null}
      </section>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <BarcodeLookup
          location={location}
          onMatchedPrices={(prices) => setManualResults(prices)}
        />
        <NearbyStoresPanel location={location} />
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
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Shopping list matches
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Select the correct product match for each item. Defaults to the
              cheapest option. Specials and unit prices are highlighted when
              available.
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
