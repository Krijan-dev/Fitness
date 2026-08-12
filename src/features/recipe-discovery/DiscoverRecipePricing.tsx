"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Store } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { RecipePricingResultView } from "@/features/recipe-pricing/RecipePricingResultView";
import { useSettingsStore } from "@/stores/settings.store";
import type { RecipePricingResult } from "@/services/prices/recipe-pricing.service";

interface DiscoverRecipePricingProps {
  /** Discover recipe id, e.g. themealdb-52772 */
  recipeId: string;
  recipeSource?: string;
}

function extractMealId(recipeId: string): string | null {
  if (recipeId.startsWith("themealdb-")) {
    return recipeId.replace(/^themealdb-/, "");
  }
  if (/^\d+$/.test(recipeId)) return recipeId;
  return null;
}

/**
 * Inline Coles / Woolworths / ALDI pricing on Discover recipe detail.
 * Only runs for TheMealDB recipes (free public meal ids).
 */
export function DiscoverRecipePricing({
  recipeId,
  recipeSource,
}: DiscoverRecipePricingProps) {
  const location = useSettingsStore((s) => s.settings.location.city);
  const mealId = extractMealId(recipeId);
  const isThemealdb =
    Boolean(mealId) &&
    (recipeId.startsWith("themealdb-") ||
      Boolean(recipeSource?.toLowerCase().includes("themealdb")));

  const [pricing, setPricing] = useState<RecipePricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPricing = useCallback(async () => {
    if (!mealId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ mealId, location });
      const res = await fetch(`/api/recipe-pricing?${params}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Pricing failed");
      setPricing(body.data as RecipePricingResult);
    } catch (err) {
      setPricing(null);
      setError(err instanceof Error ? err.message : "Pricing failed");
    } finally {
      setLoading(false);
    }
  }, [mealId, location]);

  useEffect(() => {
    if (!isThemealdb || !mealId) return;
    void loadPricing();
  }, [isThemealdb, mealId, loadPricing]);

  if (!isThemealdb || !mealId) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-4 w-4 text-emerald-600" />
          Store pricing
        </CardTitle>
      </CardHeader>
      <p className="mb-4 text-sm text-muted-foreground">
        Compare Coles, Woolworths, and ALDI ingredient costs for this recipe
        (near {location}).
      </p>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          Pricing ingredients across Coles, Woolworths, and ALDI…
        </div>
      ) : null}

      {error ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void loadPricing()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {!loading && !error && !pricing ? (
        <p className="text-sm text-muted-foreground">No pricing data returned.</p>
      ) : null}

      {pricing && !loading ? (
        <RecipePricingResultView result={pricing} compact />
      ) : null}
    </Card>
  );
}
