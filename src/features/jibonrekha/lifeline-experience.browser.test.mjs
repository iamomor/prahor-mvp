import test from "node:test";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const url = (process.env.PROHOR_TEST_URL ?? "http://localhost:3000") + "/demo/jibonrekha";
async function open(width = 390) {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
  const context = await browser.newContext({ viewport: { width, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "জীবনরেখা", exact: true })).toBeVisible();
  return { browser, context, page, errors };
}

test("PDF Today design keeps the pregnancy line, sources and four tasks readable", async () => {
  const { browser, page, errors } = await open(320);
  try {
    await expect(page.getByRole("region", { name: "গর্ভকালের রেখা" })).toContainText("২৪ সপ্তাহ ৬ দিন");
    await expect(page.getByRole("img", { name: /গর্ভকালের রেখা/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "জীবনরেখা প্রধান নেভিগেশন" }).last().getByRole("button")).toHaveCount(4);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(result.violations.map(item => item.id), []);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test("Jibonrekha module links open integrated app destinations", async () => {
  const { browser, page } = await open();
  try {
    const navigation = page.getByRole("navigation", { name: "জীবনরেখা প্রধান নেভিগেশন" }).last();
    await navigation.getByRole("button", { name: "ভিজিট" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: /স্বাস্থ্যসেবা খুঁজুন/ })).toHaveAttribute("href", "/app/poth");
    await navigation.getByRole("button", { name: "আজ" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: "অ্যাকাউন্টের জীবনরেখা" })).toHaveAttribute("href", "/app/jibonrekha");
    await page.getByRole("button", { name: /নতুন তথ্য যোগ করুন · Add a record/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: /রিপোর্ট থেকে যোগ করতে বুঝি/ })).toHaveAttribute("href", "/app/bujhi");
    await expect(page.getByRole("link", { name: "জরুরি সহায়তা" })).toHaveAttribute("href", "/safety");
  } finally { await browser.close(); }
});

test("care guide covers early, current and late weeks with sources and a note path", async () => {
  const { browser, page, errors } = await open(320);
  try {
    await page.getByRole("button", { name: /সপ্তাহভিত্তিক গাইড খুলুন/ }).click();
    await expect(page.getByRole("heading", { name: "সপ্তাহভিত্তিক যত্নের পথ" })).toBeFocused();
    const week = page.getByRole("combobox", { name: /গর্ভকালের সপ্তাহ|অন্য সপ্তাহে যান/ });
    await week.selectOption("1");
    await expect(page.getByText("এই সপ্তাহে নতুন নির্দিষ্ট পরীক্ষা নেই")).toBeVisible();
    await week.selectOption("24");
    await expect(page.getByRole("heading", { name: /গর্ভকালীন ডায়াবেটিস/ })).toBeVisible();
    await week.selectOption("34");
    await expect(page.getByRole("heading", { name: /ডপলার বা অতিরিক্ত পরীক্ষা/ })).toBeVisible();
    await week.selectOption("38");
    await expect(page.getByRole("heading", { name: /প্রসবের প্রস্তুতি/ })).toBeVisible();
    await week.selectOption("40");
    await expect(page.getByRole("heading", { name: /শেষ সপ্তাহের যোগাযোগ/ })).toBeVisible();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.evaluate(() => { document.documentElement.dataset.textScale = "extra-large"; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(axe.violations.map(item => item.id), []);
    await page.getByRole("button", { name: "আজকের নোট লিখুন" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: /নিজের নোট/ })).toBeVisible();
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test("PDF topics remain source-linked and usable through keyboard at 320px", async () => {
  const { browser, page, errors } = await open(320);
  try {
    await page.getByRole("button", { name: /সপ্তাহভিত্তিক গাইড খুলুন/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "গর্ভাবস্থা থেকে জন্মের পর" })).toBeVisible();
    const week40 = page.locator("summary").filter({ hasText: "৪০ সপ্তাহ ও সম্ভাব্য প্রসবের তারিখ" });
    await week40.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "তারিখ ও গর্ভকাল কী বোঝায়" })).toBeVisible();
    await expect(page.getByRole("link", { name: /NHS · Due date calculator/ })).toHaveAttribute("href", "https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/");
    await page.getByRole("combobox", { name: /গর্ভকালের সপ্তাহ|অন্য সপ্তাহে যান/ }).selectOption("40");
    await expect(page.getByRole("heading", { name: "৪০ সপ্তাহের দিকে: তারিখটি একটি অনুমান" })).toBeVisible();
    const warning = page.locator("summary").filter({ hasText: "যেসব লক্ষণে অপেক্ষা করবেন না" });
    await warning.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: /RCOG · Umbilical cord prolapse/ })).toBeVisible();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(axe.violations.map(item => item.id), []);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test("pregnancy label clears the arc and page reflows at phone widths", async () => {
  const { browser, page } = await open(320);
  try {
    for (const width of [320, 360, 390, 430, 768]) {
      await page.setViewportSize({ width, height: 844 });
      const spacing = await page.evaluate(() => {
        const section = document.querySelector('[aria-label="গর্ভকালের রেখা"]');
        const svg = section.querySelector('svg');
        const label = [...section.querySelectorAll('p')].find(node => node.textContent.includes('২৪ সপ্তাহ ৬ দিন'));
        const range = document.createRange();
        range.selectNodeContents(label);
        const text = range.getBoundingClientRect();
        const arc = svg.getBoundingClientRect();
        const scale = arc.width / 318;
        let minGap = Infinity;
        for (let step = 0; step <= 400; step++) {
          const angle = Math.PI * step / 400;
          const x = arc.x + (159 - 133 * Math.cos(angle)) * scale;
          const y = arc.y + (149 - 133 * Math.sin(angle)) * scale;
          const dx = Math.max(text.left - x, 0, x - text.right);
          const dy = Math.max(text.top - y, 0, y - text.bottom);
          minGap = Math.min(minGap, Math.hypot(dx, dy));
        }
        return { minGap, overflow: document.documentElement.scrollWidth - innerWidth };
      });
      assert.ok(spacing.minGap >= 7, `arc gap ${spacing.minGap}px at ${width}px`);
      assert.ok(spacing.overflow <= 0, `horizontal overflow ${spacing.overflow}px at ${width}px`);
    }
  } finally { await browser.close(); }
});

test("three step add reviews and persists without claiming delivery", async () => {
  const { browser, page, errors } = await open();
  try {
    await page.getByRole("button", { name: /নতুন তথ্য যোগ করুন · Add a record/ }).click();
    await expect(page.getByRole("heading", { name: "কী যোগ করবেন?" })).toBeVisible();
    await page.getByRole("button", { name: /রক্তচাপ দুটি সংখ্যা/ }).click();
    await page.getByRole("textbox", { name: "মান বা লেখা" }).fill("112/72");
    await page.getByRole("button", { name: "পাঠানোর আগে দেখে নিন" }).click();
    await expect(page.getByRole("heading", { name: "সংরক্ষণের আগে দেখে নিন" })).toBeVisible();
    await page.getByRole("button", { name: "এই ডিভাইসে সংরক্ষণ" }).click();
    await expect(page.getByRole("status").filter({ hasText: "কোথাও পাঠানো হয়নি" })).toBeVisible();
    await page.reload();
    await expect(page.getByText("112/72", { exact: false }).first()).toBeVisible();
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test("timeline correction preserves earlier value and pack starts empty", async () => {
  const { browser, page, errors } = await open();
  try {
    await page.getByRole("navigation", { name: "জীবনরেখা প্রধান নেভিগেশন" }).last().getByRole("button", { name: "ইতিহাস" }).click();
    await expect(page.getByRole("heading", { name: "ইতিহাস", exact: true })).toBeVisible();
    const weight = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "ওজন" }) }).first();
    await weight.getByRole("button", { name: "বিস্তারিত ও ইতিহাস দেখুন" }).click();
    await expect(page.getByText("64.2 কেজি", { exact: false }).first()).toBeVisible();
    await page.getByRole("textbox", { name: "নতুন মান" }).fill("62.6");
    await page.getByRole("button", { name: /সংশোধন সংরক্ষণ/ }).click();
    await expect(page.getByRole("status").filter({ hasText: "আগের মান ইতিহাসে আছে" })).toBeVisible();
    await page.getByRole("navigation", { name: "জীবনরেখা প্রধান নেভিগেশন" }).last().getByRole("button", { name: "শেয়ার" }).click();
    await expect(page.getByRole("button", { name: /প্রিন্ট কপি দেখুন/ })).toBeDisabled();
    await expect(page.getByRole("checkbox", { name: "আমার নাম ও যোগাযোগ যোগ করুন" })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "বার্তাকে প্রশ্নের উত্তরে ব্যবহার করতে দিন" })).not.toBeChecked();
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test("unknown date shows no estimate, LMP uses calendar arithmetic", async () => {
  const { browser, page } = await open();
  try {
    await page.getByRole("button", { name: "গর্ভকালের তারিখ ও উৎস" }).click();
    await page.getByRole("radio", { name: /জানি না/ }).check();
    await page.getByRole("button", { name: "সংরক্ষণ করুন" }).click();
    await expect(page.getByRole("region", { name: "গর্ভকালের রেখা" })).toContainText("কোনো সপ্তাহ অনুমান করে দেখাব না");
    await page.getByRole("button", { name: "গর্ভকালের তারিখ ও উৎস" }).click();
    await page.getByRole("radio", { name: /শেষ মাসিকের প্রথম দিন/ }).check();
    await page.getByRole("textbox", { name: /শেষ মাসিকের প্রথম দিন/ }).fill("2026-06-12");
    await expect(page.getByText("২২ সপ্তাহ ৬ দিন", { exact: false }).first()).toBeVisible();
  } finally { await browser.close(); }
});

test("visit pack prints only explicitly selected records with identity off", async () => {
  const { browser, page, errors } = await open();
  try {
    await page.getByRole("navigation", { name: "জীবনরেখা প্রধান নেভিগেশন" }).last().getByRole("button", { name: "শেয়ার" }).click();
    await expect(page.getByRole("button", { name: /প্রিন্ট কপি দেখুন/ })).toBeDisabled();
    await page.getByRole("checkbox", { name: /রক্তচাপ · 110\/70/ }).check();
    await page.getByRole("checkbox", { name: /আমি বেছে নেওয়া তথ্য/ }).check();
    await page.getByRole("button", { name: /প্রিন্ট কপি দেখুন/ }).click();
    const sheet = page.locator(".lifeline-print-sheet");
    await expect(sheet).toContainText("110/70");
    await expect(sheet).not.toContainText("62.4");
    await expect(sheet).toContainText("পরিচয় বাদ দেওয়া হয়েছে");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".lifeline-print-controls")).toBeHidden();
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test("identity is printed only after review and demo AI consent is unavailable", async () => {
  const { browser, page } = await open();
  try {
    await page.getByRole("navigation", { name: "জীবনরেখা প্রধান নেভিগেশন" }).last().getByRole("button", { name: "শেয়ার" }).click();
    await expect(page.getByRole("checkbox", { name: "বার্তাকে প্রশ্নের উত্তরে ব্যবহার করতে দিন" })).toBeDisabled();
    await page.getByRole("checkbox", { name: /রক্তচাপ · 110\/70/ }).check();
    await page.getByRole("checkbox", { name: "আমার নাম ও যোগাযোগ যোগ করুন" }).check();
    await page.getByRole("checkbox", { name: /আমি বেছে নেওয়া তথ্য/ }).check();
    await expect(page.getByRole("button", { name: /প্রিন্ট কপি দেখুন/ })).toBeDisabled();
    await page.getByRole("textbox", { name: "নাম", exact: true }).fill("পরীক্ষা মা");
    await page.getByRole("textbox", { name: "যোগাযোগ (ঐচ্ছিক)" }).fill("০১XXXXXXXXX");
    await page.getByRole("checkbox", { name: /আমি বেছে নেওয়া তথ্য/ }).check();
    await page.getByRole("button", { name: /প্রিন্ট কপি দেখুন/ }).click();
    await expect(page.locator(".lifeline-print-sheet")).toContainText("পরীক্ষা মা");
    await expect(page.locator(".lifeline-print-sheet")).toContainText("০১XXXXXXXXX");
  } finally { await browser.close(); }
});

test("draft survives reload and a stale tab cannot overwrite newer records", async () => {
  const { browser, context, page } = await open();
  try {
    await page.getByRole("button", { name: /নতুন তথ্য যোগ করুন · Add a record/ }).click();
    await page.getByRole("button", { name: /ওজন একটি সংখ্যা/ }).click();
    await page.getByRole("textbox", { name: "মান বা লেখা" }).fill("63.1");
    await page.reload();
    await expect(page.getByRole("status").filter({ hasText: "আগের খসড়া ফিরে এসেছে" })).toBeVisible();
    await page.getByRole("button", { name: /নতুন তথ্য যোগ করুন · Add a record/ }).click();
    await page.getByRole("button", { name: /ওজন একটি সংখ্যা/ }).click();
    await expect(page.getByRole("textbox", { name: "মান বা লেখা" })).toHaveValue("63.1");
    const other = await context.newPage();
    await other.goto(url);
    await other.getByRole("button", { name: /গর্ভকালের তারিখ ও উৎস/ }).click();
    await other.getByRole("textbox", { name: "লেবেল" }).fill("অন্য ট্যাবের লেখা");
    await other.getByRole("button", { name: "সংরক্ষণ করুন" }).click();
    await page.getByRole("button", { name: "পাঠানোর আগে দেখে নিন" }).click();
    await page.getByRole("button", { name: "এই ডিভাইসে সংরক্ষণ" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "অন্য ট্যাবে" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "সংরক্ষণের আগে দেখে নিন" })).toBeVisible();
  } finally { await browser.close(); }
});

test("main PDF views reflow and keep accessible names across themes", async () => {
  const { browser, page, errors } = await open(320);
  try {
    const navigation = page.getByRole("navigation", { name: "জীবনরেখা প্রধান নেভিগেশন" }).last();
    for (const name of ["আজ", "ইতিহাস", "ভিজিট", "শেয়ার"]) {
      await navigation.getByRole("button", { name }).click();
      for (const width of [320, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name} overflowed at ${width}px`);
      }
      await page.setViewportSize({ width: 320, height: 900 });
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      assert.deepEqual(axe.violations.map(item => item.id), [], `${name} accessibility`);
    }
    await navigation.getByRole("button", { name: "আজ" }).click();
    for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) for (const contrast of ["", "more"]) {
      await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; document.documentElement.dataset.textScale = "extra-large"; }, { theme, contrast });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${theme}/${contrast} overflowed`);
      await expect(page.getByRole("region", { name: "গর্ভকালের রেখা" })).toBeVisible();
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});
