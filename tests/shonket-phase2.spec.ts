import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ _schemaVersion: 3, language: "en" })));
});

test("signed-out visitors can reach Shonket emergency help by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/safety");
  const call = page.getByRole("link", { name: "Call 999", exact: true });
  await expect(call).toHaveAttribute("href", "tel:999");
  await page.keyboard.press("Tab");
  for (let i = 0; i < 12 && !(await call.evaluate(element => element === document.activeElement)); i++) await page.keyboard.press("Tab");
  await expect(call).toBeFocused();
});

test("private concern form requires a signed-in Mother while safety remains public", async ({ page }) => {
  await page.goto("/app/care/new", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/sign-in\?next=.*app%2Fcare%2Fnew|sign-in\?next=.*care%2Fnew/);
  await page.goto("/safety");
  await expect(page.getByRole("heading", { name: "Support, at your pace." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 999", exact: true })).toHaveAttribute("href", "tel:999");
});
