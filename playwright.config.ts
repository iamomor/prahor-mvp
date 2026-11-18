import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Auth suites require their isolated local server/config; RLS guards use node:test.
  testIgnore: ["**/contracts/**", "**/auth/**", "**/rls/**", "**/database/**", "**/config/**"],
  use: {
    baseURL: process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000",
    channel: process.env.PLAYWRIGHT_CHANNEL,
    screenshot: "only-on-failure",
  },
  webServer: process.env.PROHOR_TEST_URL ? undefined : {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
