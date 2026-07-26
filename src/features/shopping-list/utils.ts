import type { ShoppingItem } from "@/types/shopping";
import type { ShoppingCategory } from "@/types/common";
import {
  SHOPPING_CATEGORY_LABELS,
  SHOPPING_CATEGORY_ORDER,
  type ShoppingFilterOption,
} from "./constants";

export function filterShoppingItems(
  items: ShoppingItem[],
  search: string,
  filter: ShoppingFilterOption
): ShoppingItem[] {
  const query = search.trim().toLowerCase();
  return items.filter((item) => {
    if (filter === "unpurchased" && item.purchased) return false;
    if (filter === "purchased" && !item.purchased) return false;
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query) ||
      item.preferredBrand?.toLowerCase().includes(query)
    );
  });
}

export function sortShoppingItemsAlphabetically(
  items: ShoppingItem[]
): ShoppingItem[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export function groupShoppingByCategory(
  items: ShoppingItem[]
): Array<{ category: ShoppingCategory; label: string; items: ShoppingItem[] }> {
  const sorted = sortShoppingItemsAlphabetically(items);
  const groups = new Map<ShoppingCategory, ShoppingItem[]>();

  for (const item of sorted) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }

  return SHOPPING_CATEGORY_ORDER
    .filter((cat) => groups.has(cat))
    .map((category) => ({
      category,
      label: SHOPPING_CATEGORY_LABELS[category],
      items: groups.get(category)!,
    }));
}
