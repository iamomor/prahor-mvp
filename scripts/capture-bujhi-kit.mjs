import { chromium } from "@playwright/test";

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const base = process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000";
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/demo/bujhi/kit`);
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.screenshot({ path: "docs/bujhi/kit-start-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "শুরু করি" }).click();
  await page.getByRole("radio", { name: /রেখা দেখা যায়/ }).check();
  await page.getByRole("radio", { name: /মাসিকের নির্ধারিত দিন পেরিয়েছে/ }).check();
  await page.getByRole("button", { name: "পরের ধাপ" }).click();
  await page.getByRole("radio", { name: /নির্দিষ্ট সময়ের মধ্যে/ }).check();
  await page.getByRole("radio", { name: "না, এখন নেই" }).check();
  await page.getByRole("button", { name: "পরের ধাপ" }).click();
  await page.getByRole("radio", { name: /C ও ফিকে T রেখা/ }).check();
  await page.getByRole("button", { name: "পরের কাজ দেখুন" }).click();
  await page.screenshot({ path: "docs/bujhi/kit-result-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "docs/bujhi/kit-result-desktop.png", fullPage: true });
} finally { await browser.close(); }
