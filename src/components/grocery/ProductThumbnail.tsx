"use client";

import { useEffect, useState } from "react";
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
 * Grocery product thumbnail.
 * Uses a plain <img> (not next/image) so Coles/WW/ALDI CDN URLs load reliably
 * without optimizer / remotePatterns issues.
 */
export function ProductThumbnail({
  src,
  alt,
  size = 56,
  className = "",
  priority = false,
}: ProductThumbnailProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showPlaceholder = !src || failed;
  const resolvedSrc = showPlaceholder ? PRODUCT_IMAGE_PLACEHOLDER : src;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-border bg-muted ${className}`}
      style={{ width: size, height: size }}
    >
      {showPlaceholder && !src ? (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <Package className="h-5 w-5" aria-hidden />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- grocery CDNs break under next/image optimization
        <img
          src={resolvedSrc!}
          alt={alt}
          width={size}
          height={size}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
