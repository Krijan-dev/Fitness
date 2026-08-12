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

      {estimatedSavings > 0 ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
          You Save {formatCurrency(estimatedSavings)} vs highest basket
        </div>
      ) : null}

      <Card className="rounded-2xl border-slate-100">
        <CardHeader>
          <CardTitle>Per-store totals</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Estimated cost if you bought all items at each store (cheapest match
            per store).
          </p>
        </CardHeader>
        <div className="space-y-2">
          {sortedStores.map((store, index) => (
            <div
              key={store.store}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 ${
                index === 0
                  ? "border-2 border-emerald-500 bg-emerald-50/50 shadow-emerald-ring"
                  : "border-slate-100 hover:shadow-lg"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{store.label}</span>
                {index === 0 ? (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                    Best Price
                  </span>
                ) : null}
                {store.missingCount > 0 ? (
                  <span className="text-xs text-slate-500">
                    {store.missingCount} item
                    {store.missingCount !== 1 ? "s" : ""} unavailable
                  </span>
                ) : null}
              </div>
              <span
                className={`font-bold tabular-nums ${
                  index === 0 ? "text-emerald-600" : "text-slate-900"
                }`}
              >
                {formatCurrency(store.total)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
