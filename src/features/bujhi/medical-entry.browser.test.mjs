import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { chromium, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
const url = (process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000") + "/demo/bujhi/legacy";
const options = { channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" };

const reviewStatus = (page) => page.getByRole("status").last();
async function openSave(page) {
  await page.getByRole("button", { name: "Explain it", exact: true }).click();
  await expect(page.getByRole("region", { name: "Quick Answers" })).toBeVisible();
  await page.getByRole("button", { name: "Continue to save" }).click();
  await page.getByLabel(/Pregnancy record/).selectOption("demo-pregnancy-001");
}

test("manual results must be checked before explanation and save", async () => {
  const browser = await chromium.launch(options);
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(url);
    await page.getByRole("button", { name: /Enter Information/ }).click();
    const form = page.getByRole("form", { name: /Enter Health Information/ });
    await form.getByRole("button", { name: /Submit for review/ }).click();
    await expect(form.getByRole("alert")).toBeVisible();
    await form.getByLabel(/Record destination \(required\)/).selectOption("baby");
    await form.getByLabel(/Test or observation name/).fill("Fictional Beta-hCG");
    await form.getByLabel(/Result or observation/).fill("2,745.39");
    await form.getByLabel(/Measurement unit/).fill("mIU/mL");
    await form.getByLabel(/Observation date/).fill("2026-11-16");
    await form.getByRole("button", { name: /Submit for review/ }).focus();
    await page.keyboard.press("Enter");
    const field = page.getByRole("group", { name: "Fictional Beta-hCG", exact: true });
    const explain = page.getByRole("button", { name: "Explain it", exact: true });
    await expect(explain).toBeDisabled();
    await field.getByText(/Edit field/).click();
    await field.getByLabel(/also save candidate normalization/).check();
    await field.getByRole("button", { name: "Mark Fictional Beta-hCG as checked" }).click();
    await field.getByLabel(/unit \(optional\)/).fill("mIU/mL ");
    await expect(explain).toBeDisabled();
    await field.getByRole("button", { name: "Mark Fictional Beta-hCG as checked" }).click();
    await openSave(page);
    await page.getByLabel(/Specific baby record/).selectOption("demo-baby-001");
    await page.getByRole("button", { name: "Save Verified Information" }).click();
    await expect(reviewStatus(page)).toContainText("1 verified field(s) saved");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ recordType: "baby", recordId: "demo-baby-001", value: "2,745.39", rawValue: "2,745.39", normalizedValue: "2745.39", unit: "mIU/mL" });
    for (const width of [320, 390, 1280]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((entry) => entry.id)).toEqual([]);
    await page.getByRole("link", { name: "View Jibonrekha health timeline" }).click();
    await page.getByRole("button", { name: /আগের তথ্য দেখুন/ }).click();
    await expect(page.getByRole("heading", { name: "Fictional Beta-hCG", exact: true }).first()).toBeVisible();
  } finally { await browser.close(); }
});

test("real English OCR starts after consent and saves only checked synthetic fields", { timeout: 240000 }, async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage();
    await page.goto(url);
    const gallery = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: /Gallery/ }).click();
    await (await gallery).setFiles([]);
    const image = page.getByTestId("bujhi-image-entry");
    const png = await page.evaluate(() => {
      const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 300;
      const ctx = canvas.getContext("2d"); ctx.fillStyle = "white"; ctx.fillRect(0, 0, 1200, 300); ctx.fillStyle = "black"; ctx.font = "36px Arial";
      ctx.fillText("FICTIONAL LAB - DEMO ONLY", 40, 65); ctx.fillText("Beta-hCG 2,745.39 mIU/mL", 40, 145); ctx.fillText("Hemoglobin 11.2 g/dL", 40, 225);
      return canvas.toDataURL("image/png").split(",")[1];
    });
    await image.getByRole("checkbox", { name: /report reader|রিপোর্ট রিডার/ }).check();
    await image.locator("#bujhi-photo-gallery").setInputFiles({ name: "synthetic-report.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
    await image.getByRole("button", { name: /Read my report|রিপোর্ট পড়ুন/ }).click();
    await expect(page.getByRole("heading", { name: "Check what was read" })).toBeVisible({ timeout: 180000 });
    await page.getByText(/^Raw OCR text/).click();
    await expect(page.locator("details:visible pre").first()).toContainText("Beta-hCG 2,745.39 mIU/mL");
    const beta = page.getByRole("group", { name: "Beta-hCG", exact: true });
    await beta.getByText(/Edit field/).click();
    await beta.getByRole("button", { name: "Show source line" }).click();
    await expect(page.getByText(/Highlighted OCR line/)).toBeVisible();
    await beta.getByLabel(/observation date/).fill("2026-11-16");
    await beta.getByRole("button", { name: "Mark Beta-hCG as checked" }).click();
    await page.getByRole("button", { name: "Exclude Hemoglobin", exact: true }).click();
    await openSave(page);
    await page.getByLabel(/Beta-hCG: record destination/).selectOption("mother");
    await page.getByRole("button", { name: "Save Verified Information", exact: true }).click();
    await expect(reviewStatus(page)).toContainText("1 verified field(s) saved");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")));
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ source: "document_extracted", inputMethod: "image", recordId: "demo-mother-001", value: "2,745.39", rawValue: "2,745.39" });
    expect(Number.isFinite(saved[0].ocrConfidence)).toBe(true);
  } finally { await browser.close(); }
});

test("sample report explains its printed range in Auto Bangla, English, and explicit Bangla", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage({ locale: "bn-BD", viewport: { width: 320, height: 900 } });
    await page.goto(url);
    await page.getByRole("button", { name: /Try a sample report/ }).click();
    await page.getByRole("button", { name: /Mark Hemoglobin as checked/ }).click();
    await page.getByRole("button", { name: "বুঝে নিন", exact: true }).click();
    const answers = page.getByRole("region", { name: "দ্রুত উত্তর" });
    await expect(answers).toContainText("মুদ্রিত সীমার নিচে");
    const language = page.getByLabel("Language · ভাষা");
    await language.selectOption("en");
    const english = page.getByRole("region", { name: "Quick Answers" });
    await expect(english).toContainText("Below the printed range");
    await expect(english).toContainText("11.0 – 14.0 g/dL");
    await english.getByRole("button", { name: "What is it?" }).focus();
    await page.keyboard.press("Enter");
    await expect(english.getByRole("link", { name: /MedlinePlus/ })).toBeVisible();
    await language.selectOption("bn");
    await expect(answers).toBeVisible();
    await language.selectOption("auto");
    await expect(answers).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
  } finally { await browser.close(); }
});

test("browser speech provider produces an editable transcript without automatic saving", async () => {
  const browser = await chromium.launch(options);
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      class Recognition {
        processLocally = true;
        static async available() { return "available"; }
        start() { window.recognitionForTest = this; }
        stop() { this.onend?.(); }
        abort() { this.onend?.(); }
      }
      window.SpeechRecognition = Recognition;
    });
    const page = await context.newPage(); await page.goto(url); await page.getByRole("button", { name: "কথা বলে বলুন — Speak Information" }).click();
    await expect(page.getByLabel("Speech language")).toHaveValue("en-US");
    await page.getByLabel("Speech language").selectOption("bn-BD"); await page.getByLabel("Speech language").selectOption("en-US");
    await page.getByRole("button", { name: "Start speech input" }).click();
    await expect(page.getByRole("status")).toContainText("Listening");
    await page.evaluate(() => { window.recognitionForTest.onresult({ results: [[{ transcript: "My blood pressure is 120 over 80 today." }]] }); window.recognitionForTest.onend(); });
    await expect(page.getByLabel("Transcript — speech or manual fallback")).toHaveValue("My blood pressure is 120 over 80 today.");
    await page.getByRole("button", { name: "Create editable speech draft" }).click();
    const form = page.getByRole("form", { name: "Correct your spoken draft" });
    await expect(form.getByLabel(/Test or observation name \(required\)/)).toHaveValue("Blood pressure");
    await expect(form.getByLabel("Result or observation", { exact: false })).toHaveValue("120/80");
    await expect(form.getByLabel(/Measurement unit \(optional\)/)).toHaveValue("");
    await form.getByLabel(/Record destination \(required\)/).selectOption("mother");
    await form.getByLabel(/Measurement unit \(optional\)/).fill("mmHg");
    await form.getByRole("button", { name: /Submit for review/ }).click();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
    await expect(page.getByRole("region", { name: "Original speech transcript" })).toContainText("120 over 80");
    const field = page.getByRole("group", { name: "Blood pressure", exact: true });
    await field.getByRole("button", { name: "Mark Blood pressure as checked" }).click();
    await openSave(page);
    await page.getByRole("button", { name: "Save Verified Information", exact: true }).click();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")));
    expect(saved[0]).toMatchObject({ source: "self_reported", inputMethod: "voice", recordId: "demo-mother-001", value: "120/80", unit: "mmHg" });
  } finally { await browser.close(); }
});

test("unsupported speech falls back to manual transcript; only three input methods are available", async () => {
  const browser = await chromium.launch(options);
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
    const page = await context.newPage(); await page.goto(url);
    await page.getByRole("button", { name: "কথা বলে বলুন — Speak Information" }).click();
    await page.getByRole("button", { name: "Start speech input" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "unsupported" })).toBeVisible();
    await page.getByLabel("Transcript — speech or manual fallback").fill("Fictional note only");
    await page.getByRole("button", { name: "Create editable speech draft" }).click();
    await expect(page.getByRole("form", { name: "Correct your spoken draft" })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
    await page.getByRole("button", { name: "রিপোর্ট স্ক্যান করুন — Scan Report" }).click();
    await expect(page.getByRole("navigation", { name: "Bujhi entry methods" }).getByRole("button")).toHaveText([
      "নিজে লিখুন — Enter Information", "রিপোর্ট স্ক্যান করুন — Scan Report", "কথা বলে বলুন — Speak Information",
    ]);
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.getByLabel(/Video Upload/)).toHaveCount(0);
    for (const input of await page.locator('input[type="file"]').all()) {
      await expect(input).toHaveAttribute("accept", ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp");
    }
    await expect(page.getByTestId("bujhi-image-entry").locator("#bujhi-photo-gallery")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
  } finally { await browser.close(); }
});



test("Bujhi exposes keyboard-accessible input methods without video inputs", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    await page.goto(url);
    const methods = page.getByRole("navigation", { name: "Bujhi entry methods" }).getByRole("button");
    await expect(page.getByRole("form", { name: /Enter Health Information/ })).toHaveCount(0);
    await expect(methods).toHaveText(["নিজে লিখুন — Enter Information", "কথা বলে বলুন — Speak Information"]);
    for (let index = 0; index < 3; index++) {
      await methods.nth(index).focus(); await page.keyboard.press("Enter");
      await expect(methods.nth(index)).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("video")).toHaveCount(0);
      await expect(page.getByLabel(/Video Upload/)).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    for (const input of await page.locator('input[type="file"]').all()) {
      await expect(input).toHaveAttribute("accept", ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp");
    }
  } finally { await browser.close(); }
});

test("maternal laboratory save recovers from storage failure and survives refresh", async () => {
  const browser = await chromium.launch(options);
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = []; page.on("pageerror", error => errors.push(error.message));
    await page.goto(url);
    await page.getByRole("button", { name: "নিজে লিখুন — Enter Information" }).click();
    const form = page.getByRole("form", { name: /Enter Health Information/ });
    await form.getByLabel(/Test or observation name/).fill("Fictional maternal lab");
    await form.getByLabel(/Result or observation/).fill("11.20");
    await form.getByLabel(/Measurement unit/).fill("g/dL");
    await form.getByLabel(/Observation date/).fill("2026-11-18");
    await form.getByRole("button", { name: /Submit for review/ }).click();
    const field = page.getByRole("group", { name: "Fictional maternal lab", exact: true });
    await field.getByRole("button", { name: /Mark Fictional maternal lab as checked/ }).click();
    await openSave(page);
    await page.evaluate(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === "prohor-demo-health-v1") throw new Error("Synthetic quota failure"); return window.originalSetItem.call(this, key, value); }; });
    const save = page.getByRole("button", { name: "Save Verified Information", exact: true });
    await save.click();
    await expect(reviewStatus(page)).toContainText("Information not saved");
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
    await expect(page.getByRole("region", { name: "Save reviewed information" })).toContainText("11.20");
    await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
    await save.click();
    await expect(reviewStatus(page)).toContainText("1 verified field(s) saved");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ recordId: "demo-mother-001", recordType: "mother", value: "11.20", rawValue: "11.20", unit: "g/dL", observedAt: "2026-11-18", inputMethod: "manual", source: "self_reported", structuredResult: { type: "numeric", original: "11.20" } });
    await page.getByRole("link", { name: "View Jibonrekha health timeline" }).click(); await page.waitForURL("**/jibonrekha/records"); await page.reload();
    await page.getByRole("button", { name: /আগের তথ্য দেখুন/ }).click();
    await expect(page.getByRole("heading", { name: "Fictional maternal lab", exact: true })).toBeVisible();
    await expect(page.getByText("11.20 g/dL", { exact: true })).toBeVisible();
    for (const width of [320,360,390,430,768,1280]) { await page.setViewportSize({width,height:900}); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
    expect(axe.violations.map(item => item.id)).toEqual([]); expect(errors).toEqual([]);
  } finally { await browser.close(); }
});

test("complete ANC entry exposes A-J progressively and reports missing context", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage({viewport:{width:320,height:900}}); await page.goto(url);
    await page.getByRole("button", { name: "নিজে লিখুন — Enter Information" }).click();
    await page.getByLabel(/What would you like to record/).filter({visible:true}).selectOption("anc");
    const anc = page.getByRole("region", {name:"Complete antenatal report entry"});
    await expect(anc.locator("details > summary")).toHaveCount(10);
    await expect(anc.locator("details[open]")).toHaveCount(0);
    await anc.getByRole("button", {name:/Keep draft and review/}).click();
    await expect(page.getByRole("region",{name:"Data Review and Guidance"})).toContainText("Not provided");
    await expect(page.getByText("No fields identified. Compare the original and add any information you want to review.")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await browser.close(); }
});

test("an explicitly kept draft restores corrections and exclusions after refresh", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage();
    await page.goto(url);
    await page.getByRole("button", { name: "নিজে লিখুন — Enter Information" }).click();
    const form = page.getByRole("form", { name: /Enter Health Information/ });
    await form.getByLabel(/Test or observation name/).fill("Fictional draft");
    await form.getByLabel(/Result or observation/).fill("Initial source wording");
    await form.getByRole("button", { name: /Keep incomplete draft/ }).click();
    const field = page.getByRole("group", { name: "Fictional draft", exact: true });
    await field.getByText(/Edit field/).click();
    await field.getByLabel(/extracted value/).fill("Corrected wording");
    await field.getByRole("button", { name: /Exclude Fictional draft/ }).click();
    await page.getByRole("button", { name: /Keep local draft/ }).click();
    await expect(reviewStatus(page)).toContainText("Draft kept");
    await page.reload();
    await page.getByRole("button", { name: /Review current drafts/ }).click();
    await expect(field.locator("p").filter({ hasText: /^Corrected wording\s*$/ })).toBeVisible();
    await expect(field.getByText(/Rejected · Excluded/)).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
  } finally {
    await browser.close();
  }
});

test("downloadable PNG goes through local OCR and keeps the original optional", { timeout: 240000 }, async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 720 } });
    await page.goto(url.replace(/\/legacy$/, ""));
    await page.getByRole("button", { name: "ছবি স্ক্যান করি" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Bujhi · বুঝি" })).toBeFocused();

    const scanner = page.getByTestId("bujhi-image-entry");
    const sample = scanner.getByRole("link", { name: "Download sample report (PNG)" });
    const download = page.waitForEvent("download");
    await sample.focus();
    await page.keyboard.press("Enter");
    const downloaded = await download;
    expect(downloaded.suggestedFilename()).toBe("prohor-synthetic-lab-v1.png");
    await scanner.getByRole("checkbox", { name: /report reader|রিপোর্ট রিডার/ }).check();
    await scanner.locator("#bujhi-photo-gallery").setInputFiles({
      name: downloaded.suggestedFilename(),
      mimeType: "image/png",
      buffer: await readFile(await downloaded.path()),
    });
    await scanner.getByRole("button", { name: /Read my report|রিপোর্ট পড়ুন/ }).click();

    await expect(page.getByRole("heading", { name: "Check what was read" })).toBeVisible({ timeout: 180000 });
    const hemoglobin = page.getByRole("group", { name: "Hemoglobin", exact: true });
    await expect(hemoglobin).toContainText("11.2");
    await expect(hemoglobin).toContainText("g/dL");
    const original = page.getByText(/View original/);
    await expect(original.locator("..")).not.toHaveAttribute("open", "");
    await original.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("img", { name: /Original uploaded report/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  } finally { await browser.close(); }
});
