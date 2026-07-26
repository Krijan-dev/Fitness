import type { ShoppingCategory } from "./common";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  preferredBrand?: string;
  preferredStore?: string;
  notes?: string;
  purchased: boolean;
  sourceRecipeIds?: string[];
}
