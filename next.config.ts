import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingExcludes: {
    "*": [
      "dist/**/*",
      "next-standalone/**/*"
    ]
  }
};

export default nextConfig;
