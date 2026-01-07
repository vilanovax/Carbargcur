import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors due to Radix UI React 19 incompatibility
    // TODO: Remove this once Radix UI releases React 19 compatible types
    ignoreBuildErrors: true,
  },
  // Fix for stuck "Compiling..." indicator
  // Improve file watching and compilation performance
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
