import { asString } from "./mappers";

/**
 * Extract / construct product image URLs from grocery API payloads.
 * Unofficial CDN patterns are used only as fallbacks when the API omits images.
 */

const IMAGE_KEYS = [
  "image_url",
  "imageUrl",
  "ImageUrl",
  "image",
  "Image",
  "thumbnail",
  "Thumbnail",
  "thumbnailUrl",
  "thumbnail_url",
  "mediumImage",
  "MediumImage",
  "smallImage",
  "LargeImage",
  "largeImage",
  "productImage",
  "product_image",
  "image_front_url",
  "image_front_small_url",
  "image_small_url",
  "image_thumb_url",
] as const;

export function firstImageFromPayload(
  row: Record<string, unknown>
): string | undefined {
  for (const key of IMAGE_KEYS) {
    const value = asString(row[key]);
    if (value && isLikelyImageUrl(value)) return normalizeImageUrl(value);
  }

  // Nested image objects used by some supermarket payloads
  const nestedCandidates = [row.images, row.Images, row.media, row.Media];
  for (const nested of nestedCandidates) {
    if (!nested || typeof nested !== "object") continue;
    if (Array.isArray(nested)) {
      for (const item of nested) {
        if (typeof item === "string" && isLikelyImageUrl(item)) {
          return normalizeImageUrl(item);
        }
        if (item && typeof item === "object") {
          const found = firstImageFromPayload(item as Record<string, unknown>);
          if (found) return found;
        }
      }
    } else {
      const found = firstImageFromPayload(nested as Record<string, unknown>);
      if (found) return found;
    }
  }

  return undefined;
}

export function extractStockCode(row: Record<string, unknown>): string | undefined {
  return (
    asString(row.stockcode) ??
    asString(row.Stockcode) ??
    asString(row.stockCode) ??
    asString(row.Sku) ??
    asString(row.sku) ??
    asString(row.productId) ??
    asString(row.ProductId) ??
    asString(row.id)
  );
}

/** Woolworths CDN fallback when RapidAPI / UI payload omits image_url */
export function woolworthsCdnImage(stockcode: string): string {
  const code = stockcode.replace(/\D/g, "") || stockcode;
  return `https://cdn0.woolworths.media/content/wowproductimages/medium/${code}.jpg`;
}

/** Coles product image CDN fallback */
export function colesCdnImage(productId: string): string {
  const id = productId.replace(/\D/g, "") || productId;
  return `https://cdn.productimages.coles.com.au/productimages/${id.slice(0, 2)}/${id}.jpg`;
}

/** Open Food Facts barcode front image fallback */
export function openFoodFactsBarcodeImage(barcode: string): string {
  const code = barcode.replace(/\D/g, "");
  if (code.length < 8) {
    return `https://images.openfoodfacts.org/images/products/${code}/front_en.400.jpg`;
  }
  // OFF path: 123/456/789/0123 for 13-digit EAN
  const parts =
    code.length >= 13
      ? [code.slice(0, 3), code.slice(3, 6), code.slice(6, 9), code.slice(9)]
      : [code];
  return `https://images.openfoodfacts.org/images/products/${parts.join("/")}/front_en.400.jpg`;
}

export function resolveProductImageUrl(options: {
  store: string;
  row: Record<string, unknown>;
  barcode?: string;
}): string | undefined {
  const fromPayload = firstImageFromPayload(options.row);
  if (fromPayload) return fromPayload;

  const stock = extractStockCode(options.row);
  if (options.store === "woolworths" && stock) {
    return woolworthsCdnImage(stock);
  }
  if (options.store === "coles" && stock) {
    return colesCdnImage(stock);
  }
  if (
    (options.store === "open-food-facts" || options.barcode) &&
    (options.barcode || asString(options.row.code))
  ) {
    const code = options.barcode || asString(options.row.code)!;
    return openFoodFactsBarcodeImage(code);
  }

  return undefined;
}

function isLikelyImageUrl(value: string): boolean {
  if (value.startsWith("data:image/")) return true;
  if (value.startsWith("//")) return true;
  if (/^https?:\/\//i.test(value)) return true;
  if (value.startsWith("/") && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(value)) {
    return true;
  }
  return false;
}

function normalizeImageUrl(value: string): string {
  if (value.startsWith("//")) return `https:${value}`;
  return value;
}

export const PRODUCT_IMAGE_PLACEHOLDER = "/images/placeholder-product.png";
