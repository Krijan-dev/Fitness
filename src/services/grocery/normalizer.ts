const FILLER_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "with",
  "from",
  "fresh",
  "each",
  "pack",
  "pk",
  "pkt",
  "packet",
  "approx",
  "approximately",
  "new",
  "value",
]);

/** Strip case, punctuation, filler words for fuzzy comparison keys. */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !FILLER_WORDS.has(w))
    .join(" ")
    .trim();
}

export interface ParsedUnit {
  quantity: number;
  unit: "g" | "kg" | "ml" | "l" | "item";
  grams?: number;
  ml?: number;
}

/**
 * Parse size strings like "500g", "1.5 kg", "2L", "750ml", "6 pack".
 */
export function parseSizeString(size?: string | null): ParsedUnit | null {
  if (!size) return null;
  const cleaned = size.toLowerCase().replace(/,/g, "").trim();
  const match = cleaned.match(
    /(\d+(?:\.\d+)?)\s*(kg|g|l|lt|litre|liter|ml|mL)?/i
  );
  if (!match) return null;

  const quantity = Number(match[1]);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const rawUnit = (match[2] ?? "item").toLowerCase();
  let unit: ParsedUnit["unit"] = "item";
  let grams: number | undefined;
  let ml: number | undefined;

  if (rawUnit === "kg") {
    unit = "kg";
    grams = quantity * 1000;
  } else if (rawUnit === "g") {
    unit = "g";
    grams = quantity;
  } else if (rawUnit === "l" || rawUnit === "lt" || rawUnit === "litre" || rawUnit === "liter") {
    unit = "l";
    ml = quantity * 1000;
  } else if (rawUnit === "ml") {
    unit = "ml";
    ml = quantity;
  }

  return { quantity, unit, grams, ml };
}

/** Convert between g↔kg and ml↔l for unit-price comparison. */
export function convertUnit(
  value: number,
  from: "g" | "kg" | "ml" | "l",
  to: "g" | "kg" | "ml" | "l"
): number | null {
  const toGramsOrMl = (v: number, u: typeof from): number | null => {
    if (u === "g" || u === "ml") return v;
    if (u === "kg" || u === "l") return v * 1000;
    return null;
  };
  const fromBase = toGramsOrMl(value, from);
  if (fromBase == null) return null;
  if (to === "g" || to === "ml") return fromBase;
  if (to === "kg" || to === "l") return fromBase / 1000;
  return null;
}

/** Simple token Jaccard similarity on normalized names (0–1). */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeProductName(a);
  const nb = normalizeProductName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  const ta = new Set(na.split(" "));
  const tb = new Set(nb.split(" "));
  let intersection = 0;
  for (const t of ta) {
    if (tb.has(t)) intersection += 1;
  }
  const union = ta.size + tb.size - intersection;
  if (union === 0) return 0;
  return intersection / union;
}

export function isLikelySameProduct(
  nameA: string,
  nameB: string,
  threshold = 0.55
): boolean {
  return nameSimilarity(nameA, nameB) >= threshold;
}

/**
 * Prefer unit price when available; otherwise derive from pack size when possible.
 * Returns price per 100g or per 100ml when mass/volume is known.
 */
export function computeComparableUnitPrice(
  currentPrice: number,
  size?: string,
  existingUnitPrice?: number
): { unitPrice: number; unitLabel: string } | null {
  if (existingUnitPrice != null && Number.isFinite(existingUnitPrice)) {
    return { unitPrice: existingUnitPrice, unitLabel: "per unit" };
  }
  const parsed = parseSizeString(size);
  if (!parsed) return null;
  if (parsed.grams && parsed.grams > 0) {
    return {
      unitPrice: (currentPrice / parsed.grams) * 100,
      unitLabel: "per 100g",
    };
  }
  if (parsed.ml && parsed.ml > 0) {
    return {
      unitPrice: (currentPrice / parsed.ml) * 100,
      unitLabel: "per 100ml",
    };
  }
  return null;
}

/** Next Wednesday 00:00 local (AU catalogues often rotate mid-week). */
export function nextWednesdayDate(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun … 3 Wed
  const daysUntil = (3 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntil);
  return d;
}

export function nextWednesdayIso(from: Date = new Date()): string {
  return nextWednesdayDate(from).toISOString();
}
