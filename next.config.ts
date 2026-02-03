import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@remotion/renderer", 
    "@remotion/bundler", 
    "sharp",
    "@tailwindcss/postcss",
    "tailwindcss",
    "style-loader",
    "css-loader",
    "postcss-loader",
    "lightningcss"
  ],
};

export default nextConfig;
