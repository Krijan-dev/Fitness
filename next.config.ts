import type { NextConfig } from "next";

const groceryImageHosts = [
  "cdn0.woolworths.media",
  "cdn1.woolworths.media",
  "www.woolworths.com.au",
  "cdn.productimages.coles.com.au",
  "productimages.coles.com.au",
  "www.coles.com.au",
  "images.openfoodfacts.org",
  "static.openfoodfacts.org",
  "world.openfoodfacts.org",
  "www.aldi.com.au",
  "dm.apac.cms.aldi.cx",
  "cdn.shopify.com",
  "images.unsplash.com",
  "maps.googleapis.com",
  "maps.gstatic.com",
];

const nextConfig: NextConfig = {
  // Use BUILD_DIST_DIR for isolated verify builds so `next build` never overwrites
  // the `.next` folder while `next dev` is running (causes missing CSS / 500 errors).
  distDir: process.env.BUILD_DIST_DIR || ".next",
  images: {
    remotePatterns: groceryImageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;
