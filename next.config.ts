import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Preserve the repository's hand-maintained PROHOR instructions during next dev.
  agentRules: false,
};
export default nextConfig;
