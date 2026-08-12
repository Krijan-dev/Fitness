"use client";

import { useState } from "react";
import Image from "next/image";
import { ChefHat, Loader2, Search, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/ui/Badge";
import { StoreBadge } from "@/components/grocery/StoreBadge";
import { ProductThumbnail } from "@/components/grocery/ProductThumbnail";
import { useSettingsStore } from "@/stores/settings.store";
import { formatCurrency } from "@/utils/currency";
import type { ThemealdbMeal } from "@/services/recipes/themealdb.client";
import type { RecipePricingResult } from "@/services/prices/recipe-pricing.service";
import type { StoreName } from "@/types/common";

export function RecipePricingContent() {
  const location = useSettingsStore((s) => s.settings.location.city);
  const [query, setQuery] = useState("chicken");
  const [meals, setMeals] = useState<ThemealdbMeal[]>([]);
  const [searching, setSearching] = useState(false);
  const [pricing, setPricing] = useState<RecipePricingResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMeals = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError(null);
    setPricing(null);
    try {
      const res = await fetch(
        `/api/recipe-pricing?q=${encodeURIComponent(q)}`
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Search failed");
      setMeals(body.data as ThemealdbMeal[]);
    } catch (err) {
      setMeals([]);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const priceMeal = async (mealId: string) => {
    setPricingLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        mealId,
        location,
      });
      const res = await fetch(`/api/recipe-pricing?${params}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Pricing failed");
      setPricing(body.data as RecipePricingResult);
    } catch (err) {
      setPricing(null);
      setError(err instanceof Error ? err.message : "Pricing failed");
    } finally {
      setPricingLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Recipe Pricing"
        description="Free recipe costs via TheMealDB — compare Coles, Woolworths, and ALDI totals with no paid API keys."
      />

      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <Sparkles className="h-3.5 w-3.5" />
        100% free · TheMealDB public API · no credit card
      </div>

      <section className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
        <h2 className="text-base font-semibold text-foreground">
          Search free recipes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Uses{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            themealdb.com/api/json/v1/1/search.php
          </code>
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. chicken, pasta, beef…"
              className="w-full rounded-xl border border-border bg-muted/80 py-3 pl-10 pr-4 text-sm transition-all focus:border-emerald-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") void searchMeals();
              }}
            />
          </div>
          <Button
            className="rounded-xl px-6"
            onClick={() => void searchMeals()}
            disabled={searching || !query.trim()}
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search recipes
              </>
            )}
          </Button>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        ) : null}
      </section>

      {meals.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Recipes ({meals.length})
          </h2>
          <ul className="product-grid">
            {meals.map((meal) => (
              <li
                key={meal.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {meal.thumbnail ? (
                    <Image
                      src={meal.thumbnail}
                      alt={meal.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ChefHat className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-semibold text-foreground">{meal.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[meal.area, meal.category].filter(Boolean).join(" · ")}
                    {meal.ingredients.length
                      ? ` · ${meal.ingredients.length} ingredients`
                      : ""}
                  </p>
                  <Button
                    className="mt-auto w-full rounded-xl"
                    size="sm"
                    onClick={() => void priceMeal(meal.id)}
                    disabled={pricingLoading}
                  >
                    {pricingLoading ? "Pricing…" : "Compare store costs"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pricingLoading ? (
        <div className="mb-8 flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          Pricing ingredients across Coles, Woolworths, and ALDI…
        </div>
      ) : null}

      {pricing ? <RecipePricingResultView result={pricing} /> : null}
    </>
  );
}

function RecipePricingResultView({ result }: { result: RecipePricingResult }) {
  const { meal, storeTotals, ingredients, sourceNote } = result;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        {meal.thumbnail ? (
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
            <Image
              src={meal.thumbnail}
              alt={meal.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : null}
        <div>
          <h2 className="text-xl font-semibold text-foreground">{meal.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {ingredients.length} ingredients · priced for {result.location}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{sourceNote}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {storeTotals.map((store) => (
          <div
            key={store.store}
            className={`rounded-2xl border bg-card p-4 transition-all duration-200 ${
              store.isCheapest
                ? "border-2 border-emerald-500 shadow-emerald-ring"
                : "border-border"
            }`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StoreBadge store={store.store as StoreName} />
              {store.isCheapest ? (
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Best Price
                </span>
              ) : null}
              {store.missingCount > 0 ? (
                <Badge tone="warning">
                  Missing Ingredients ({store.missingCount})
                </Badge>
              ) : (
                <Badge tone="success">All matched</Badge>
              )}
            </div>
            <p
              className={`text-2xl font-bold tabular-nums ${
                store.isCheapest ? "text-emerald-600" : "text-foreground"
              }`}
            >
              {formatCurrency(store.total)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {store.matchedCount} priced
              {store.missingCount
                ? ` · ${store.missingCount} missing`
                : ""}
            </p>
            {store.missingIngredients.length > 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                Missing: {store.missingIngredients.slice(0, 4).join(", ")}
                {store.missingIngredients.length > 4
                  ? ` +${store.missingIngredients.length - 4} more`
                  : ""}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">
            Ingredient cost breakdown
          </h3>
        </div>
        <ul className="divide-y divide-border">
          {ingredients.map((line) => (
            <li key={`${line.cleanedName}-${line.measure ?? ""}`} className="p-4">
              <div className="mb-2 flex flex-wrap items-baseline gap-2">
                <p className="font-medium text-foreground">{line.cleanedName}</p>
                {line.measure ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                    {line.measure}
                  </span>
                ) : null}
                {line.rawName.toLowerCase() !==
                line.cleanedName.toLowerCase() ? (
                  <span className="text-xs text-muted-foreground">
                    from “{line.rawName}”
                  </span>
                ) : null}
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {line.matches.map((match) => (
                  <div
                    key={match.store}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-sm ${
                      match.missing
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-border"
                    }`}
                  >
                    {match.product ? (
                      <ProductThumbnail
                        src={match.product.imageUrl}
                        alt={match.product.productName}
                        size={40}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
                        —
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <StoreBadge store={match.store} />
                      {match.missing ? (
                        <p className="mt-1 text-xs font-medium text-amber-700">
                          Missing Ingredients
                        </p>
                      ) : (
                        <>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {match.product?.productName}
                          </p>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(match.product!.currentPrice)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
