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
  "MediumImageFile",
  "mediumImageFile",
  "LargeImageFile",
  "largeImageFile",
  "SmallImageFile",
  "smallImageFile",
  "smallImage",
  "LargeImage",
  "largeImage",
  "productImage",
  "product_image",
  "image_front_url",
  "image_front_small_url",
  "image_small_url",
  "image_thumb_url",
  "uri",
  "Url",
  "url",
] as const;

export function firstImageFromPayload(
  row: Record<string, unknown>,
  store?: string
): string | undefined {
  for (const key of IMAGE_KEYS) {
    const value = asString(row[key]);
    if (value && isLikelyImageUrl(value)) {
      return absolutizeImageUrl(value, store);
    }
  }

  // Nested image objects used by some supermarket payloads
  const nestedCandidates = [
    row.images,
    row.Images,
    row.media,
    row.Media,
    row.imageUris,
    row.ImageUris,
  ];
  for (const nested of nestedCandidates) {
    if (!nested || typeof nested !== "object") continue;
    if (Array.isArray(nested)) {
      for (const item of nested) {
        if (typeof item === "string" && isLikelyImageUrl(item)) {
          return absolutizeImageUrl(item, store);
        }
        if (item && typeof item === "object") {
          const found = firstImageFromPayload(
            item as Record<string, unknown>,
            store
          );
          if (found) return found;
        }
      }
    } else {
      const found = firstImageFromPayload(
        nested as Record<string, unknown>,
        store
      );
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
  const folder = id.length >= 2 ? id.slice(0, 2) : id;
  return `https://cdn.productimages.coles.com.au/productimages/${folder}/${id}.jpg`;
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
  const fromPayload = firstImageFromPayload(options.row, options.store);
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

/**
 * Turn relative supermarket image paths into absolute CDN URLs.
 * Coles often returns `/productimages/12/123.jpg` without a host.
 */
export function absolutizeImageUrl(value: string, store?: string): string {
  let url = value.trim();
  if (url.startsWith("//")) url = `https:${url}`;

  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith("/")) {
    if (url.includes("/productimages/") || url.startsWith("/productimages")) {
      const idx = url.indexOf("/productimages");
      return `https://cdn.productimages.coles.com.au${url.slice(idx)}`;
    }
    if (url.includes("wowproductimages") || url.startsWith("/content/")) {
      return url.startsWith("/content/")
        ? `https://cdn0.woolworths.media${url}`
        : `https://cdn0.woolworths.media${url.startsWith("/") ? url : `/${url}`}`;
    }
    if (store === "coles") {
      return `https://cdn.productimages.coles.com.au${url}`;
    }
    if (store === "woolworths") {
      return `https://cdn0.woolworths.media${url.startsWith("/") ? url : `/${url}`}`;
    }
    if (store === "aldi") {
      return `https://www.aldi.com.au${url}`;
    }
  }

  // Bare filename like "133211.jpg"
  if (/^[\w-]+\.(jpe?g|png|webp|gif)$/i.test(url)) {
    if (store === "woolworths") {
      return woolworthsCdnImage(url.replace(/\.(jpe?g|png|webp|gif)$/i, ""));
    }
    if (store === "coles") {
      return colesCdnImage(url.replace(/\.(jpe?g|png|webp|gif)$/i, ""));
    }
  }

  return url;
}

function isLikelyImageUrl(value: string): boolean {
  if (value.startsWith("data:image/")) return true;
  if (value.startsWith("//")) return true;
  if (/^https?:\/\//i.test(value)) return true;
  if (value.startsWith("/") && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(value)) {
    return true;
  }
  // Woolworths sometimes returns just a filename
  if (/^[\w-]+\.(jpe?g|png|webp|gif)$/i.test(value.trim())) return true;
  // Coles CMS templates occasionally omit extension but include productimages
  if (value.includes("productimages") || value.includes("wowproductimages")) {
    return true;
  }
  return false;
}

export const PRODUCT_IMAGE_PLACEHOLDER = "/images/placeholder-product.svg";

/** Reliable food photos for staple / mock grocery rows (imgix Unsplash). */
export const STAPLE_IMAGE_BY_QUERY: Record<string, string> = {
  "chicken breast":
    "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=200&h=200&q=80",
  "chicken thigh":
    "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=200&h=200&q=80",
  "beef mince":
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=200&h=200&q=80",
  eggs:
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=200&h=200&q=80",
  milk:
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=200&h=200&q=80",
  butter:
    "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=200&h=200&q=80",
  cheese:
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=200&h=200&q=80",
  yogurt:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=200&h=200&q=80",
  "greek yogurt":
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=200&h=200&q=80",
  rice:
    "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=200&h=200&q=80",
  pasta:
    "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=200&h=200&q=80",
  "olive oil":
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&h=200&q=80",
  "soy sauce":
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&h=200&q=80",
  onion:
    "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=200&h=200&q=80",
  garlic:
    "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=200&h=200&q=80",
  tomato:
    "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=200&h=200&q=80",
  broccoli:
    "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=200&h=200&q=80",
  bananas:
    "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=200&h=200&q=80",
  oats:
    "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=200&h=200&q=80",
  bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&h=200&q=80",
  vegetables:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&h=200&q=80",
};

export function stapleImageForQuery(query: string): string | undefined {
  const needle = query.toLowerCase().trim();
  if (STAPLE_IMAGE_BY_QUERY[needle]) return STAPLE_IMAGE_BY_QUERY[needle];
  for (const [key, url] of Object.entries(STAPLE_IMAGE_BY_QUERY)) {
    if (needle.includes(key) || key.includes(needle)) return url;
  }
  return undefined;
}
