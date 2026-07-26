import type { Ingredient } from "@/types/ingredient";
import type { IngredientDatabaseEntry } from "@/types/ingredient";
import { generateId } from "@/utils/ids";

export function createEmptyIngredient(): Ingredient {
  return {
    id: generateId(),
    name: "",
    quantity: 100,
    unit: "g",
    caloriesPer100g: 0,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
  };
}

export function ingredientFromDatabase(entry: IngredientDatabaseEntry): Ingredient {
  return {
    id: generateId(),
    name: entry.name,
    quantity: entry.defaultUnit === "item" ? 1 : 100,
    unit: entry.defaultUnit,
    caloriesPer100g: entry.caloriesPer100g,
    proteinPer100g: entry.proteinPer100g,
    carbsPer100g: entry.carbsPer100g,
    fatPer100g: entry.fatPer100g,
    fibrePer100g: entry.fibrePer100g,
    category: entry.category,
    gramEquivalent: entry.defaultUnit === "item" ? 50 : undefined,
  };
}

export function duplicateIngredient(ingredient: Ingredient): Ingredient {
  return { ...ingredient, id: generateId() };
}

export function moveIngredient(
  ingredients: Ingredient[],
  index: number,
  direction: "up" | "down"
): Ingredient[] {
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= ingredients.length) {
    return ingredients;
  }
  const result = [...ingredients];
  const [item] = result.splice(index, 1);
  result.splice(newIndex, 0, item);
  return result;
}

export function updateIngredientAt(
  ingredients: Ingredient[],
  index: number,
  updates: Partial<Ingredient>
): Ingredient[] {
  return ingredients.map((item, i) =>
    i === index ? { ...item, ...updates } : item
  );
}
