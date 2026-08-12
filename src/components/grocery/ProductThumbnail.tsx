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
 * Remote CDNs use unoptimized images so they still load when Next image
 * config is incomplete (e.g. after a partial Windows/OneDrive pull).
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
      className={`relative shrink-0 overflow-hidden rounded-xl border border-border bg-muted ${className}`}
      style={{ width: size, height: size }}
    >
      {!loaded && !showPlaceholder ? (
        <div
          className="absolute inset-0 animate-pulse bg-slate-200"
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
          unoptimized
          priority={priority}
        />
      )}
    </div>
  );
}
