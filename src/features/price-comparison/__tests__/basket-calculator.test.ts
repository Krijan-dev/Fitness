import type { ShoppingItem } from "@/types/shopping";
import type { StoreProductPrice } from "@/types/price";
import {
  buildItemMatches,
  calculateBasketSummary,
} from "../basket-calculator";

const shoppingItems: ShoppingItem[] = [
  {
    id: "s1",
    name: "Chicken",
    quantity: 1,
    unit: "kg",
    category: "meat",
    purchased: false,
  },
  {
    id: "s2",
    name: "Oats",
    quantity: 1,
    unit: "kg",
    category: "pantry",
    purchased: false,
  },
];

const priceMap: Record<string, StoreProductPrice[]> = {
  s1: [
    {
      id: "p1",
      query: "chicken",
      productName: "Chicken Coles",
      store: "coles",
      currentPrice: 9,
      isOnSpecial: false,
      dataSource: "mock",
      lastUpdated: "2026-01-01",
    },
    {
      id: "p2",
      query: "chicken",
      productName: "Chicken Aldi",
      store: "aldi",
      currentPrice: 10,
      isOnSpecial: false,
      dataSource: "mock",
      lastUpdated: "2026-01-01",
    },
  ],
  s2: [
    {
      id: "p3",
      query: "oats",
      productName: "Oats Woolworths",
      store: "woolworths",
      currentPrice: 4,
      isOnSpecial: false,
      dataSource: "mock",
      lastUpdated: "2026-01-01",
    },
    {
      id: "p4",
      query: "oats",
      productName: "Oats Aldi",
      store: "aldi",
      currentPrice: 3.5,
      isOnSpecial: false,
      dataSource: "mock",
      lastUpdated: "2026-01-01",
    },
  ],
};

describe("basket-calculator", () => {
  it("finds cheapest mixed basket total", () => {
    const matches = buildItemMatches(shoppingItems, priceMap, {});
    const summary = calculateBasketSummary(matches);

    expect(summary.mixedBasketTotal).toBe(12.5);
    expect(summary.bestSingleStore?.store).toBe("aldi");
    expect(summary.estimatedSavings).toBe(1);
  });
});
