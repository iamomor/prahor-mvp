import { defineConfig } from "@playwright/test";
import { validatePublicKey } from "./scripts/lib/rls-session-safety.mjs";

const live = process.env.PROHOR_AUTH_LIVE === "1";
const site = process.env.PROHOR_AUTH_TEST_URL ?? "http://localhost:3000";
if (live && !["http://localhost:3000", "http://127.0.0.1:3000"].includes(site)) throw new Error("Auth integration tests must use the local app.");
if (live && !["http://localhost:54321", "http://127.0.0.1:54321"].includes(process.env.PROHOR_RLS_URL ?? "")) throw new Error("Auth integration tests require local Supabase.");
if (live) validatePublicKey(process.env.PROHOR_RLS_PUBLIC_KEY);

export default defineConfig({
  testDir: "./tests/auth",
  testMatch: live ? "live.spec.ts" : "offline.spec.ts",
  workers: 1,
  reporter: "list",
  outputDir: "test-results/auth",
  use: { baseURL: live ? site : "http://127.0.0.1:3007", channel: process.env.PLAYWRIGHT_CHANNEL, screenshot: "off", trace: "off", video: "off" },
  webServer: {
    command: live ? `npm run dev -- --hostname ${new URL(site).hostname} --port 3000` : "npm run dev -- --hostname 127.0.0.1 --port 3007",
    url: `${live ? site : "http://127.0.0.1:3007"}/sign-in`,
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_SITE_URL: live ? site : "http://127.0.0.1:3007",
      NEXT_PUBLIC_SUPABASE_URL: live ? process.env.PROHOR_RLS_URL! : "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: live ? process.env.PROHOR_RLS_PUBLIC_KEY! : "",
    },
    timeout: 120000,
  },
});
