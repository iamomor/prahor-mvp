import assert from "node:assert/strict";
import { mkdir, writeFile, unlink, rmdir } from "node:fs/promises";
import path from "node:path";
import { chromium, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const root = process.cwd();
const fixtureDir = path.join(root, "src/app/jibonrekha-account-qa");
const fixture = path.join(fixtureDir, "page.tsx");
const artifacts = path.join(root, "docs/jibonrekha/qa");
const base = process.env.PROHOR_TEST_URL ?? "http://localhost:3000";
const day = 86400000;
const today = new Date();
const date = (offset) => new Date(today.getTime() + offset * day).toISOString().slice(0, 10);
const rows = {
  pregnancies: [
    { id: "pregnancy-one", label: "কাল্পনিক গর্ভকাল এক", estimated_due_date: date(63), last_menstrual_period_date: null },
    { id: "pregnancy-two", label: "কাল্পনিক গর্ভকাল দুই", estimated_due_date: date(140), last_menstrual_period_date: null },
  ],
  babies: [{ id: "baby-one", pregnancy_id: "pregnancy-one", label: "কাল্পনিক শিশু", birth_date: null }],
  observations: [], conditions: [], symptomNotes: [], corrections: [],
  visits: [
    { id: "visit-one", subject: "mother", pregnancy_id: "pregnancy-one", baby_id: null, occurred_at: new Date(today.getTime() - day).toISOString(), place_note: "প্রথম ক্লিনিক", note: null },
    { id: "visit-two", subject: "mother", pregnancy_id: "pregnancy-two", baby_id: null, occurred_at: today.toISOString(), place_note: "দ্বিতীয় ক্লিনিক", note: null },
  ],
};
let browser;
await mkdir(fixtureDir);
try {
  await writeFile(fixture, 'import { AccountRecords } from "@/features/jibonrekha/AccountRecords"; export default function Page() { return <main><AccountRecords /></main>; }\n');
  await mkdir(artifacts, { recursive: true });
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "bn-BD" });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  let posts = [];
  await page.route("**/api/jibonrekha", async route => {
    if (route.request().method() === "GET") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(rows) });
    posts.push({ body: route.request().postDataJSON(), key: route.request().headers()["idempotency-key"] });
    if (posts.length === 2) return route.abort("failed");
    return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ saved: true, id: "synthetic-id" }) });
  });
  await page.goto(base + "/jibonrekha-account-qa");
  await expect(page.getByRole("heading", { name: "জীবনরেখা", exact: true })).toBeVisible();
  const arc = page.getByRole("region", { name: "গর্ভকালের রেখা" });
  await expect(arc).toContainText("৩১ সপ্তাহ", { timeout: 30000 });
  const visitCard = page.getByRole("heading", { name: "সাম্প্রতিক ভিজিট" }).locator("../..");
  await expect(visitCard).toContainText("প্রথম ক্লিনিক");
  await expect(visitCard).not.toContainText("দ্বিতীয় ক্লিনিক");
  await page.screenshot({ path: path.join(artifacts, "overview-mobile.png"), fullPage: true, caret: "initial" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: path.join(artifacts, "overview-desktop.png"), fullPage: true, caret: "initial" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("link", { name: "রিপোর্ট বুঝি" })).toHaveAttribute("href", "/app/bujhi");
  await page.getByText("সন্তান হওয়ার পর", { exact: true }).click();
  await expect(page.getByRole("link", { name: "সুস্থতা" })).toHaveAttribute("href", "/app/shusthota");
  await page.getByText("সন্তান হওয়ার পর", { exact: true }).click();
  await page.getByRole("button", { name: "শেয়ার" }).click();
  await expect(page.getByRole("link", { name: /বন্ধনে আলাদা সম্মতি দিন/ })).toHaveAttribute("href", "/app/bondhon");
  await page.getByRole("button", { name: /জীবনরেখায় ফিরুন/ }).click();
  for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) {
    for (const contrast of ["", "more"]) {
      await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; if (contrast) document.documentElement.dataset.contrast = contrast; else delete document.documentElement.dataset.contrast; }, { theme, contrast });
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      assert.deepEqual(scan.violations.map(issue => issue.id), [], `${theme} ${contrast} axe`);
    }
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = "quiet-garden"; delete document.documentElement.dataset.contrast; });

  await arc.getByRole("button", { name: /সপ্তাহভিত্তিক যত্ন/ }).focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("গর্ভকালের সপ্তাহ").selectOption("18");
  await page.getByLabel("সপ্তাহের দিন").selectOption("3");
  await page.getByRole("button", { name: /জীবনরেখায় ফিরুন/ }).click();
  await expect(arc).toContainText("১৮ সপ্তাহ ৩ দিন");
  await expect(arc).toContainText("প্রিভিউ");
  await expect(arc).toContainText("নথি অনুযায়ী সম্ভাব্য প্রসবের তারিখ");
  await arc.getByRole("button", { name: "নথির বর্তমান সপ্তাহ দেখুন" }).click();
  await expect(arc).toContainText("৩১ সপ্তাহ");
  await arc.getByLabel("কোন গর্ভকালের নথি দেখবেন").selectOption("pregnancy-two");
  await expect(arc).toContainText("২০ সপ্তাহ");
  await expect(visitCard).toContainText("দ্বিতীয় ক্লিনিক");

  await page.getByRole("button", { name: /মা বা শিশুর তথ্য যোগ করুন/ }).click();
  await expect(page.getByText("ধাপ ১ / ৩")).toBeVisible();
  await page.getByLabel("কার নথি?").selectOption("baby");
  await expect(page.getByRole("button", { name: /তথ্য লেখার ধাপে যান/ })).toBeDisabled();
  await page.getByLabel("কোন গর্ভকালের নথি? (ঐচ্ছিক)").selectOption("pregnancy-one");
  await page.getByLabel("কোন শিশুর নথি?").selectOption("baby-one");
  await expect(page.getByRole("button", { name: /তথ্য লেখার ধাপে যান/ })).toBeEnabled();
  await page.getByLabel("কার নথি?").selectOption("mother");
  await page.getByRole("button", { name: /তথ্য লেখার ধাপে যান/ }).click();
  await expect(page.getByText("ধাপ ২ / ৩")).toBeVisible();
  await page.getByLabel("ওজন-এর মান").fill("60.5");
  await page.getByRole("button", { name: /পছন্দ · Adjust how you use PROHOR/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close settings" }).click();
  await expect(page.getByLabel("ওজন-এর মান")).toHaveValue("60.5");
  await page.getByRole("button", { name: /সংরক্ষণের আগে দেখুন/ }).click();
  await expect(page.getByText("ধাপ ৩ / ৩")).toBeVisible();
  assert.equal(posts.length, 0, "Review must precede save");
  await page.getByRole("button", { name: "আমার অ্যাকাউন্টে সংরক্ষণ করুন" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "সংরক্ষিত হয়েছে" })).toBeVisible();
  assert.equal(posts.length, 1);
  assert.equal(posts[0].body.type, "observation");
  assert.equal(posts[0].body.record.destination.subject, "mother");
  assert.equal(posts[0].body.record.measurement.value, "60.5");
  assert.ok(posts[0].key);
  await page.getByRole("button", { name: /জীবনরেখায় ফিরুন/ }).click();
  await page.getByRole("button", { name: /মা বা শিশুর তথ্য যোগ করুন/ }).click();
  await page.getByRole("button", { name: /তথ্য লেখার ধাপে যান/ }).click();
  await page.getByLabel("ওজন-এর মান").fill("61.2");
  await page.getByRole("button", { name: /সংরক্ষণের আগে দেখুন/ }).click();
  await page.getByRole("button", { name: "আমার অ্যাকাউন্টে সংরক্ষণ করুন" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "সংরক্ষণ নিশ্চিত হয়নি" })).toBeVisible();
  await page.getByRole("button", { name: "আমার অ্যাকাউন্টে সংরক্ষণ করুন" }).click();
  await expect(page.getByRole("status").filter({ hasText: "সংরক্ষিত হয়েছে" })).toBeVisible();
  assert.equal(posts.length, 3);
  assert.deepEqual(posts[1].body, posts[2].body, "uncertain retry keeps payload");
  assert.equal(posts[1].key, posts[2].key, "uncertain retry keeps idempotency key");

  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `reflow ${width}`);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "200% text reflow");
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  assert.deepEqual(axe.violations.map(issue => issue.id), [], "account records axe");
  assert.deepEqual(pageErrors, []);
  console.log("PASS Jibonrekha: week preview, reset, scoped visit, three-step reviewed save, explicit baby choice, draft retained in settings, uncertain retry idempotency, keyboard, seven widths, 200% text, 3 themes × 2 contrasts, axe. API mocked with synthetic data.");
} finally {
  await browser?.close();
  await unlink(fixture).catch(() => {});
  await rmdir(fixtureDir);
}
