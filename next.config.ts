import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Preserve the repository's hand-maintained PROHOR instructions during next dev.
  agentRules: false,
  // These routes locate bundled recordings by a hash computed at runtime.
  outputFileTracingIncludes: {
    "/api/ai/chat": ["./public/barta-voice/*.mp3"],
    "/api/ai/barta-audio": ["./public/barta-voice/*.mp3"],
  },
  // Bound static-generation workers on developer machines with limited memory.
  // staleTimes keeps visited dynamic pages in the client router cache so moving between modules is instant.
  experimental: { cpus: 2, staleTimes: { dynamic: 60, static: 300 } },
};
export default nextConfig;
