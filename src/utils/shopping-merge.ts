import type { ShoppingCategory } from "@/types/common";
import type { Ingredient } from "@/types/ingredient";
import type { ShoppingItem } from "@/types/shopping";
import { generateId } from "@/utils/ids";

export interface MergeableIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  sourceRecipeIds: string[];
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function ingredientToShoppingCategory(
  ingredient: Ingredient
): ShoppingCategory {
  const map: Partial<Record<string, ShoppingCategory>> = {
    meat: "meat",
    seafood: "seafood",
    dairy: "dairy",
    vegetables: "vegetables",
    fruits: "fruit",
    grains: "pantry",
    legumes: "pantry",
    nuts: "pantry",
    oils: "pantry",
    spices: "pantry",
    beverages: "drinks",
    other: "other",
  };
  return map[ingredient.category ?? "other"] ?? "other";
}

export function mergeIngredients(
  items: MergeableIngredient[]
): MergeableIngredient[] {
  const map = new Map<string, MergeableIngredient>();

  for (const item of items) {
    const key = `${normalizeName(item.name)}|${item.unit.toLowerCase()}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      existing.sourceRecipeIds = [
        ...new Set([...existing.sourceRecipeIds, ...item.sourceRecipeIds]),
      ];
    } else {
      map.set(key, { ...item, sourceRecipeIds: [...item.sourceRecipeIds] });
    }
  }

  return Array.from(map.values());
}

export function mergeIngredientsToShoppingItems(
  items: MergeableIngredient[]
): Omit<ShoppingItem, "id">[] {
  return mergeIngredients(items).map((item) => ({
    name: item.name,
    quantity: Math.round(item.quantity * 100) / 100,
    unit: item.unit,
    category: item.category,
    purchased: false,
    sourceRecipeIds: item.sourceRecipeIds,
  }));
}

export function toShoppingItems(
  items: Omit<ShoppingItem, "id">[]
): ShoppingItem[] {
  return items.map((item) => ({ ...item, id: generateId() }));
}
