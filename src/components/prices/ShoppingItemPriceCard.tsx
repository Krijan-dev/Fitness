"use client";

import type { ItemPriceMatch } from "@/features/price-comparison/basket-calculator";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { LoadingState } from "@/components/common/LoadingState";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{shoppingItem.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {shoppingItem.quantity} {shoppingItem.unit}
          {cheapestPrice
            ? ` · Cheapest ${formatCurrency(cheapestPrice.currentPrice)}`
            : ""}
        </p>
      </CardHeader>

      {isLoading ? (
        <LoadingState message="Searching stores..." />
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : prices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No matching products found. Try a different location or add manual
          prices in a future update.
        </p>
      ) : (
        <div className="space-y-2">
          {prices
            .sort((a, b) => a.currentPrice - b.currentPrice)
            .map((price) => (
              <PriceOptionRow
                key={price.id}
                price={price}
                isSelected={selectedPriceId === price.id}
                onSelect={() => onSelectPrice(price.id)}
              />
            ))}
        </div>
      )}
    </Card>
  );
}
