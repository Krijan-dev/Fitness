import type { GroceryProduct } from "@/types/grocery";
import { enrichGroceryProduct, asNumber, asString } from "./mappers";
import { resolveProductImageUrl } from "./image-urls";
import { nameSimilarity, normalizeProductName } from "./normalizer";

/** Parse ALDI Apify ItemModel price object (amounts in cents) or flat fields. */
export function extractAldiPricing(row: Record<string, unknown>): {
  currentPrice?: number;
  regularPrice?: number;
  unitPrice?: number;
  unitLabel?: string;
  savingsDisplay?: string;
} {
  const nested = row.price;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const p = nested as Record<string, unknown>;
    const cents =
      asNumber(p.amount_relevant) ?? asNumber(p.amount) ?? undefined;
    const comparisonCents = asNumber(p.comparison);
    const wasDisplay = asString(p.was_price_display);
    return {
      currentPrice: cents != null ? cents / 100 : undefined,
      regularPrice: wasDisplay ? parseMoneyDisplay(wasDisplay) : undefined,
      unitPrice: comparisonCents != null ? comparisonCents / 100 : undefined,
      unitLabel: unitLabelFromComparison(asString(p.comparison_display)),
      savingsDisplay: asString(p.savings_display) ?? undefined,
    };
  }

  return {
    currentPrice:
      asNumber(row.price) ??
      asNumber(row.currentPrice) ??
      asNumber(row.salePrice),
    regularPrice:
      asNumber(row.wasPrice) ??
      asNumber(row.was_price) ??
      asNumber(row.regularPrice),
    unitPrice: asNumber(row.unitPrice) ?? asNumber(row.pricePerUnit),
    unitLabel: asString(row.unitPriceText) ?? asString(row.unitLabel),
  };
}

export function resolveAldiAssetImage(
  row: Record<string, unknown>
): string | undefined {
  const assets = row.assets;
  if (!Array.isArray(assets) || assets.length === 0) return undefined;
  const first = assets[0];
  if (!first || typeof first !== "object") return undefined;
  const template = asString((first as Record<string, unknown>).url);
  if (!template) return undefined;
  const slug = asString(row.url_slug_text) ?? "product";
  return template.replaceAll("{width}", "400").replaceAll("{slug}", slug);
}

function parseMoneyDisplay(value: string): number | undefined {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/** " $5.99 per 1 kg" → "$/kg" style label for unit price pills */
function unitLabelFromComparison(display?: string): string | undefined {
  if (!display) return undefined;
  const lower = display.toLowerCase();
  if (lower.includes("100g")) return "$/100g";
  if (lower.includes("100ml") || lower.includes("100 ml")) return "$/100mL";
  if (lower.includes("1 kg") || lower.includes("/kg")) return "$/kg";
  if (lower.includes("1 l") || lower.includes("/l")) return "$/L";
  const per = display.match(/per\s+(.+)$/i);
  return per ? `$/${per[1].trim()}` : display;
}

export function mapAldiApifyItem(
  row: Record<string, unknown>,
  providerId = "aldi-apify"
): GroceryProduct {
  const name =
    asString(row.name) ??
    asString(row.title) ??
    asString(row.productName) ??
    "ALDI product";

  const pricing = extractAldiPricing(row);
  const sku = asString(row.sku) ?? asString(row.id);
  const slug = asString(row.url_slug_text);
  const barcode = asString(row.barcode) ?? asString(row.ean) ?? sku;
  const imageUrl =
    resolveAldiAssetImage(row) ??
    resolveProductImageUrl({ store: "aldi", row, barcode: barcode ?? undefined });

  const isOnSpecial =
    Boolean(row.onSpecial) ||
    Boolean(row.isSpecial) ||
    Boolean(row.specialBuy) ||
    Boolean(pricing.savingsDisplay) ||
    (pricing.regularPrice != null &&
      pricing.currentPrice != null &&
      pricing.regularPrice > pricing.currentPrice);

  const productUrl =
    asString(row.url) ??
    asString(row.productUrl) ??
    (slug ? `https://www.aldi.com.au/product/${slug}` : undefined);

  return enrichGroceryProduct({
    id: `aldi-${sku ?? name}-${pricing.currentPrice ?? 0}`,
    name,
    brand: asString(row.brand_name) ?? asString(row.brand),
    barcode: barcode ?? undefined,
    store: "aldi",
    currentPrice: pricing.currentPrice,
    regularPrice: pricing.regularPrice,
    unitPrice: pricing.unitPrice,
    unitLabel: pricing.unitLabel,
    size:
      asString(row.selling_size) ??
      asString(row.size) ??
      asString(row.packSize) ??
      asString(row.pack_size),
    imageUrl,
    productUrl,
    isOnSpecial,
    catalogueExpiresAt:
      asString(row.on_sale_date_display) ??
      asString(row.specialBuyEndDate) ??
      asString(row.catalogueEndDate) ??
      asString(row.onSaleUntil),
    lastUpdated: new Date().toISOString(),
    dataSource: "cached",
    providerId,
    raw: row,
  });
}

export function filterAldiProductsByQuery(
  products: GroceryProduct[],
  q: string
): GroceryProduct[] {
  const needle = normalizeProductName(q);
  if (!needle) return [];
  const tokens = needle.split(/\s+/).filter((t) => t.length > 2);

  const scored = products
    .map((p) => {
      const hay = normalizeProductName(
        `${p.name} ${p.brand ?? ""} ${p.barcode ?? ""}`
      );
      let score = 0;
      if (hay.includes(needle) || needle.includes(hay)) score = 90;
      else {
        const hits = tokens.filter((t) => hay.includes(t)).length;
        score = hits * 35;
        score += nameSimilarity(q, p.name) * 40;
      }
      return { p, score };
    })
    .filter((x) => x.score >= 35)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.p);
}
