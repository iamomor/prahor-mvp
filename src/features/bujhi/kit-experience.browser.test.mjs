import { test } from "node:test";
import { chromium, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const base = process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000";
const options = { channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" };

async function openKit(page) {
  await page.goto(`${base}/demo/bujhi`);
  await page.getByRole("link", { name: /কিটের ফল বুঝি/ }).click();
  await expect(page).toHaveURL(/\/demo\/bujhi\/kit$/);
  await page.getByRole("button", { name: "শুরু করি" }).focus();
  await page.keyboard.press("Enter");
}

async function context(page, type = "strip") {
  await page.getByRole("radio", { name: type === "strip" ? /রেখা দেখা যায়/ : /পর্দায় লেখা দেখা যায়/ }).check();
  await page.getByRole("radio", { name: /মাসিকের নির্ধারিত দিন পেরিয়েছে/ }).check();
  await page.getByRole("button", { name: "পরের ধাপ" }).click();
}

test("faint strip mark gives a cautious path and saves only an optional self-reported note", async () => {
  const browser = await chromium.launch(options);
  try {
    const contextBrowser = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await contextBrowser.newPage();
    await openKit(page);
    await context(page);
    await page.getByRole("radio", { name: /নির্দিষ্ট সময়ের মধ্যে/ }).check();
    await page.getByRole("radio", { name: "না, এখন নেই" }).check();
    await page.getByRole("button", { name: "পরের ধাপ" }).click();
    await page.getByRole("radio", { name: /C ও ফিকে T রেখা/ }).check();
    await page.getByRole("button", { name: "পরের কাজ দেখুন" }).click();
    await expect(page.getByRole("heading", { name: "কিটে দেখা: C ও ফিকে T রেখা" })).toBeVisible();
    await expect(page.getByRole("link", { name: /NHS .* পরীক্ষার তথ্য/ })).toHaveAttribute("href", /doing-a-pregnancy-test/);
    await page.getByLabel("কিট ব্যবহারের তারিখ").fill("2026-11-19");
    await expect(page.getByRole("status").filter({ hasText: "সম্ভাব্য সময়" })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBeNull();
    await page.getByRole("button", { name: "ইচ্ছে হলে নিজের নোট রাখি" }).click();
    await expect(page.getByRole("button", { name: "নিজের নোট রাখুন" })).toBeDisabled();
    await page.getByLabel("কোন গর্ভকালের সঙ্গে নোট রাখবেন?").selectOption("demo-pregnancy-001");
    await page.getByRole("checkbox", { name: /কাল্পনিক তথ্য শুধু এই ডিভাইসের/ }).check();
    await page.getByRole("button", { name: "নিজের নোট রাখুন" }).click();
    await expect(page.getByRole("heading", { name: "নোট রাখার ফল" })).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1") ?? "[]"));
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ source: "self_reported", recordType: "mother", recordId: "demo-mother-001", category: "general_notes", observedAt: "2026-11-19" });
    expect(saved[0].value).toContain("ফিকে T রেখা");
    for (const width of [320, 360, 390, 430, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    const overflowing = await page.evaluate(() => [...document.querySelectorAll("body *")].filter(item => item.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(item => ({ tag: item.tagName, className: typeof item.className === "string" ? item.className : "", text: item.textContent?.slice(0, 50) })));
    expect(overflowing).toEqual([]);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map(item => item.id)).toEqual([]);
    await page.getByRole("link", { name: "জীবনরেখার বিস্তারিত নথিতে দেখুন" }).click();
    await page.getByRole("button", { name: /আগের তথ্য দেখুন/ }).click();
    await expect(page.getByRole("heading", { name: /ঘরে করা pregnancy kit/ })).toBeVisible();
  } finally { await browser.close(); }
});

test("urgent symptoms take priority over a kit mark and offer direct help", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    await openKit(page);
    await context(page, "digital");
    await page.getByRole("radio", { name: /নির্দিষ্ট সময়ের মধ্যে/ }).check();
    await page.getByRole("radio", { name: "হ্যাঁ, এর একটি আছে" }).check();
    await page.getByRole("button", { name: "পরের ধাপ" }).click();
    await expect(page.getByText(/কিটের চিহ্নের জন্য অপেক্ষা করবেন না/)).toBeVisible();
    await expect(page.getByRole("link", { name: /জরুরি সেবা ৯৯৯/ }).last()).toHaveAttribute("href", "tel:999");
    await expect(page.getByRole("button", { name: "ইচ্ছে হলে নিজের নোট রাখি" })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBeNull();
  } finally { await browser.close(); }
});

test("missing control line and late reads do not get treated as confirmed results", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage();
    await openKit(page);
    await context(page);
    await page.getByRole("radio", { name: /সময় পেরোনোর পরে/ }).check();
    await page.getByRole("radio", { name: "না, এখন নেই" }).check();
    await page.getByRole("button", { name: "পরের ধাপ" }).click();
    await page.getByRole("radio", { name: /C রেখা নেই/ }).check();
    await page.getByRole("button", { name: "পরের কাজ দেখুন" }).click();
    await expect(page.getByText(/C রেখা না থাকলে স্ট্রিপের ফল ব্যবহার করবেন না/)).toBeVisible();
    await expect(page.getByText(/সম্ভাব্য সময়/)).toHaveCount(0);
    await page.getByRole("button", { name: "চিহ্ন বদলাই" }).click();
    await page.getByRole("radio", { name: /C ও T—দুটি রেখা/ }).check();
    await page.getByRole("button", { name: "পরের কাজ দেখুন" }).click();
    await expect(page.getByText(/সময় পার হওয়ার পরে দেখা চিহ্ন ধরে সিদ্ধান্ত নেবেন না/)).toBeVisible();
  } finally { await browser.close(); }
});

test("guide, text-only view, digital choice, back path, offline notice, and failed local save remain usable", async () => {
  const browser = await chromium.launch(options);
  try {
    const contextBrowser = await browser.newContext({ viewport: { width: 320, height: 900 } });
    const page = await contextBrowser.newPage();
    await page.goto(`${base}/demo/bujhi/kit`);
    await page.getByRole("button", { name: "কিট বোঝার গাইড" }).click();
    await expect(page.getByRole("heading", { name: "রেখাযুক্ত স্ট্রিপ" })).toBeVisible();
    await page.getByRole("button", { name: "আবার শুরু" }).click();
    await page.getByRole("button", { name: "সব চিহ্ন লেখায়" }).click();
    await expect(page.getByRole("heading", { name: "লেখায় কিটের চিহ্ন" })).toBeVisible();
    await expect(page.locator("dt").filter({ hasText: "C রেখা নেই" })).toBeVisible();
    await page.getByRole("button", { name: "প্রশ্ন শুরু করি" }).click();
    await page.getByRole("radio", { name: /পর্দায় লেখা দেখা যায়/ }).check();
    await page.getByRole("radio", { name: /মাসিকের নির্ধারিত দিন পেরিয়েছে/ }).check();
    await page.getByRole("button", { name: "পরের ধাপ" }).click();
    await page.getByRole("button", { name: "পেছনে" }).click();
    await expect(page.getByRole("radio", { name: /পর্দায় লেখা দেখা যায়/ })).toBeChecked();
    await page.getByRole("button", { name: "পরের ধাপ" }).click();
    await page.getByRole("radio", { name: /নির্দিষ্ট সময়ের মধ্যে/ }).check();
    await page.getByRole("radio", { name: "না, এখন নেই" }).check();
    await page.getByRole("button", { name: "পরের ধাপ" }).click();
    await page.getByRole("radio", { name: /^Pregnant লেখা/ }).check();
    await page.getByRole("button", { name: "পরের কাজ দেখুন" }).click();
    await expect(page.getByRole("heading", { name: /ডিজিটালে Pregnant লেখা/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /জরুরি সেবা ৯৯৯/ })).toBeVisible();
    await contextBrowser.setOffline(true);
    await expect(page.getByRole("status").filter({ hasText: "ইন্টারনেট নেই" })).toBeVisible();
    await page.getByRole("button", { name: "ইচ্ছে হলে নিজের নোট রাখি" }).click();
    await page.getByLabel("কিট ব্যবহারের সঠিক তারিখ").fill("2026-11-19");
    await page.getByLabel("কোন গর্ভকালের সঙ্গে নোট রাখবেন?").selectOption("demo-pregnancy-001");
    await page.getByRole("checkbox", { name: /কাল্পনিক তথ্য শুধু এই ডিভাইসের/ }).check();
    await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("demo quota failure"); }; });
    await page.getByRole("button", { name: "নিজের নোট রাখুন" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "সংরক্ষণ নিশ্চিত হয়নি" })).toBeVisible();
    await expect(page.getByLabel("কিট ব্যবহারের সঠিক তারিখ")).toHaveValue("2026-11-19");
  } finally { await browser.close(); }
});
