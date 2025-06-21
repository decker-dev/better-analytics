import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true, // Enable Node.js middleware
    useCache: true, // Enable use cache directive
  },
};

export default nextConfig;
