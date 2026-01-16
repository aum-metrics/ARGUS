/**
 * Author: Sambath Kumar Natarajan
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse"],
  /* config options here */
};

export default nextConfig;
