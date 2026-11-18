import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Preserve the repository's hand-maintained PROHOR instructions during next dev.
  agentRules: false,
  // Bound static-generation workers on developer machines with limited memory.
  experimental: { cpus: 2 },
};
export default nextConfig;
