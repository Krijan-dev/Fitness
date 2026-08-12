import type { StoreName } from "@/types/common";
import type { StoreProductPrice } from "@/types/price";
import type {
  ThemealdbIngredient,
  ThemealdbMeal,
} from "@/services/recipes/themealdb.client";
import { searchStorePrices } from "@/services/grocery/grocery-search.service";
import { compareByUnitThenShelfPrice } from "@/features/price-comparison/sort-prices";
import {
  buildIngredientSearchQueries,
  findStaplePrice,
} from "@/services/prices/recipe-staples";

/** Free recipe pricing only uses these three AU supermarket datasets. */
export const RECIPE_PRICING_STORES: StoreName[] = [
  "coles",
  "woolworths",
  "aldi",
];

export interface IngredientStoreMatch {
  store: StoreName;
  product: StoreProductPrice | null;
  missing: boolean;
}

export interface PricedIngredientLine {
  rawName: string;
  cleanedName: string;
  measure?: string;
  matches: IngredientStoreMatch[];
}

export interface RecipeStoreTotal {
  store: StoreName;
  label: string;
  total: number;
  matchedCount: number;
  missingCount: number;
  missingIngredients: string[];
  isCheapest: boolean;
}

export interface RecipePricingResult {
  meal: ThemealdbMeal;
  location: string;
  ingredients: PricedIngredientLine[];
  storeTotals: RecipeStoreTotal[];
  cheapestStore: StoreName | null;
  sourceNote: string;
}

const STORE_LABELS: Record<StoreName, string> = {
  coles: "Coles",
  woolworths: "Woolworths",
  aldi: "ALDI",
  iga: "IGA",
  costco: "Costco",
  "harris-farm": "Harris Farm",
};

/**
 * Price a TheMealDB meal across Coles, Woolworths, and ALDI.
 * Uses grocery search first, then staple fallbacks so everyday items
 * are not falsely marked missing when live APIs/catalogues miss them.
 */
export async function priceThemealdbMeal(
  meal: ThemealdbMeal,
  location = "Canberra"
): Promise<RecipePricingResult> {
  const ingredients = meal.ingredients.filter((i) => i.cleanedName.trim());

  const lines = await Promise.all(
    ingredients.map((ing) => priceOneIngredient(ing, location))
  );

  const storeTotals = buildStoreTotals(lines);
  const cheapest = storeTotals.find((s) => s.isCheapest)?.store ?? null;

  return {
    meal,
    location,
    ingredients: lines,
    storeTotals,
    cheapestStore: cheapest,
    sourceNote:
      "Recipe data from free TheMealDB. Ingredient prices from Coles, Woolworths, and ALDI search, with staple fallbacks when a live match is unavailable.",
  };
}

async function priceOneIngredient(
  ingredient: ThemealdbIngredient,
  location: string
): Promise<PricedIngredientLine> {
  const queries = buildIngredientSearchQueries(ingredient.cleanedName);
  const pricesByStore = new Map<StoreName, StoreProductPrice[]>();

  for (const store of RECIPE_PRICING_STORES) {
    pricesByStore.set(store, []);
  }

  for (const query of queries) {
    if (RECIPE_PRICING_STORES.every((s) => (pricesByStore.get(s)?.length ?? 0) > 0)) {
      break;
    }
    try {
      const { data } = await searchStorePrices(query, location);
      for (const price of data) {
        if (!RECIPE_PRICING_STORES.includes(price.store)) continue;
        const list = pricesByStore.get(price.store) ?? [];
        if (!list.some((p) => p.id === price.id)) {
          list.push(price);
          pricesByStore.set(price.store, list);
        }
      }
    } catch (err) {
      console.warn(`Recipe pricing search failed for "${query}":`, err);
    }
  }

  const matches: IngredientStoreMatch[] = RECIPE_PRICING_STORES.map((store) => {
    const storePrices = (pricesByStore.get(store) ?? []).sort(
      compareByUnitThenShelfPrice
    );
    let best = storePrices[0] ?? null;

    // Everyday staples: fill Coles/ALDI/WW gaps so common items aren't "missing"
    if (!best) {
      for (const query of queries) {
        const staple = findStaplePrice(query, store);
        if (staple) {
          best = { ...staple, location, query: ingredient.cleanedName };
          break;
        }
      }
    }
    if (!best) {
      const staple = findStaplePrice(ingredient.cleanedName, store);
      if (staple) {
        best = { ...staple, location, query: ingredient.cleanedName };
      }
    }

    return {
      store,
      product: best,
      missing: best == null,
    };
  });

  return {
    rawName: ingredient.rawName,
    cleanedName: ingredient.cleanedName,
    measure: ingredient.measure,
    matches,
  };
}

function buildStoreTotals(lines: PricedIngredientLine[]): RecipeStoreTotal[] {
  const totals = RECIPE_PRICING_STORES.map((store) => {
    let total = 0;
    let matchedCount = 0;
    const missingIngredients: string[] = [];

    for (const line of lines) {
      const match = line.matches.find((m) => m.store === store);
      if (match?.product && !match.missing) {
        total += match.product.currentPrice;
        matchedCount += 1;
      } else {
        missingIngredients.push(line.cleanedName);
      }
    }

    return {
      store,
      label: STORE_LABELS[store],
      total,
      matchedCount,
      missingCount: missingIngredients.length,
      missingIngredients,
      isCheapest: false,
    };
  });

  const eligible = totals.filter((t) => t.matchedCount > 0);
  if (eligible.length > 0) {
    const min = Math.min(...eligible.map((t) => t.total));
    for (const t of totals) {
      t.isCheapest = t.matchedCount > 0 && t.total === min;
    }
  }

  return totals;
}
