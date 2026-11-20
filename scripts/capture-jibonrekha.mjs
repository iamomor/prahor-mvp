import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const base = process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000";
const output = "docs/jibonrekha/screenshots";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo/jibonrekha`);
  await page.getByRole("heading", { name: "জীবনরেখা", exact: true }).waitFor();
  await page.screenshot({ path: `${output}/today-mobile.png`, fullPage: true });
  await page.getByRole("button", { name: /নতুন তথ্য যোগ করুন · Add a record/ }).click();
  await page.screenshot({ path: `${output}/add-mobile.png`, fullPage: true });
  const mobileNav = page.getByRole("navigation", { name: "জীবনরেখা প্রধান নেভিগেশন" }).last();
  await mobileNav.getByRole("button", { name: "ইতিহাস" }).click();
  await page.screenshot({ path: `${output}/timeline-mobile.png`, fullPage: true });
  await mobileNav.getByRole("button", { name: "শেয়ার" }).click();
  await page.screenshot({ path: `${output}/share-mobile.png`, fullPage: true });
  await page.getByRole("checkbox", { name: /রক্তচাপ · 110\/70/ }).check();
  await page.getByRole("checkbox", { name: /আমি বেছে নেওয়া তথ্য/ }).check();
  await page.getByRole("button", { name: /প্রিন্ট কপি দেখুন/ }).click();
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.emulateMedia({ media: "print" });
  await page.screenshot({ path: `${output}/visit-pack-a4.png`, fullPage: true });
  await context.close();

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(`${base}/demo/jibonrekha`);
  await desktopPage.getByRole("heading", { name: "জীবনরেখা", exact: true }).waitFor();
  await desktopPage.screenshot({ path: `${output}/today-desktop.png`, fullPage: true });
  await desktop.close();
} finally {
  await browser.close();
}
