"use client";

import type { BasketSummary } from "@/features/price-comparison/basket-calculator";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { StatCard } from "@/components/common/StatCard";
import { formatCurrency } from "@/utils/currency";
import { Tags, TrendingDown, Store } from "lucide-react";

interface BasketSummaryCardProps {
  summary: BasketSummary;
}

export function BasketSummaryCard({ summary }: BasketSummaryCardProps) {
  const {
    mixedBasketTotal,
    highestBasketTotal,
    bestSingleStore,
    storeTotals,
    estimatedSavings,
  } = summary;

  const sortedStores = [...storeTotals]
    .filter((s) => s.itemCount > 0)
    .sort((a, b) => a.total - b.total);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Cheapest mixed basket"
          value={formatCurrency(mixedBasketTotal)}
          icon={Tags}
        />
        <StatCard
          label="Best single store"
          value={
            bestSingleStore
              ? `${bestSingleStore.label} · ${formatCurrency(bestSingleStore.total)}`
              : "—"
          }
          icon={Store}
        />
        <StatCard
          label="Estimated savings"
          value={formatCurrency(estimatedSavings)}
          icon={TrendingDown}
        />
        <StatCard
          label="Highest basket"
          value={formatCurrency(highestBasketTotal)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Per-store totals</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Estimated cost if you bought all items at each store (cheapest match per store).
          </p>
        </CardHeader>
        <div className="space-y-2">
          {sortedStores.map((store) => (
            <div
              key={store.store}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm"
            >
              <div>
                <span className="font-medium">{store.label}</span>
                {store.missingCount > 0 ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {store.missingCount} item{store.missingCount !== 1 ? "s" : ""} unavailable
                  </span>
                ) : null}
              </div>
              <span className="font-medium">{formatCurrency(store.total)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
