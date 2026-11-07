import type { NextConfig } from "next";
import path from "node:path";
const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
  outputFileTracingIncludes: { "/*": ["../content/**/*"] },
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
  typedRoutes: false,
};
export default nextConfig;
