import { expect, test } from "@playwright/test";

test("legacy access and reading layout values resolve to one displayed density", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({
      _schemaVersion: 2,
      theme: "quiet-garden",
      highContrast: null,
      textScale: "default",
      spaciousLayout: true,
      reducedMotion: false,
      simplifiedContent: false,
      communication: "text",
      language: "en",
      focusedView: false,
    }));
    localStorage.setItem("prohor-home-reading-v1", JSON.stringify({
      font: "default",
      textSpacing: "standard",
      density: "compact",
    }));
  });

  await page.goto("/app/adapt");
  await expect(page.locator('input[name="prohor-layout"][value="compact"]')).toBeChecked();
  await page.goto("/app/shonket");
  const preferencesBanner = page.getByRole("region", {
    name: "Accessibility preferences active in Shonket",
  });
  await expect(preferencesBanner).toBeVisible();
  await expect(preferencesBanner.getByText("Spacious layout")).toHaveCount(0);
});

test("density has one persisted source and stays consistent through refresh, reset, and another tab", async ({ page }) => {
  await page.goto("/app/adapt", { waitUntil: "networkidle" });
  const compact = page.locator('input[name="prohor-layout"][value="compact"]');
  await compact.check();
  await expect(page.locator("html")).toHaveAttribute("data-layout", "compact");

  const storedAfterCompact = await page.evaluate(() => ({
    access: JSON.parse(localStorage.getItem("prohor-access-preferences-v1") ?? "{}"),
    reading: JSON.parse(localStorage.getItem("prohor-home-reading-v1") ?? "{}"),
  }));
  expect(storedAfterCompact.access.layoutDensity).toBe("compact");
  expect(storedAfterCompact.access).not.toHaveProperty("spaciousLayout");
  expect(storedAfterCompact.reading).not.toHaveProperty("density");

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('input[name="prohor-layout"][value="compact"]')).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-layout", "compact");

  const secondTab = await page.context().newPage();
  await secondTab.goto("/app/adapt", { waitUntil: "networkidle" });
  await secondTab.locator('input[name="prohor-language"][value="en"]').check();
  await expect(secondTab.locator("html")).toHaveAttribute("lang", "en");
  const spaciousOnFirstTab = page.locator('input[name="prohor-layout"][value="spacious"]');
  await spaciousOnFirstTab.check();
  await expect(secondTab.locator('input[name="prohor-layout"][value="spacious"]')).toBeChecked();
  await expect(secondTab.locator("html")).toHaveAttribute("data-layout", "spacious");

  await page.getByRole("button", { name: /Restore defaults|ডিফল্ট/ }).click();
  await expect(page.locator('input[name="prohor-layout"][value="comfortable"]')).toBeChecked();
  await expect(secondTab.locator('input[name="prohor-layout"][value="comfortable"]')).toBeChecked();
  await expect(secondTab.locator("html")).toHaveAttribute("data-layout", "comfortable");

  await secondTab.close();
});

test("homepage preference controls write the same canonical density", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Layout").selectOption("compact");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "compact");

  const stored = await page.evaluate(() => ({
    access: JSON.parse(localStorage.getItem("prohor-access-preferences-v1") ?? "{}"),
    reading: JSON.parse(localStorage.getItem("prohor-home-reading-v1") ?? "{}"),
  }));
  expect(stored.access.layoutDensity).toBe("compact");
  expect(stored.access).not.toHaveProperty("spaciousLayout");
  expect(stored.reading).not.toHaveProperty("density");

  await dialog.getByRole("button", { name: /Done, keep exploring/ }).click();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-layout", "compact");
  await page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).first().click();
  await expect(page.locator("#home-layout")).toHaveValue("compact");
});
