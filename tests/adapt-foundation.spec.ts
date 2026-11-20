import { expect, test } from "@playwright/test";

const html = (page: import("@playwright/test").Page, attr: string) => page.locator("html").getAttribute(attr);

// First hits compile routes on the dev server.
test.describe.configure({ timeout: 90_000 });

test.beforeEach(async ({ page }) => {
  // Seed English once; later writes in the test must not be overwritten on navigation.
  await page.addInitScript(() => {
    if (!localStorage.getItem("prohor-access-preferences-v1")) {
      localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ _schemaVersion: 4, language: "en" }));
    }
  });
});

test("changing preferences mid-form keeps what she typed and does not remount the form", async ({ page }) => {
  await page.goto("/poth");
  const search = page.getByRole("searchbox", { name: /Facility name, area or district/ });
  await search.fill("Mohammadpur maternity");
  await search.evaluate(node => { (node as HTMLInputElement & { __draftMarker?: number }).__draftMarker = 1; });

  const trigger = page.getByRole("button", { name: "Adjust how you use PROHOR" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Text size").selectOption("extra-large");
  await dialog.locator('input[value="more"]').check();
  await dialog.getByLabel("More space between controls").check();
  await dialog.getByLabel("Language").selectOption("bn");
  await dialog.getByRole("button", { name: "Close settings" }).click();

  await expect(trigger).toBeFocused();
  expect(await html(page, "data-text-scale")).toBe("extra-large");
  expect(await html(page, "data-contrast")).toBe("more");
  expect(await html(page, "data-layout")).toBe("spacious");
  // Same DOM node (marker survives) and same value after language switch.
  await expect(page.locator('input[type="search"]')).toHaveValue("Mohammadpur maternity");
  expect(await page.locator('input[type="search"]').evaluate(node => (node as HTMLInputElement & { __draftMarker?: number }).__draftMarker)).toBe(1);
});

test("a preset is previewed, applied and undone by keyboard, keeping language and theme", async ({ page }) => {
  await page.goto("/accessibility");
  const preview = page.getByRole("button", { name: "Preview Large and clear" });
  await preview.focus();
  await page.keyboard.press("Enter");
  await expect(preview).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("What will change:")).toBeVisible();
  await expect(page.getByText(/Text size: Default → Extra large/)).toBeVisible();

  const apply = page.getByRole("button", { name: "Apply Large and clear" });
  await apply.focus();
  await page.keyboard.press("Enter");
  expect(await html(page, "data-text-scale")).toBe("extra-large");
  expect(await html(page, "data-contrast")).toBe("more");
  expect(await html(page, "data-layout")).toBe("spacious");
  await expect(page.getByRole("status").filter({ hasText: "Large and clear applied" })).toBeVisible();
  await expect(page.getByText("✓ In use now")).toBeVisible();

  const undo = page.getByRole("button", { name: "Undo Large and clear" });
  await undo.focus();
  await page.keyboard.press("Enter");
  expect(await html(page, "data-text-scale")).toBeNull();
  expect(await html(page, "data-layout")).toBe("comfortable");
  await expect(preview).toBeFocused();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-access-preferences-v1") ?? "{}"));
  expect(saved.language).toBe("en");
  expect(saved.theme).toBe("quiet-garden");
  expect(saved.highContrast).toBeNull();
});

test("the visit card shows only chosen needs, validates the phone and prints", async ({ page }) => {
  await page.goto("/accessibility");
  const make = page.getByRole("button", { name: "Make my card" });
  await make.click();
  await expect(page.getByRole("alert").filter({ hasText: "Choose at least one thing that helps you." })).toBeFocused();

  await page.getByLabel("I need a way in without stairs.").check();
  await page.getByLabel("Helper's phone number").fill("call me");
  await make.click();
  await expect(page.getByRole("alert").filter({ hasText: "Check the phone number" })).toBeVisible();
  await expect(page.getByLabel("Helper's phone number")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Helper's phone number").fill("০১৭১১-০০০০০০");
  await make.click();
  const card = page.getByRole("heading", { name: /MY VISIT CARD/ });
  await expect(card).toBeFocused();
  const sheet = card.locator("..");
  await expect(sheet).toContainText("I need a way in without stairs.");
  await expect(sheet).toContainText("01711000000");
  await expect(sheet).toContainText("Please call 999 for me.");
  await expect(sheet).toContainText("অনুগ্রহ করে আমার জন্য ৯৯৯-এ কল করুন।");
  await expect(sheet).toContainText("This card is not a medical record.");
  await expect(sheet).not.toContainText("interpreter");

  await page.evaluate(() => { (window as Window & { __printed?: number }).__printed = 0; window.print = () => { (window as Window & { __printed?: number }).__printed! += 1; }; });
  await page.getByRole("button", { name: "Print card" }).click();
  expect(await page.evaluate(() => (window as Window & { __printed?: number }).__printed)).toBe(1);
});

test("a change in another tab updates this tab without a reload", async ({ context, page }) => {
  await page.goto("/accessibility");
  const other = await context.newPage();
  await other.goto("/accessibility");
  await other.getByRole("radio", { name: "Extra large" }).check();
  await expect.poll(() => html(page, "data-text-scale")).toBe("extra-large");
  await expect(page.getByRole("radio", { name: "Extra large" })).toBeChecked();
});
