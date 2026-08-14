"use client";

import { useState } from "react";
import Image from "next/image";
import { ChefHat, Loader2, Search, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { useSettingsStore } from "@/stores/settings.store";
import type { ThemealdbMeal } from "@/services/recipes/themealdb.client";
import type { RecipePricingResult } from "@/services/prices/recipe-pricing.service";
import { RecipePricingResultView } from "@/features/recipe-pricing/RecipePricingResultView";

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
