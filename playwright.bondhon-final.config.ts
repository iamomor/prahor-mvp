import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'bondhon-final.browser.ts', workers: 1, fullyParallel: false,
  timeout: 90_000, expect: { timeout: 20_000 }, reporter: 'list',
  use: { baseURL: process.env.PROHOR_TEST_URL || 'http://127.0.0.1:3017',
    channel: process.env.BONDHON_BROWSER_CHANNEL || 'chrome',
    viewport: { width: 1280, height: 900 }, headless: true, trace: 'off',
    launchOptions: { ignoreDefaultArgs: ['--disable-back-forward-cache'] } },
});
