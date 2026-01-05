import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors due to Radix UI React 19 incompatibility
    // TODO: Remove this once Radix UI releases React 19 compatible types
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
