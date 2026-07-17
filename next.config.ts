import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingExcludes: {
      "*": [
        "dist/**/*",
        "next-standalone/**/*"
      ]
    }
  }
};

export default nextConfig;
