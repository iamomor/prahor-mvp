import { test } from "node:test";
import { chromium, expect } from "@playwright/test";

test("Bujhi validates image signatures and revokes local preview URLs on removal", async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
    await context.addInitScript(() => {
      window.revokedUrls = [];
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.revokeObjectURL = (url) => { window.revokedUrls.push(url); revoke(url); };
    });
    const page = await context.newPage();
    await page.goto((process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3000") + "/demo/bujhi/legacy");
    const gallery = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: /Choose from gallery|গ্যালারি বা ফাইল/ }).click();
    await (await gallery).setFiles([]);
    const input = page.locator("#bujhi-photo-gallery");
    const run = page.getByRole("button", { name: /Read my report|রিপোর্ট পড়ুন/ });
    await expect(run).toBeDisabled();
    await input.setInputFiles({ name: "invalid.png", mimeType: "image/png", buffer: Buffer.from("not a PNG") });
    await expect(page.getByRole("region", { name: /Choose a photo|ছবি বাছুন/ }).getByRole("alert")).not.toBeEmpty();
    await expect(run).toBeDisabled();

    const contents = await page.evaluate(() => document.createElement("canvas").toDataURL().split(",")[1]);
    await input.setInputFiles({ name: "synthetic.png", mimeType: "image/png", buffer: Buffer.from(contents, "base64") });
    const preview = page.getByRole("img", { name: /Preview of the report photo|রিপোর্টের ছবির প্রিভিউ/ });
    await expect(preview).toBeVisible();
    const url = await preview.getAttribute("src");
    // Reading needs both a photo and the reader consent; the button stays disabled until then.
    await expect(run).toBeDisabled();
    await page.getByRole("checkbox", { name: /report reader|রিপোর্ট রিডার/ }).check();
    await expect(run).toBeEnabled();
    const remove = page.getByRole("button", { name: /Remove and choose another photo|ছবিটি সরিয়ে/ });
    await remove.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /Choose from gallery|গ্যালারি বা ফাইল/ })).toBeFocused();
    await expect(preview).toHaveCount(0);
    expect(await page.evaluate(() => window.revokedUrls)).toContain(url);
    expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("prohor-demo")))).toEqual([]);
  } finally {
    await browser.close();
  }
});
