import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: "poth-final.browser.ts", fullyParallel: false, workers: 1,
  timeout: 45_000, expect: { timeout: 15_000 }, reporter: "list",
  use: { baseURL: process.env.POTH_BASE_URL || "http://127.0.0.1:3017", channel: process.env.POTH_BROWSER_CHANNEL || "chrome", headless: true, viewport: { width: 1280, height: 800 }, trace: "retain-on-failure" },
});
