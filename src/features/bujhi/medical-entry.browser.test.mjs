import { test } from "node:test";
import { chromium, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
const url = (process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000") + "/demo/bujhi";
const options = { channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" };

test("manual entry requires review, preserves exact values, targets baby, and deduplicates", async () => {
  const browser = await chromium.launch(options);
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage(); await page.goto(url);
    const form = page.getByRole("form", { name: /Enter Health Information/ });
    await form.getByRole("button", { name: "Submit for review" }).click();
    await expect(form.getByRole("alert")).toBeVisible();
    await form.getByLabel(/Record destination \(required\)/).selectOption("baby");
    await form.getByText(/Add more information/).click();
    await form.getByLabel(/Record category \(optional\)/).selectOption("laboratory_tests");
    await form.getByLabel(/Test or observation name \(required\)/).fill("Fictional Beta-hCG");
    await form.getByLabel("Result or observation", { exact: false }).fill("2,745.39");
    await form.getByLabel(/Measurement unit \(optional\)/).fill("mIU/mL");
    await form.getByLabel(/Observation date \(required\)/).fill("2026-11-16");
    await form.getByLabel(/Reference range copied from report \(optional\)/).fill("Fictional interval only");
    await form.getByRole("button", { name: "Submit for review" }).focus(); await page.keyboard.press("Enter");
    const field = page.getByRole("group", { name: "Fictional Beta-hCG", exact: true });
    const save = page.getByRole("button", { name: "Save Verified Information", exact: true });
    await save.click(); await expect(page.getByRole("main").getByRole("status")).toContainText("No new verified");
    await field.getByLabel(/also save candidate normalization/).check();
    await field.getByRole("button", { name: "Mark Fictional Beta-hCG as checked" }).click();
    await field.getByLabel("Fictional Beta-hCG: unit (optional)").fill("mIU/mL ");
    await expect(field.getByText("Pending", { exact: false })).toBeVisible();
    await field.getByRole("button", { name: "Mark Fictional Beta-hCG as checked" }).click();
    await save.click(); await expect(page.getByRole("main").getByRole("status")).toContainText("1 verified field(s) saved");
    await save.click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ recordType: "baby", recordId: "demo-baby-001", source: "self_reported", inputMethod: "manual", value: "2,745.39", rawValue: "2,745.39", normalizedValue: "2745.39", unit: "mIU/mL", reviewStatus: "verified" });
    for (const width of [320, 360, 390, 430, 1280]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((entry) => entry.id)).toEqual([]);
    await page.getByRole("button", { name: "1. Enter Manually" }).click();
    await form.getByRole("button", { name: "Clear form for a new entry" }).click();
    await form.getByLabel(/Test or observation name \(required\)/).fill("Fictional second note");
    await form.getByLabel("Result or observation", { exact: false }).fill("A qualitative fictional note");
    await form.getByLabel(/Observation date \(required\)/).fill("2026-11-16");
    await form.getByRole("button", { name: "Submit for review" }).click();
    const second = page.getByRole("group", { name: "Fictional second note", exact: true });
    await second.getByRole("button", { name: "Mark Fictional second note as checked" }).click();
    await page.getByRole("button", { name: "Save Verified Information", exact: true }).click();
    const both = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")));
    expect(both).toHaveLength(2); expect(both[0].sourceReportId).not.toBe(both[1].sourceReportId);
    await page.getByRole("link", { name: "View Jibonrekha health timeline" }).click();
    await expect(page.getByRole("heading", { name: "Fictional Beta-hCG", exact: true })).toHaveCount(2);
    await page.reload(); await expect(page.getByRole("heading", { name: "Fictional Beta-hCG", exact: true })).toHaveCount(2);
  } finally { await browser.close(); }
});

test("real English Tesseract OCR returns raw synthetic text and saves only explicitly checked fields", { timeout: 240000 }, async () => {
  const browser = await chromium.launch(options);
  try {
    const context = await browser.newContext(); const page = await context.newPage(); await page.goto(url);
    await page.getByRole("button", { name: "2. Upload Report Image" }).click();
    const image = page.getByRole("region", { name: "Image OCR entry" });
    const png = await page.evaluate(() => {
      const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 300;
      const ctx = canvas.getContext("2d"); ctx.fillStyle = "white"; ctx.fillRect(0, 0, 1200, 300); ctx.fillStyle = "black"; ctx.font = "36px Arial";
      ctx.fillText("FICTIONAL LAB - DEMO ONLY", 40, 65); ctx.fillText("Beta-hCG 2,745.39 mIU/mL", 40, 145); ctx.fillText("Hemoglobin 11.2 g/dL", 40, 225);
      return canvas.toDataURL("image/png").split(",")[1];
    });
    await image.getByLabel(/Allow downloads/).check();
    await image.getByLabel(/Photo Upload/).setInputFiles({ name: "synthetic-report.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
    await expect(image.getByRole("button", { name: "Run local English OCR" })).toBeEnabled();
    await image.getByRole("button", { name: "Run local English OCR" }).click();
    await expect(page.getByRole("heading", { name: /Local OCR draft/ })).toBeVisible({ timeout: 180000 });
    await expect(page.locator("details:visible pre").first()).toContainText("Beta-hCG 2,745.39 mIU/mL");
    const beta = page.getByRole("group", { name: "Beta-hCG", exact: true });
    await expect(beta.getByLabel("Beta-hCG: extracted value (required)")).toHaveValue("2,745.39");
    await beta.getByLabel("Beta-hCG: record destination (required)").selectOption("mother");
    await beta.getByLabel("Beta-hCG: observation date (required)").fill("2026-11-16");
    await beta.getByRole("button", { name: "Mark Beta-hCG as checked" }).click();
    await page.getByRole("button", { name: "Exclude Hemoglobin", exact: true }).click();
    await page.getByRole("button", { name: "Save Verified Information", exact: true }).click();
    await expect(page.getByRole("main").getByRole("status")).toContainText("1 verified field(s) saved");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")));
    expect(saved).toHaveLength(1); expect(saved[0]).toMatchObject({ source: "document_extracted", inputMethod: "image", recordId: "demo-mother-001", value: "2,745.39", rawValue: "2,745.39", reviewStatus: "verified" });
    expect(Number.isFinite(saved[0].ocrConfidence)).toBe(true);
    await page.getByRole("button", { name: "2. Upload Report Image" }).click();
    await image.getByRole("button", { name: "Run local English OCR" }).click();
    await expect(beta.getByLabel("Beta-hCG: observation date (required)")).toBeVisible({ timeout: 180000 });
    await expect(beta.getByLabel("Beta-hCG: observation date (required)")).toHaveValue("2026-11-16");
    await expect(beta.getByLabel("Beta-hCG: observation date (required)")).toBeDisabled();
    await page.getByRole("button", { name: "Save Verified Information", exact: true }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")).length)).toBe(1);
    await page.getByRole("link", { name: "View Jibonrekha health timeline" }).click();
    await expect(page.getByText("Medical report (user-reviewed)", { exact: false })).toBeVisible();
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
    const page = await context.newPage(); await page.goto(url); await page.getByRole("button", { name: "3. Speak Information" }).click();
    await expect(page.getByLabel("Speech language")).toHaveValue("en-US");
    await page.getByLabel("Speech language").selectOption("bn-BD"); await page.getByLabel("Speech language").selectOption("en-US");
    await page.getByRole("button", { name: "Start speech input" }).click();
    await expect(page.getByRole("main").getByRole("status")).toContainText("Listening");
    await page.evaluate(() => { window.recognitionForTest.onresult({ results: [[{ transcript: "My blood pressure is 120 over 80 today." }]] }); window.recognitionForTest.onend(); });
    await expect(page.getByLabel("Transcript — speech or manual fallback")).toHaveValue("My blood pressure is 120 over 80 today.");
    await page.getByRole("button", { name: "Create editable speech draft" }).click();
    const form = page.getByRole("form", { name: "Correct your spoken draft" });
    await expect(form.getByLabel(/Test or observation name \(required\)/)).toHaveValue("Blood pressure");
    await expect(form.getByLabel("Result or observation", { exact: false })).toHaveValue("120/80");
    await expect(form.getByLabel(/Measurement unit \(optional\)/)).toHaveValue("");
    await form.getByLabel(/Record destination \(required\)/).selectOption("mother");
    await form.getByLabel(/Measurement unit \(optional\)/).fill("mmHg");
    await form.getByRole("button", { name: "Submit for review" }).click();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
    await expect(page.getByRole("region", { name: "Original speech transcript" })).toContainText("120 over 80");
    const field = page.getByRole("group", { name: "Blood pressure", exact: true });
    await field.getByRole("button", { name: "Mark Blood pressure as checked" }).click(); await page.getByRole("button", { name: "Save Verified Information", exact: true }).click();
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
    await page.getByRole("button", { name: "3. Speak Information" }).click();
    await page.getByRole("button", { name: "Start speech input" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("unsupported");
    await page.getByLabel("Transcript — speech or manual fallback").fill("Fictional note only");
    await page.getByRole("button", { name: "Create editable speech draft" }).click();
    await expect(page.getByRole("form", { name: "Correct your spoken draft" })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
    await page.getByRole("button", { name: "2. Upload Report Image" }).click();
    await expect(page.getByRole("navigation", { name: "Bujhi entry methods" }).getByRole("button")).toHaveText([
      "1. Enter Manually", "2. Upload Report Image", "3. Speak Information",
    ]);
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.getByLabel(/Video Upload/)).toHaveCount(0);
    for (const input of await page.locator('input[type="file"]').all()) {
      await expect(input).toHaveAttribute("accept", ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp");
    }
    await expect(page.getByRole("region", { name: "Image OCR entry" }).getByLabel(/Photo Upload/)).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
  } finally { await browser.close(); }
});



test("Bujhi exposes exactly three keyboard-accessible methods without video inputs", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    await page.goto(url);
    const methods = page.getByRole("navigation", { name: "Bujhi entry methods" }).getByRole("button");
    await expect(methods).toHaveText(["1. Enter Manually", "2. Upload Report Image", "3. Speak Information"]);
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
    const form = page.getByRole("form", { name: /Enter Health Information/ });
    await form.getByLabel(/Test or observation name/).fill("Fictional maternal lab");
    await form.getByLabel(/Result or observation/).fill("11.20");
    await form.getByLabel(/Measurement unit/).fill("g/dL");
    await form.getByLabel(/Observation date/).fill("2026-11-18");
    await form.getByRole("button", { name: /Submit for review/ }).click();
    const field = page.getByRole("group", { name: "Fictional maternal lab", exact: true });
    await field.getByRole("button", { name: /Mark Fictional maternal lab as checked/ }).click();
    await page.evaluate(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === "prohor-demo-health-v1") throw new Error("Synthetic quota failure"); return window.originalSetItem.call(this, key, value); }; });
    const save = page.getByRole("button", { name: "Save Verified Information", exact: true });
    await save.click();
    await expect(page.getByRole("main").getByRole("status")).toContainText("Information not saved");
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
    await expect(field.getByLabel(/extracted value/)).toHaveValue("11.20");
    await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
    await save.click();
    await expect(page.getByRole("main").getByRole("status")).toContainText("1 verified field(s) saved");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-demo-health-v1")));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ recordId: "demo-mother-001", recordType: "mother", value: "11.20", rawValue: "11.20", unit: "g/dL", observedAt: "2026-11-18", inputMethod: "manual", source: "self_reported", structuredResult: { type: "numeric", original: "11.20" } });
    await page.getByRole("link", { name: "View Jibonrekha health timeline" }).click(); await page.waitForURL("**/jibonrekha"); await page.reload();
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
    await page.getByLabel(/What would you like to record/).filter({visible:true}).selectOption("anc");
    const anc = page.getByRole("region", {name:"Complete antenatal report entry"});
    await expect(anc.locator("details > summary")).toHaveCount(10);
    await expect(anc.locator("details[open]")).toHaveCount(0);
    await anc.getByRole("button", {name:/Keep draft and review/}).click();
    await expect(page.getByRole("region",{name:"Data Review and Guidance"})).toContainText("Not provided");
    await expect(page.getByText("No extracted fields to review. Nothing will be saved to Jibonrekha.")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBe(null);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await browser.close(); }
});
