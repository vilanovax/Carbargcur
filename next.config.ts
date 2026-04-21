import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.iran.liara.space" },
      { protocol: "https", hostname: "*.storage.iran.liara.space" },
      { protocol: "https", hostname: "*.storage.c2.liara.space" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: process.cwd(),
  },
  // Webpack config for development mode (only used if --webpack flag is passed)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize watch options to prevent compilation loops
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
};

export default nextConfig;
