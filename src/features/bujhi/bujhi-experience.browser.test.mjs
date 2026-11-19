import { test } from "node:test";
import { chromium, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const url = (process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000") + "/demo/bujhi";

test("synthetic PDF review saves only checked values to the chosen mother record", async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(url);
    await expect(page.getByRole("heading", { name: "রিপোর্ট বুঝি" })).toBeVisible();
    const homeAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(homeAxe.violations.map(item => item.id)).toEqual([]);
    await page.getByRole("button", { name: "⇧ রিপোর্ট দিন" }).click();
    await page.getByRole("button", { name: /নমুনা PDF বাছুন/ }).click();
    await page.getByRole("checkbox", { name: /কাল্পনিক.*নমুনা রিপোর্ট/ }).check();
    await page.getByRole("button", { name: "পড়া শুরু করুন" }).click();
    await expect(page.getByRole("heading", { name: "প্রতিটি লাইন আপনি মিলিয়ে নিন" })).toBeVisible();
    const reviewAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(reviewAxe.violations.map(item => item.id)).toEqual([]);
    const glucose = page.locator("article#bujhi-glucose");
    const hb = page.locator("article#bujhi-hemoglobin");
    await expect(glucose.getByRole("button", { name: "ঠিক আছে" })).toBeDisabled();
    await glucose.getByRole("button", { name: "বাদ" }).click();
    await hb.getByRole("button", { name: "ঠিক আছে" }).click();
    await page.getByLabel("যাচাই করা তারিখ").fill("2026-11-18");
    await page.getByRole("radio", { name: /মা/ }).check();
    await page.getByLabel("কোন গর্ভকাল").selectOption("demo-pregnancy-001");
    await page.getByRole("button", { name: "বুঝতে যান" }).click();
    await expect(page.getByRole("heading", { name: "সহজ ভাষায় বুঝি" })).toBeVisible();
    const understandAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(understandAxe.violations.map(item => item.id)).toEqual([]);
    await expect(page.getByRole("link", { name: /MedlinePlus/ })).toHaveAttribute("href", /hemoglobin-test/);
    await page.getByRole("button", { name: "সংরক্ষণে যান" }).click();
    await expect(page.getByRole("button", { name: "সংরক্ষণ করুন" })).toBeDisabled();
    await page.getByRole("checkbox", { name: /এই ডিভাইসের ডেমো রেকর্ডে/ }).check();
    await page.getByRole("button", { name: "সংরক্ষণ করুন" }).click();
    await expect(page.getByRole("heading", { name: "সংরক্ষণের ফল" })).toBeVisible();
    await expect(page.getByRole("status").last()).toContainText("সার্ভারে পাঠানো হয়নি");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1") ?? "[]"));
    const saved = stored.filter(item => item.sourceReportId === "prohor-synthetic-lab-v1-a5191290");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ recordType: "mother", value: "11.2", unit: "g/dL", sourceFieldId: "hemoglobin" });
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map(item => item.id)).toEqual([]);
    await page.getByRole("link", { name: "জীবনরেখায় দেখুন" }).click();
    await page.getByRole("button", { name: /আগের তথ্য দেখুন/ }).click();
    await expect(page.getByText("11.2 g/dL").first()).toBeVisible();
  } finally { await browser.close(); }
});

test("all rejected results save nothing", async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
    const page = await context.newPage();
    await page.goto(url);
    await page.getByRole("button", { name: "⇧ রিপোর্ট দিন" }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: /নমুনা PDF বাছুন/ }).click();
    await page.getByRole("checkbox", { name: /কাল্পনিক.*নমুনা রিপোর্ট/ }).check();
    await page.getByRole("button", { name: "পড়া শুরু করুন" }).click();
    await page.locator("article#bujhi-glucose").getByRole("button", { name: "বাদ" }).click();
    await page.locator("article#bujhi-hemoglobin").getByRole("button", { name: "বাদ" }).click();
    await page.getByRole("button", { name: "বুঝতে যান" }).click();
    await expect(page.getByRole("status").last()).toContainText("কিছু সংরক্ষণ হয়নি");
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBeNull();
  } finally { await browser.close(); }
});
