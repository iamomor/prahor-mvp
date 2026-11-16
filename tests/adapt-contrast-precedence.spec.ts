import { expect, test, type Page } from "@playwright/test";

const root = (page: Page) => page.locator("html");

test("unset contrast follows the OS on first load and after unrelated preference changes", async ({ page }) => {
  await page.emulateMedia({ contrast: "more" });
  await page.goto("/app/adapt", { waitUntil: "networkidle" });
  await expect(root(page)).toHaveAttribute("data-contrast", "more");

  await page.locator('input[name="prohor-theme"][value="original-rose"]').check();
  await expect(root(page)).toHaveAttribute("data-contrast", "more");

  await page.locator('input[name="prohor-text-scale"][value="large"]').check();
  await expect(root(page)).toHaveAttribute("data-contrast", "more");

  await page.locator('input[name="prohor-layout"][value="spacious"]').check();
  await expect(root(page)).toHaveAttribute("data-contrast", "more");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("prohor-access-preferences-v1")!).highContrast)).toBeNull();

  await page.reload({ waitUntil: "networkidle" });
  await expect(root(page)).toHaveAttribute("data-contrast", "more");
  await expect(root(page)).toHaveAttribute("data-theme", "original-rose");
  await expect(root(page)).toHaveAttribute("data-text-scale", "large");
  await expect(root(page)).toHaveAttribute("data-layout", "spacious");
});

test("explicit standard and more contrast choices override OS changes and persist", async ({ page }) => {
  await page.emulateMedia({ contrast: "more" });
  await page.goto("/app/adapt", { waitUntil: "networkidle" });
  await page.locator('input[type="radio"][value="standard"]').check();
  await expect(root(page)).toHaveAttribute("data-contrast", "standard");

  await page.emulateMedia({ contrast: "no-preference" });
  await expect(root(page)).toHaveAttribute("data-contrast", "standard");
  await page.emulateMedia({ contrast: "more" });
  await expect(root(page)).toHaveAttribute("data-contrast", "standard");

  await page.reload({ waitUntil: "networkidle" });
  await expect(root(page)).toHaveAttribute("data-contrast", "standard");

  await page.emulateMedia({ contrast: "no-preference" });
  await page.locator('input[type="radio"][value="more"]').check();
  await expect(root(page)).toHaveAttribute("data-contrast", "more");
  await page.reload({ waitUntil: "networkidle" });
  await expect(root(page)).toHaveAttribute("data-contrast", "more");
  await page.emulateMedia({ contrast: "more" });
  await expect(root(page)).toHaveAttribute("data-contrast", "more");
});

test("no preference follows live OS changes and restore defaults returns to system behavior", async ({ page }) => {
  await page.emulateMedia({ contrast: "no-preference" });
  await page.goto("/app/adapt", { waitUntil: "networkidle" });
  await expect(root(page)).not.toHaveAttribute("data-contrast", "more");

  await page.emulateMedia({ contrast: "more" });
  await expect(root(page)).toHaveAttribute("data-contrast", "more");
  await expect(page.locator('input[type="radio"][value="system"]')).toBeChecked();
  await page.emulateMedia({ contrast: "no-preference" });
  await expect(root(page)).not.toHaveAttribute("data-contrast", "more");
  await expect(page.locator('input[type="radio"][value="system"]')).toBeChecked();

  await page.locator('input[type="radio"][value="standard"]').check();
  await page.getByRole("button", { name: /Restore defaults|মূল পছন্দে ফিরে যান/ }).click();
  await page.emulateMedia({ contrast: "more" });
  await expect(root(page)).toHaveAttribute("data-contrast", "more");
});

test("contrast choice and OS-following state synchronize to another tab", async ({ page }) => {
  await page.emulateMedia({ contrast: "no-preference" });
  await page.goto("/app/adapt", { waitUntil: "networkidle" });
  const secondTab = await page.context().newPage();
  await secondTab.emulateMedia({ contrast: "no-preference" });
  await secondTab.goto("/app/adapt", { waitUntil: "networkidle" });

  await page.locator('input[type="radio"][value="more"]').check();
  await expect(root(secondTab)).toHaveAttribute("data-contrast", "more");
  await expect(secondTab.locator('input[type="radio"][value="more"]')).toBeChecked();

  await page.locator('input[type="radio"][value="system"]').check();
  await expect(root(secondTab)).not.toHaveAttribute("data-contrast", "more");
  await secondTab.emulateMedia({ contrast: "more" });
  await expect(root(secondTab)).toHaveAttribute("data-contrast", "more");
  await expect(secondTab.locator('input[type="radio"][value="system"]')).toBeChecked();
  await secondTab.close();
});
