import type { NextConfig } from "next";

const nextConfig = {
  serverExternalPackages: [
    "@remotion/renderer", 
    "@remotion/bundler", 
    "sharp"
  ],
  experimental: {
  }
};

export default nextConfig;
