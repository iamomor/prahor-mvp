import { chromium } from "@playwright/test";

const browser = await chromium.launch({ channel: "msedge" });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${process.env.PROHOR_TEST_URL ?? "http://localhost:3000"}/demo/jibonrekha`);
  await page.getByRole("button", { name: /সপ্তাহভিত্তিক গাইড খুলুন/ }).click();
  await page.locator("summary").filter({ hasText: "যেসব লক্ষণে অপেক্ষা করবেন না" }).click();
  await page.screenshot({ path: "docs/jibonrekha/screenshots/pregnancy-reference-mobile.png", fullPage: true });
} finally {
  await browser.close();
}
