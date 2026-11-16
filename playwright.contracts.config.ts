import { defineConfig } from "@playwright/test";

/** Pure contract tests: intentionally no webServer or browser dependency. */
export default defineConfig({
  testDir: "./tests/contracts",
  workers: 1,
  reporter: "list",
  outputDir: "test-results/contracts",
});
