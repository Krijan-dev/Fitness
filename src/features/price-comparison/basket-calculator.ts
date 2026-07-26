import type { StoreProductPrice } from "@/types/price";
import type { ShoppingItem } from "@/types/shopping";
import type { StoreName } from "@/types/common";
import { ALL_STORES, STORE_LABELS } from "./constants";

export interface ItemPriceMatch {
  shoppingItem: ShoppingItem;
  prices: StoreProductPrice[];
  selectedPrice: StoreProductPrice | null;
  cheapestPrice: StoreProductPrice | null;
  highestPrice: StoreProductPrice | null;
}

export interface StoreBasketTotal {
  store: StoreName;
  label: string;
  total: number;
  itemCount: number;
  missingCount: number;
}

export interface BasketSummary {
  mixedBasketTotal: number;
  highestBasketTotal: number;
  bestSingleStore: StoreBasketTotal | null;
  storeTotals: StoreBasketTotal[];
  estimatedSavings: number;
  itemMatches: ItemPriceMatch[];
}

function cheapestAtStore(
  prices: StoreProductPrice[],
  store: StoreName
): StoreProductPrice | null {
  const storePrices = prices.filter((p) => p.store === store);
  if (storePrices.length === 0) return null;
  return storePrices.reduce((min, p) =>
    p.currentPrice < min.currentPrice ? p : min
  );
}

export function resolveSelectedPrice(
  prices: StoreProductPrice[],
  selectedPriceId: string | undefined
): StoreProductPrice | null {
  if (selectedPriceId) {
    const selected = prices.find((p) => p.id === selectedPriceId);
    if (selected) return selected;
  }
  if (prices.length === 0) return null;
  return prices.reduce((min, p) =>
    p.currentPrice < min.currentPrice ? p : min
  );
}

export function buildItemMatches(
  shoppingItems: ShoppingItem[],
  priceMap: Record<string, StoreProductPrice[]>,
  selections: Record<string, string>
): ItemPriceMatch[] {
  return shoppingItems.map((item) => {
    const prices = priceMap[item.id] ?? [];
    const cheapest =
      prices.length > 0
        ? prices.reduce((min, p) =>
            p.currentPrice < min.currentPrice ? p : min
          )
        : null;
    const highest =
      prices.length > 0
        ? prices.reduce((max, p) =>
            p.currentPrice > max.currentPrice ? p : max
          )
        : null;
    const selectedPrice = resolveSelectedPrice(prices, selections[item.id]);

    return {
      shoppingItem: item,
      prices,
      selectedPrice,
      cheapestPrice: cheapest,
      highestPrice: highest,
    };
  });
}

export function calculateBasketSummary(
  itemMatches: ItemPriceMatch[]
): BasketSummary {
  const storeTotals: StoreBasketTotal[] = ALL_STORES.map((store) => {
    let total = 0;
    let itemCount = 0;
    let missingCount = 0;

    for (const match of itemMatches) {
      const priceAtStore = cheapestAtStore(match.prices, store);
      if (priceAtStore) {
        total += priceAtStore.currentPrice;
        itemCount += 1;
      } else {
        missingCount += 1;
      }
    }

    return {
      store,
      label: STORE_LABELS[store],
      total,
      itemCount,
      missingCount,
    };
  });

  const completeStores = storeTotals.filter(
    (s) => s.missingCount === 0 && s.itemCount > 0
  );
  const bestSingleStore =
    completeStores.length > 0
      ? completeStores.reduce((best, s) =>
          s.total < best.total ? s : best
        )
      : storeTotals
          .filter((s) => s.itemCount > 0)
          .reduce<StoreBasketTotal | null>((best, s) => {
            if (!best) return s;
            return s.total < best.total ? s : best;
          }, null);

  const mixedBasketTotal = itemMatches.reduce((sum, match) => {
    const price = match.cheapestPrice;
    return price ? sum + price.currentPrice : sum;
  }, 0);

  const highestBasketTotal = itemMatches.reduce((sum, match) => {
    const price = match.highestPrice;
    return price ? sum + price.currentPrice : sum;
  }, 0);

  const estimatedSavings =
    bestSingleStore && mixedBasketTotal < bestSingleStore.total
      ? bestSingleStore.total - mixedBasketTotal
      : 0;

  return {
    mixedBasketTotal,
    highestBasketTotal,
    bestSingleStore,
    storeTotals,
    estimatedSavings,
    itemMatches,
  };
}
