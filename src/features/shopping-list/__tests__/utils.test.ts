import type { ShoppingItem } from "@/types/shopping";
import {
  filterShoppingItems,
  groupShoppingByCategory,
} from "../utils";

const items: ShoppingItem[] = [
  {
    id: "1",
    name: "Chicken breast",
    quantity: 1,
    unit: "kg",
    category: "meat",
    purchased: false,
  },
  {
    id: "2",
    name: "Broccoli",
    quantity: 2,
    unit: "item",
    category: "vegetables",
    purchased: true,
  },
];

describe("shopping-list utils", () => {
  it("filters unpurchased items and search", () => {
    const unpurchased = filterShoppingItems(items, "", "unpurchased");
    expect(unpurchased).toHaveLength(1);

    const search = filterShoppingItems(items, "broccoli", "all");
    expect(search).toHaveLength(1);
    expect(search[0].name).toBe("Broccoli");
  });

  it("groups items by category in order", () => {
    const groups = groupShoppingByCategory(items);
    expect(groups.map((g) => g.category)).toEqual(["vegetables", "meat"]);
  });
});
