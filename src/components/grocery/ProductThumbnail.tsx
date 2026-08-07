"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/services/grocery/image-urls";

interface ProductThumbnailProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Product thumbnail with skeleton shimmer and local placeholder on error.
 */
export function ProductThumbnail({
  src,
  alt,
  size = 56,
  className = "",
  priority = false,
}: ProductThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showPlaceholder = !src || failed;
  const resolvedSrc = showPlaceholder ? PRODUCT_IMAGE_PLACEHOLDER : src;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40 ${className}`}
      style={{ width: size, height: size }}
    >
      {!loaded && !showPlaceholder ? (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted"
          aria-hidden
        />
      ) : null}

      {showPlaceholder && !src ? (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <Package className="h-5 w-5" aria-hidden />
        </div>
      ) : (
        <Image
          src={resolvedSrc}
          alt={alt}
          width={size}
          height={size}
          className={`h-full w-full object-contain transition-opacity duration-200 ${
            loaded || showPlaceholder ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
          unoptimized={
            showPlaceholder ||
            resolvedSrc.startsWith("/images/") ||
            !isAllowedRemote(resolvedSrc)
          }
          priority={priority}
        />
      )}
    </div>
  );
}

function isAllowedRemote(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return [
      "cdn0.woolworths.media",
      "cdn1.woolworths.media",
      "www.woolworths.com.au",
      "cdn.productimages.coles.com.au",
      "www.coles.com.au",
      "productimages.coles.com.au",
      "images.openfoodfacts.org",
      "static.openfoodfacts.org",
      "www.aldi.com.au",
      "cdn.shopify.com",
      "images.unsplash.com",
    ].some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}
