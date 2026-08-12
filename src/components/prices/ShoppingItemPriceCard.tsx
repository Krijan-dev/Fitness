"use client";

import type { ItemPriceMatch } from "@/features/price-comparison/basket-calculator";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { PriceRowSkeleton } from "@/components/ui/Skeleton";
import { PriceOptionRow } from "./PriceOptionRow";
import { formatCurrency } from "@/utils/currency";

interface ShoppingItemPriceCardProps {
  match: ItemPriceMatch;
  isLoading: boolean;
  error: string | null;
  selectedPriceId: string | undefined;
  onSelectPrice: (priceId: string) => void;
}

export function ShoppingItemPriceCard({
  match,
  isLoading,
  error,
  selectedPriceId,
  onSelectPrice,
}: ShoppingItemPriceCardProps) {
  const { shoppingItem, prices, cheapestPrice } = match;

  const sorted = prices.slice().sort((a, b) => {
    const au = a.unitPrice;
    const bu = b.unitPrice;
    if (
      au != null &&
      bu != null &&
      Number.isFinite(au) &&
      Number.isFinite(bu)
    ) {
      return au - bu;
    }
    return a.currentPrice - b.currentPrice;
  });

  return (
    <Card hover>
      <CardHeader>
        <CardTitle className="text-base">
          {shoppingItem.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {shoppingItem.quantity} {shoppingItem.unit}
          {cheapestPrice ? (
            <>
              {" · "}
              <span className="font-semibold text-emerald-600">
                Cheapest {formatCurrency(cheapestPrice.currentPrice)}
              </span>
            </>
          ) : null}
        </p>
      </CardHeader>

      {isLoading ? (
        <PriceRowSkeleton count={3} />
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : prices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No matching products found. Try a different location or add manual
          prices in a future update.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((price) => (
            <PriceOptionRow
              key={price.id}
              price={price}
              isBestPrice={cheapestPrice?.id === price.id}
              isSelected={selectedPriceId === price.id}
              onSelect={() => onSelectPrice(price.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
