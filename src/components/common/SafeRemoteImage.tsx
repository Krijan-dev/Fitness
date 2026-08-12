"use client";

import { useState, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

type SafeRemoteImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  /** Shown when src is missing or fails to load */
  fallback?: ReactNode;
};

/**
 * next/image wrapper for third-party recipe/product URLs.
 * Uses unoptimized for http(s) remotes so images still load when the
 * optimizer / remotePatterns config is incomplete (common after a partial pull).
 */
export function SafeRemoteImage({
  src,
  alt,
  fallback = null,
  className,
  onError,
  ...rest
}: SafeRemoteImageProps) {
  const [failed, setFailed] = useState(false);
  const url = typeof src === "string" ? src.trim() : "";
  const isRemote = /^https?:\/\//i.test(url);

  if (!url || failed) {
    return <>{fallback}</>;
  }

  return (
    <Image
      {...rest}
      src={url}
      alt={alt}
      className={className}
      unoptimized={isRemote || Boolean(rest.unoptimized)}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
