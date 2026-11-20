import assert from "node:assert/strict";
import { mkdir, writeFile, unlink, rmdir } from "node:fs/promises";
import path from "node:path";
import { chromium, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

// Mount the real account components with synthetic props on a temporary local-only route.
// No sign-in or database claim is made by this component test. Commits are intercepted.
const root = process.cwd();
const fixtureDirectory = path.resolve(root, "src/app/bujhi-review-qa");
const fixture = path.join(fixtureDirectory, "page.tsx");
const artifacts = path.resolve(root, "docs/bujhi/qa");
if (!fixtureDirectory.startsWith(path.resolve(root, "src/app") + path.sep)) throw new Error("Unexpected fixture path.");
await mkdir(fixtureDirectory); // Refuse to overwrite an existing route.
let browser;
try {
  await writeFile(fixture, `import { AccountReportReview } from "@/features/bujhi/AccountReportReview";
import { BujhiTasks } from "@/features/bujhi/BujhiTasks";
export default function Fixture() { return <main><BujhiTasks /><div id="report-review"><AccountReportReview pregnancies={[{id:"a4000000-0000-4000-8000-000000000010",label:"Synthetic pregnancy"}]} /></div></main>; }
`);
  await mkdir(artifacts, { recursive: true });
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "en-US" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydrat/i.test(message.text())) errors.push(message.text()); });
  await page.goto((process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000") + "/bujhi-review-qa");
  const image = page.getByTestId("bujhi-image-entry");
  await expect(image.getByRole("heading", { name: /Scan Medical Report/ })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "report-start-desktop.png"), fullPage: true, caret: "initial" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(artifacts, "report-start-mobile.png"), fullPage: true, caret: "initial" });
  assert.equal((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations.length, 0, "Upload accessibility");
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas"); canvas.width = 1600; canvas.height = 450;
    const ctx = canvas.getContext("2d"); ctx.fillStyle = "white"; ctx.fillRect(0,0,1600,450);
    ctx.fillStyle = "black"; ctx.font = "38px Arial";
    ctx.fillText("FICTIONAL LAB - SYNTHETIC DATA ONLY", 50, 70);
    ctx.fillText("Hemoglobin 11.2 g/dL 11.0-14.0 g/dL", 50, 170);
    ctx.fillText("Fasting glucose 92 mg/dL 70-100 mg/dL", 50, 270);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await image.getByRole("checkbox", { name: /report reader|রিপোর্ট রিডার/ }).check();
  await image.locator("#bujhi-photo-gallery").setInputFiles({ name: "synthetic-account-report.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await image.getByRole("button", { name: /Read my report|রিপোর্ট পড়ুন/ }).click();
  await expect(page.getByRole("heading", { name: "মূল রিপোর্টের সঙ্গে মিলিয়ে দেখুন" })).toBeVisible({ timeout: 180000 });
  await page.getByLabel("ব্যাখ্যার ভাষা").selectOption("en");
  const explain = page.getByRole("button", { name: "Explain checked results" });
  await expect(explain).toBeDisabled();
  const hb = page.getByRole("group", { name: "Hemoglobin", exact: true });
  const glucose = page.getByRole("group", { name: "Fasting glucose", exact: true });
  await hb.getByRole("button", { name: "Mark Hemoglobin as checked" }).focus();
  await page.keyboard.press("Enter");
  await hb.getByLabel("Hemoglobin: value from report").fill("10.8");
  await expect(explain).toBeDisabled();
  await hb.getByRole("button", { name: "Mark Hemoglobin as checked" }).focus();
  await page.keyboard.press("Enter");
  await glucose.getByRole("button", { name: "Mark Fasting glucose as checked" }).focus();
  await page.keyboard.press("Enter");
  await explain.focus(); await page.keyboard.press("Enter");
  const explanation = page.getByRole("region", { name: "Your report explained" });
  await expect(explanation).toContainText("Below the printed interval");
  await expect(explanation).toContainText("Within the printed interval");
  await expect(explanation).toContainText("10.8");
  await expect(explanation.getByRole("link", { name: "MedlinePlus · Blood glucose test" })).toBeVisible();
  for (const width of [320,360,390,430,768,1024,1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "Reflow at " + width);
  }
  for (const theme of ["quiet-garden","original-rose","morning-mist"]) {
    await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; }, theme);
    for (const contrast of ["", "more"]) {
      await page.evaluate((contrast) => { if (contrast) document.documentElement.dataset.contrast = contrast; else delete document.documentElement.dataset.contrast; }, contrast);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      assert.deepEqual(axe.violations.map((issue) => issue.id), [], theme + " " + contrast);
    }
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = "quiet-garden"; delete document.documentElement.dataset.contrast; });
  await page.screenshot({ path: path.join(artifacts, "report-understanding-desktop.png"), fullPage: true, caret: "initial" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Explanation language").selectOption("bn");
  await expect(page.getByRole("region", { name: "আপনার রিপোর্টের ব্যাখ্যা" })).toContainText("মুদ্রিত সীমার নিচে");
  await page.screenshot({ path: path.join(artifacts, "report-understanding-mobile.png"), fullPage: true, caret: "initial" });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await page.setViewportSize({ width: 320, height: 900 });
  console.log("200% overflow elements", await page.evaluate(() => [...document.querySelectorAll("body *")].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({tag:el.tagName, text:el.textContent.slice(0,90),width:el.getBoundingClientRect().width,cls:el.className})).slice(0,20)));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "200% type at 320px");
  await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  await page.getByLabel("ব্যাখ্যার ভাষা").selectOption("en");
  await page.getByRole("button", { name: "Continue to save" }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Save reviewed information" })).toContainText("maternal hemoglobin in g/dL only");
  let calls = [];
  await page.route("**/api/reports/commit", async (route) => {
    calls.push(route.request().postDataJSON());
    if (calls.length === 1) await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ saved: false }) });
    else if (calls.length === 2) await route.abort("failed");
    else await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ saved: true, observationId: "synthetic-observation" }) });
  });
  await page.getByRole("button", { name: "Save reviewed hemoglobin" }).click();
  assert.equal(calls.length, 0, "No save without date and consent");
  await page.getByLabel("Observation date", { exact: true }).fill("2026-11-16");
  await page.getByLabel(/I checked the value, unit and date/).check();
  await page.getByRole("button", { name: "Save reviewed hemoglobin" }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Save could not be confirmed" })).toBeVisible();
  await expect(page.getByLabel("Observation date", { exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Retry account save" }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Save could not be confirmed" })).toBeVisible();
  await page.getByRole("button", { name: "Retry account save" }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Saved to your account" })).toBeVisible();
  assert.equal(calls.length, 3); assert.deepEqual(calls[0], calls[1], "Retry uses identical payload"); assert.deepEqual(calls[1], calls[2]);
  assert.equal(calls[0].reviewedValue, "10.8"); assert.equal(calls[0].rawValue, "11.2");
  assert.equal(calls[0].rawUnit, "g/dL"); assert.equal(calls[0].confirmSave, true);
  assert.equal(Object.hasOwn(calls[0], "rawText"), false); assert.equal(Object.hasOwn(calls[0], "image"), false);
  assert.deepEqual(errors, []);
  console.log("PASS: actual account components; real synthetic OCR; keyboard review; correction resets; bilingual explanations; 7 widths; 3 themes x 2 contrast modes; 200% text; axe; guarded save; identical retry; raw provenance. Account delivery mocked; database authorization tested separately.");
} finally {
  await browser?.close();
  await unlink(fixture).catch(() => {});
  await rmdir(fixtureDirectory);
}
