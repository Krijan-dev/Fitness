/**
 * Free TheMealDB client — no API key / billing required.
 * Docs: https://www.themealdb.com/api.php
 * Endpoint: https://www.themealdb.com/api/json/v1/1/search.php?s={term}
 */

export const THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export interface ThemealdbIngredient {
  /** Original ingredient string from TheMealDB */
  rawName: string;
  /** Cleaned core ingredient name (quantities stripped) */
  cleanedName: string;
  /** Measure string e.g. "500g", "1 tsp" */
  measure?: string;
}

export interface ThemealdbMeal {
  id: string;
  name: string;
  thumbnail?: string;
  category?: string;
  area?: string;
  instructions?: string;
  youtubeUrl?: string;
  sourceUrl?: string;
  ingredients: ThemealdbIngredient[];
}

type MealDbRow = Record<string, string | null | undefined>;

export async function searchThemealdbMeals(
  searchTerm: string
): Promise<ThemealdbMeal[]> {
  const q = searchTerm.trim();
  if (!q) return [];

  const url = `${THEMEALDB_BASE_URL}/search.php?s=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TheMealDB search failed (${res.status})`);
  }

  const body = (await res.json()) as { meals?: MealDbRow[] | null };
  if (!body.meals || !Array.isArray(body.meals)) return [];

  return body.meals.map(mapMeal);
}

export async function getThemealdbMealById(
  id: string
): Promise<ThemealdbMeal | null> {
  const mealId = id.trim();
  if (!mealId) return null;

  const url = `${THEMEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(mealId)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  const body = (await res.json()) as { meals?: MealDbRow[] | null };
  const row = body.meals?.[0];
  return row ? mapMeal(row) : null;
}

function mapMeal(row: MealDbRow): ThemealdbMeal {
  return {
    id: String(row.idMeal ?? ""),
    name: String(row.strMeal ?? "Untitled meal"),
    thumbnail: row.strMealThumb || undefined,
    category: row.strCategory || undefined,
    area: row.strArea || undefined,
    instructions: row.strInstructions || undefined,
    youtubeUrl: row.strYoutube || undefined,
    sourceUrl: row.strSource || undefined,
    ingredients: extractIngredients(row),
  };
}

/** Pull strIngredient1..20 + strMeasure1..20 */
export function extractIngredients(row: MealDbRow): ThemealdbIngredient[] {
  const out: ThemealdbIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const raw = (row[`strIngredient${i}`] ?? "").toString().trim();
    if (!raw) continue;
    const measure = (row[`strMeasure${i}`] ?? "").toString().trim() || undefined;
    out.push({
      rawName: raw,
      cleanedName: cleanIngredientName(raw),
      measure,
    });
  }
  return out.filter((ing) => ing.cleanedName.length > 0);
}

/**
 * Strip quantities / measurements from an ingredient string.
 * Examples: "500g Beef" → "Beef", "1 tsp Salt" → "Salt", "Beef mince" → "Beef mince"
 */
export function cleanIngredientName(raw: string): string {
  let s = raw.trim();
  if (!s) return "";

  // Normalize whitespace
  s = s.replace(/\s+/g, " ");

  // Remove leading fractions / decimals / ranges: "1/2", "1.5", "2-3", "½"
  s = s.replace(
    /^[\d½⅓⅔¼¾⅛⅜⅝⅞]+([./-][\d½⅓⅔¼¾⅛⅜⅝⅞]+)?(\s*(x|×)\s*[\d.]+)?\s*/i,
    ""
  );

  // Remove leading unit tokens (optionally with "of")
  s = s.replace(
    /^(g|kg|mg|ml|l|ltr|litre|liter|oz|lb|lbs|tsp|tsps|tbsp|tbsps|tablespoon|tablespoons|teaspoon|teaspoons|cup|cups|clove|cloves|slice|slices|pinch|pinches|handful|handfuls|can|cans|packet|packets|bunch|bunches|stick|sticks|dash|sprig|sprigs|piece|pieces|whole)\b\.?\s*(of\s+)?/i,
    ""
  );

  // Patterns like "500g Beef", "200 ml milk", "1 tbsp olive oil"
  s = s.replace(
    /^[\d./\s½⅓⅔¼¾⅛⅜⅝⅞]*(g|kg|mg|ml|l|oz|lb|tsp|tbsp|cups?|tablespoons?|teaspoons?)\b\.?\s*/i,
    ""
  );

  // Trailing measure leftovers in parentheses
  s = s.replace(/\([^)]*\d[^)]*\)/g, " ").trim();
  s = s.replace(/\s+/g, " ").trim();

  // Drop ultra-short / empty after cleaning
  if (s.length < 2) return raw.trim();

  // Title-ish casing for display consistency
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
