import { expect, test } from "@playwright/test";

test("Adapt settings remain usable at 320px and announce live preference changes", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/app/adapt", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );

  await page.locator('input[name="prohor-theme"][value="original-rose"]').check();
  await expect(page.getByRole("status").filter({ hasText: /Theme changed|থিম/ })).toContainText(/Theme changed|থিম/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "original-rose");
});

test("Health chart exposes a complete text table alternative", async ({ page }) => {
  await page.goto("/accessibility", { waitUntil: "networkidle" });

  const chart = page.getByRole("img", { name: /Demo bar chart: maternal weight/ });
  await expect(chart).toBeVisible();
  const tableToggle = page.getByRole("button", { name: /View as table/ });
  await tableToggle.click();

  const table = page.getByRole("table", { name: /Maternal weight by pregnancy week/ });
  await expect(table).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(6);
  await expect(page.getByRole("button", { name: /View as chart/ })).toBeVisible();
});
