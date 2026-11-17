import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/ai/barta-audio": ["./public/barta-voice/**/*.mp3"],
  },
  // Preserve the repository's hand-maintained PROHOR instructions during next dev.
  agentRules: false,
};
export default nextConfig;
