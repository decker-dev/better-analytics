import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true, // Enable Node.js middleware
    dynamicIO: true,
  },
};

export default nextConfig;
