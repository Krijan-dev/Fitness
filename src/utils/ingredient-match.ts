/**
 * Normalize ingredient names for pantry ↔ recipe matching.
 * Handles case, whitespace, and simple plural forms.
 */
export function normalizeIngredientName(name: string): string {
  let normalized = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (normalized.endsWith("ies") && normalized.length > 4) {
    normalized = normalized.slice(0, -3) + "y";
  } else if (normalized.endsWith("es") && normalized.length > 4) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.endsWith("s") && !normalized.endsWith("ss") && normalized.length > 3) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function ingredientsMatch(pantryName: string, recipeName: string): boolean {
  const a = normalizeIngredientName(pantryName);
  const b = normalizeIngredientName(recipeName);
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

export function pantryHasIngredient(
  pantryNames: string[],
  recipeIngredientName: string
): boolean {
  return pantryNames.some((name) => ingredientsMatch(name, recipeIngredientName));
}
