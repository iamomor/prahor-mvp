import { test } from "node:test";
import { chromium, expect } from "@playwright/test";
const url = (process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000") + "/demo/bujhi";
const options = { channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" };

test("image selection stays local, requires consent before OCR, and removal releases the preview", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage(); const writes = [];
    page.on("request", request => { if (["POST", "PATCH", "PUT", "DELETE"].includes(request.method())) writes.push(request.url()); });
    await page.addInitScript(() => {
      window.createdUrls = []; window.revokedUrls = [];
      const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = file => { const url = create(file); window.createdUrls.push(url); return url; };
      URL.revokeObjectURL = url => { window.revokedUrls.push(url); revoke(url); };
    });
    await page.goto(url); await page.getByRole("button", { name: "2. Upload Report Image" }).click();
    const image = page.getByRole("region", { name: "Image OCR entry" });
    const photo = image.getByLabel(/Photo Upload/);
    await photo.setInputFiles({ name: "fictional.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=", "base64") });
    await expect(image.getByRole("img", { name: /Local preview/ })).toBeVisible();
    await image.getByRole("button", { name: "Run local English OCR" }).press("Enter");
    await expect(image.getByRole("alert").filter({ hasText: "Allow the OCR engine" })).toBeVisible();
    await image.getByRole("button", { name: "Remove selected file" }).press("Enter");
    await expect(photo).toBeFocused(); await expect(image.getByRole("img")).toHaveCount(0);
    expect(await page.evaluate(() => window.revokedUrls.includes(window.createdUrls[0]))).toBe(true);
    expect(writes).toEqual([]); expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBeNull();
  } finally { await browser.close(); }
});

test("unsupported microphone input retains an editable manual transcript and cannot save automatically", async () => {
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
    await page.goto(url); await page.getByRole("button", { name: "3. Speak Information" }).press("Enter");
    await page.getByRole("button", { name: "Start speech input" }).press("Enter");
    await expect(page.getByRole("alert").filter({ hasText: "unsupported" })).toBeVisible();
    const transcript = page.getByLabel("Transcript — speech or manual fallback");
    await transcript.fill("Synthetic observation for review"); await expect(transcript).toBeEditable();
    expect(await page.evaluate(() => localStorage.getItem("prohor-demo-health-v1"))).toBeNull();
  } finally { await browser.close(); }
});
