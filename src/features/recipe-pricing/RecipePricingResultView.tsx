"use client";

import { Badge } from "@/components/ui/Badge";
import { StoreBadge } from "@/components/grocery/StoreBadge";
import { ProductThumbnail } from "@/components/grocery/ProductThumbnail";
import { SafeRemoteImage } from "@/components/common/SafeRemoteImage";
import { formatCurrency } from "@/utils/currency";
import type { RecipePricingResult } from "@/services/prices/recipe-pricing.service";
import type { StoreName } from "@/types/common";

interface RecipePricingResultViewProps {
  result: RecipePricingResult;
  /** Hide meal header when already shown on the parent recipe page */
  compact?: boolean;
}

export function RecipePricingResultView({
  result,
  compact = false,
}: RecipePricingResultViewProps) {
  const { meal, storeTotals, ingredients, sourceNote } = result;

  return (
    <section className="space-y-6">
      {!compact ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
          {meal.thumbnail ? (
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
              <SafeRemoteImage
                src={meal.thumbnail}
                alt={meal.name}
                fill
                className="object-cover"
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
      ) : (
        <p className="text-xs text-muted-foreground">
          {ingredients.length} ingredients · priced for {result.location}
        </p>
      )}

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
              {store.missingCount ? ` · ${store.missingCount} missing` : ""}
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
            <li
              key={`${line.cleanedName}-${line.measure ?? ""}`}
              className="p-4"
            >
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
