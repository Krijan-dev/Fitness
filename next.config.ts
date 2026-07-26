import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use BUILD_DIST_DIR for isolated verify builds so `next build` never overwrites
  // the `.next` folder while `next dev` is running (causes missing CSS / 500 errors).
  distDir: process.env.BUILD_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
