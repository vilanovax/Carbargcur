import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors due to Radix UI React 19 incompatibility
    // TODO: Remove this once Radix UI releases React 19 compatible types
    ignoreBuildErrors: true,
  },
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  // Set root directory to prevent lockfile detection warning
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
