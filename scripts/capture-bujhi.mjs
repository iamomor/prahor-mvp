import { chromium } from "@playwright/test";

const base = process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/demo/bujhi`);
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.screenshot({ path: "docs/bujhi/start-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "⇧ রিপোর্ট দিন" }).click();
  await page.getByRole("button", { name: /নমুনা PDF বাছুন/ }).click();
  await page.getByRole("checkbox", { name: /কাল্পনিক.*নমুনা রিপোর্ট/ }).check();
  await page.getByRole("button", { name: "পড়া শুরু করুন" }).click();
  await page.screenshot({ path: "docs/bujhi/review-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "docs/bujhi/review-desktop.png", fullPage: true });
} finally { await browser.close(); }
