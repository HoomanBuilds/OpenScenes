import type { NextConfig } from "next";

const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    "@remotion/renderer", 
    "@remotion/bundler", 
    "sharp"
  ],
  experimental: {
  }
};

export default nextConfig;
