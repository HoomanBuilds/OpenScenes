import type { NextConfig } from "next";

const nextConfig = {
  serverExternalPackages: [
    "@remotion/renderer", 
    "@remotion/bundler", 
    "sharp"
  ],
  experimental: {
    turbopack: {
        root: process.cwd(),
    }
  }
};

export default nextConfig;
