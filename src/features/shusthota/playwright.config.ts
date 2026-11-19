import { defineConfig } from "@playwright/test";

/** Isolated, network-mocked feature service tests; no app server or database is started. */
export default defineConfig({
  testDir: ".",
  testMatch: "api.spec.ts",
  workers: 1,
  reporter: "list",
  outputDir: "../../../test-results/shusthota-api",
});
