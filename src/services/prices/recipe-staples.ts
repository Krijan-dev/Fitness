import type { StoreName } from "@/types/common";
import type { StoreProductPrice } from "@/types/price";

/**
 * Typical AU supermarket shelf prices for common recipe staples.
 * Used when live Coles / Woolworths / ALDI search misses everyday items
 * (blocked APIs, thin ALDI catalogues, odd TheMealDB ingredient wording).
 */
interface StapleDef {
  query: string;
  aliases?: string[];
  productName: string;
  size: string;
  unitPrice?: number;
  unitLabel?: string;
  prices: Partial<Record<"coles" | "woolworths" | "aldi", number>>;
}

const STAPLES: StapleDef[] = [
  {
    query: "chicken breast",
    aliases: ["chicken", "chicken breasts"],
    productName: "Chicken Breast Fillet",
    size: "1kg",
    unitPrice: 12,
    unitLabel: "per kg",
    prices: { coles: 12.5, woolworths: 13, aldi: 11.49 },
  },
  {
    query: "chicken thigh",
    aliases: ["chicken thighs"],
    productName: "Chicken Thigh Fillets",
    size: "1kg",
    unitLabel: "per kg",
    prices: { coles: 10.5, woolworths: 11, aldi: 9.99 },
  },
  {
    query: "beef mince",
    aliases: ["minced beef", "ground beef", "beef"],
    productName: "Beef Mince",
    size: "500g",
    unitLabel: "per kg",
    prices: { coles: 8, woolworths: 8.5, aldi: 7.49 },
  },
  {
    query: "pork",
    aliases: ["pork mince", "pork chops"],
    productName: "Pork Mince",
    size: "500g",
    prices: { coles: 6.5, woolworths: 6.8, aldi: 5.99 },
  },
  {
    query: "salmon",
    aliases: ["salmon fillet"],
    productName: "Salmon Fillet",
    size: "250g",
    prices: { coles: 9.5, woolworths: 9.9, aldi: 8.99 },
  },
  {
    query: "eggs",
    aliases: ["egg", "free range eggs"],
    productName: "Free Range Eggs 12 Pack",
    size: "12 pack",
    prices: { coles: 5.5, woolworths: 5.7, aldi: 4.79 },
  },
  {
    query: "milk",
    aliases: ["full cream milk"],
    productName: "Full Cream Milk",
    size: "2L",
    prices: { coles: 3.2, woolworths: 3.3, aldi: 2.79 },
  },
  {
    query: "butter",
    productName: "Salted Butter",
    size: "500g",
    prices: { coles: 5.5, woolworths: 5.7, aldi: 4.99 },
  },
  {
    query: "cheese",
    aliases: ["cheddar", "cheddar cheese"],
    productName: "Tasty Cheddar Cheese",
    size: "500g",
    prices: { coles: 7.5, woolworths: 7.8, aldi: 6.49 },
  },
  {
    query: "yogurt",
    aliases: ["yoghurt", "greek yogurt", "greek yoghurt"],
    productName: "Greek Style Yogurt",
    size: "1kg",
    prices: { coles: 6.5, woolworths: 6.8, aldi: 5.99 },
  },
  {
    query: "cream",
    aliases: ["thickened cream"],
    productName: "Thickened Cream",
    size: "600ml",
    prices: { coles: 4.2, woolworths: 4.4, aldi: 3.79 },
  },
  {
    query: "rice",
    aliases: ["brown rice", "white rice", "jasmine rice", "basmati rice"],
    productName: "Long Grain Rice",
    size: "1kg",
    prices: { coles: 2.5, woolworths: 2.6, aldi: 1.99 },
  },
  {
    query: "pasta",
    aliases: ["spaghetti", "penne", "noodles"],
    productName: "Spaghetti",
    size: "500g",
    prices: { coles: 1.5, woolworths: 1.6, aldi: 1.19 },
  },
  {
    query: "flour",
    aliases: ["plain flour", "self raising flour"],
    productName: "Plain Flour",
    size: "1kg",
    prices: { coles: 1.8, woolworths: 1.9, aldi: 1.29 },
  },
  {
    query: "sugar",
    aliases: ["brown sugar", "caster sugar", "white sugar"],
    productName: "White Sugar",
    size: "1kg",
    prices: { coles: 2.2, woolworths: 2.3, aldi: 1.79 },
  },
  {
    query: "olive oil",
    aliases: ["oil", "vegetable oil", "sunflower oil", "canola oil"],
    productName: "Olive Oil",
    size: "500ml",
    prices: { coles: 8, woolworths: 8.5, aldi: 6.99 },
  },
  {
    query: "soy sauce",
    aliases: ["soya sauce"],
    productName: "Soy Sauce",
    size: "375ml",
    prices: { coles: 2.8, woolworths: 2.9, aldi: 2.29 },
  },
  {
    query: "salt",
    aliases: ["table salt", "sea salt"],
    productName: "Table Salt",
    size: "500g",
    prices: { coles: 1.2, woolworths: 1.3, aldi: 0.89 },
  },
  {
    query: "pepper",
    aliases: ["black pepper", "ground pepper"],
    productName: "Black Pepper",
    size: "50g",
    prices: { coles: 2.5, woolworths: 2.6, aldi: 1.99 },
  },
  {
    query: "garlic",
    aliases: ["minced garlic", "garlic clove", "garlic cloves"],
    productName: "Fresh Garlic",
    size: "each",
    prices: { coles: 1.5, woolworths: 1.6, aldi: 1.29 },
  },
  {
    query: "onion",
    aliases: ["brown onion", "white onion", "red onion", "onions"],
    productName: "Brown Onion",
    size: "1kg",
    prices: { coles: 2.5, woolworths: 2.7, aldi: 1.99 },
  },
  {
    query: "tomato",
    aliases: ["tomatoes", "cherry tomatoes"],
    productName: "Tomatoes",
    size: "per kg",
    prices: { coles: 4.5, woolworths: 4.8, aldi: 3.99 },
  },
  {
    query: "potato",
    aliases: ["potatoes", "sebago"],
    productName: "Potatoes",
    size: "2kg",
    prices: { coles: 4, woolworths: 4.2, aldi: 3.49 },
  },
  {
    query: "carrot",
    aliases: ["carrots"],
    productName: "Carrots",
    size: "1kg",
    prices: { coles: 2.2, woolworths: 2.4, aldi: 1.79 },
  },
  {
    query: "broccoli",
    productName: "Broccoli",
    size: "each",
    prices: { coles: 2.5, woolworths: 2.8, aldi: 2.19 },
  },
  {
    query: "capsicum",
    aliases: ["bell pepper", "pepper", "red pepper"],
    productName: "Capsicum",
    size: "each",
    prices: { coles: 2.8, woolworths: 3, aldi: 2.49 },
  },
  {
    query: "ginger",
    aliases: ["fresh ginger", "ground ginger"],
    productName: "Fresh Ginger",
    size: "per kg",
    prices: { coles: 12, woolworths: 13, aldi: 9.99 },
  },
  {
    query: "lemon",
    aliases: ["lemons", "lemon juice"],
    productName: "Lemons",
    size: "each",
    prices: { coles: 0.9, woolworths: 1, aldi: 0.79 },
  },
  {
    query: "lime",
    aliases: ["limes"],
    productName: "Limes",
    size: "each",
    prices: { coles: 0.8, woolworths: 0.9, aldi: 0.69 },
  },
  {
    query: "bread",
    aliases: ["white bread", "sandwich bread"],
    productName: "Sandwich Bread",
    size: "650g",
    prices: { coles: 3.2, woolworths: 3.4, aldi: 2.49 },
  },
  {
    query: "cornflour",
    aliases: ["cornstarch", "corn starch"],
    productName: "Cornflour",
    size: "500g",
    prices: { coles: 2.2, woolworths: 2.3, aldi: 1.79 },
  },
  {
    query: "stock",
    aliases: ["chicken stock", "beef stock", "vegetable stock", "broth"],
    productName: "Chicken Stock",
    size: "1L",
    prices: { coles: 2.5, woolworths: 2.6, aldi: 1.99 },
  },
  {
    query: "tomato paste",
    aliases: ["passata", "canned tomatoes", "tinned tomatoes"],
    productName: "Tomato Paste",
    size: "140g",
    prices: { coles: 1.4, woolworths: 1.5, aldi: 0.99 },
  },
  {
    query: "coconut milk",
    aliases: ["coconut cream"],
    productName: "Coconut Milk",
    size: "400ml",
    prices: { coles: 2.2, woolworths: 2.3, aldi: 1.69 },
  },
  {
    query: "honey",
    productName: "Honey",
    size: "500g",
    prices: { coles: 5.5, woolworths: 5.8, aldi: 4.49 },
  },
  {
    query: "bananas",
    aliases: ["banana"],
    productName: "Bananas",
    size: "per kg",
    prices: { coles: 3.9, woolworths: 4, aldi: 3.49 },
  },
  {
    query: "oats",
    aliases: ["rolled oats", "quick oats"],
    productName: "Rolled Oats",
    size: "1kg",
    prices: { coles: 3.9, woolworths: 4.2, aldi: 3.49 },
  },
  {
    query: "prawns",
    aliases: ["shrimp", "prawn"],
    productName: "Raw Prawns",
    size: "500g",
    prices: { coles: 14, woolworths: 14.5, aldi: 12.99 },
  },
  {
    query: "bacon",
    productName: "Streaky Bacon",
    size: "200g",
    prices: { coles: 5, woolworths: 5.2, aldi: 4.49 },
  },
  {
    query: "spinach",
    aliases: ["baby spinach"],
    productName: "Baby Spinach",
    size: "120g",
    prices: { coles: 3, woolworths: 3.2, aldi: 2.49 },
  },
  {
    query: "mushroom",
    aliases: ["mushrooms", "button mushrooms"],
    productName: "Button Mushrooms",
    size: "200g",
    prices: { coles: 3.5, woolworths: 3.7, aldi: 2.99 },
  },
  {
    query: "cucumber",
    productName: "Cucumber",
    size: "each",
    prices: { coles: 2.2, woolworths: 2.4, aldi: 1.79 },
  },
  {
    query: "avocado",
    aliases: ["avocados"],
    productName: "Avocado",
    size: "each",
    prices: { coles: 2.5, woolworths: 2.8, aldi: 1.99 },
  },
  {
    query: "coriander",
    aliases: ["cilantro", "fresh coriander"],
    productName: "Coriander",
    size: "bunch",
    prices: { coles: 2.5, woolworths: 2.7, aldi: 1.99 },
  },
  {
    query: "parsley",
    aliases: ["fresh parsley"],
    productName: "Parsley",
    size: "bunch",
    prices: { coles: 2.5, woolworths: 2.7, aldi: 1.99 },
  },
  {
    query: "basil",
    aliases: ["fresh basil"],
    productName: "Basil",
    size: "bunch",
    prices: { coles: 3, woolworths: 3.2, aldi: 2.49 },
  },
  {
    query: "chilli",
    aliases: ["chili", "chillies", "red chilli"],
    productName: "Red Chillies",
    size: "100g",
    prices: { coles: 2.5, woolworths: 2.6, aldi: 1.99 },
  },
  {
    query: "vinegar",
    aliases: ["white vinegar", "apple cider vinegar", "balsamic vinegar"],
    productName: "White Vinegar",
    size: "2L",
    prices: { coles: 1.8, woolworths: 1.9, aldi: 1.29 },
  },
  {
    query: "mayonnaise",
    aliases: ["mayo"],
    productName: "Mayonnaise",
    size: "445g",
    prices: { coles: 4.5, woolworths: 4.7, aldi: 3.49 },
  },
  {
    query: "vegetables",
    aliases: ["stir-fry vegetables", "mixed vegetables", "frozen vegetables"],
    productName: "Stir Fry Vegetables",
    size: "500g",
    prices: { coles: 3.5, woolworths: 3.7, aldi: 2.99 },
  },
];

const STORE_BRAND: Record<"coles" | "woolworths" | "aldi", string> = {
  coles: "Coles",
  woolworths: "Woolworths",
  aldi: "ALDI",
};

/** Build StoreProductPrice rows for mock / staple fallback. */
export function getRecipeStaplePrices(): StoreProductPrice[] {
  const now = new Date().toISOString();
  const out: StoreProductPrice[] = [];
  let i = 0;
  for (const staple of STAPLES) {
    for (const store of ["coles", "woolworths", "aldi"] as const) {
      const price = staple.prices[store];
      if (price == null) continue;
      i += 1;
      out.push({
        id: `staple-${store}-${i}`,
        query: staple.query,
        productName: staple.productName,
        brand: STORE_BRAND[store],
        size: staple.size,
        store,
        currentPrice: price,
        regularPrice: price,
        unitPrice: staple.unitPrice ?? price,
        unitLabel: staple.unitLabel ?? "per unit",
        isOnSpecial: false,
        availability: "in-stock",
        location: "Australia",
        dataSource: "mock",
        lastUpdated: now,
      });
    }
  }
  return out;
}

/**
 * Find the best staple match for an ingredient query + store.
 * Matches against query, aliases, and product name tokens.
 */
export function findStaplePrice(
  ingredientQuery: string,
  store: StoreName
): StoreProductPrice | null {
  if (store !== "coles" && store !== "woolworths" && store !== "aldi") {
    return null;
  }
  const needle = ingredientQuery.toLowerCase().trim();
  if (!needle) return null;

  let best: { score: number; staple: StapleDef } | null = null;

  for (const staple of STAPLES) {
    const keys = [
      staple.query,
      staple.productName,
      ...(staple.aliases ?? []),
    ].map((k) => k.toLowerCase());

    let score = 0;
    for (const key of keys) {
      if (key === needle) score = Math.max(score, 100);
      else if (needle.includes(key) || key.includes(needle)) {
        score = Math.max(score, 80 + Math.min(key.length, 15));
      } else {
        const tokens = needle.split(/\s+/).filter((t) => t.length > 2);
        const hits = tokens.filter((t) => key.includes(t)).length;
        if (hits > 0) score = Math.max(score, hits * 30);
      }
    }

    if (score >= 30 && (!best || score > best.score)) {
      best = { score, staple };
    }
  }

  if (!best || best.staple.prices[store] == null) return null;

  const price = best.staple.prices[store]!;
  return {
    id: `staple-${store}-${best.staple.query.replace(/\s+/g, "-")}`,
    query: best.staple.query,
    productName: best.staple.productName,
    brand: STORE_BRAND[store],
    size: best.staple.size,
    store,
    currentPrice: price,
    regularPrice: price,
    unitPrice: best.staple.unitPrice ?? price,
    unitLabel: best.staple.unitLabel ?? "per unit",
    isOnSpecial: false,
    availability: "in-stock",
    location: "Australia",
    dataSource: "mock",
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Build search query variants from a TheMealDB cleaned ingredient name.
 * Tries full name first, then AU synonyms, then shorter head tokens.
 */
export function buildIngredientSearchQueries(cleanedName: string): string[] {
  const raw = cleanedName.trim();
  if (!raw) return [];

  const lower = raw.toLowerCase();
  const variants = new Set<string>();
  variants.add(raw);
  variants.add(lower);

  const synonyms: Record<string, string[]> = {
    cornstarch: ["cornflour", "corn flour"],
    "corn starch": ["cornflour"],
    aubergine: ["eggplant"],
    cilantro: ["coriander"],
    scallion: ["spring onion", "green onion"],
    "green onion": ["spring onion"],
    zucchini: ["courgette"],
    shrimp: ["prawns", "prawn"],
    ground: ["mince"],
    "bell pepper": ["capsicum"],
    chile: ["chilli"],
    chili: ["chilli"],
  };

  for (const [from, tos] of Object.entries(synonyms)) {
    if (lower.includes(from)) {
      for (const to of tos) {
        variants.add(lower.replace(from, to));
        variants.add(to);
      }
    }
  }

  // Drop trailing descriptors: "chicken breast fillets" → "chicken breast"
  const tokens = lower.split(/\s+/).filter(Boolean);
  const drop = new Set([
    "fresh",
    "large",
    "small",
    "medium",
    "chopped",
    "diced",
    "sliced",
    "minced",
    "ground",
    "fillets",
    "fillet",
    "pieces",
    "whole",
    "dried",
    "frozen",
    "raw",
    "cooked",
    "boneless",
    "skinless",
  ]);
  const core = tokens.filter((t) => !drop.has(t));
  if (core.length) variants.add(core.join(" "));
  if (core.length >= 2) variants.add(core.slice(0, 2).join(" "));
  if (core.length >= 1) variants.add(core[0]);

  // Singularize simple plurals
  for (const v of [...variants]) {
    if (v.endsWith("oes")) variants.add(v.slice(0, -2));
    else if (v.endsWith("ies")) variants.add(`${v.slice(0, -3)}y`);
    else if (v.endsWith("s") && v.length > 3) variants.add(v.slice(0, -1));
  }

  return [...variants].filter((v) => v.trim().length >= 2).slice(0, 8);
}
