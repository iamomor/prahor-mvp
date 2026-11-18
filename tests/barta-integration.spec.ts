import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage opens public Barta; keyboard settings and help preserve the conversation", async ({ page }) => {
  await page.goto("/");
  await page.locator(".story-hero").getByRole("link", { name: "Ask Barta", exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/ask$/);
  await expect(page.getByText("Educational prototype", { exact: false }).first()).toBeVisible();
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const draft = page.locator("#barta-question");
  await draft.fill("What does ANC mean?");
  await page.getByRole("button", { name: "Ask Barta", exact: true }).press("Enter");
  const answer = page.getByText("ANC stands for antenatal care.", { exact: false });
  await expect(answer).toBeVisible();
  await draft.fill("Keep my unfinished question");
  const adjust = page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true });
  await adjust.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Adjust how you use PROHOR" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("radio", { name: "Original Rose", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "original-rose");
  await page.keyboard.press("Escape");
  await expect(adjust).toBeFocused();
  await expect(draft).toHaveValue("Keep my unfinished question");
  await expect(answer).toBeVisible();
  await page.getByRole("link", { name: "Help without chat", exact: true }).press("Enter");
  await expect(page.locator("#barta-help")).toBeInViewport();
  await expect(draft).toHaveValue("Keep my unfinished question");
});

test("Barta reflows and remains discoverable with saved appearance and access combinations", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/ask");
  for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) {
    for (const highContrast of [false, true]) {
      await page.evaluate(({ theme, highContrast }) => localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({
        _schemaVersion: 3, theme, highContrast, textScale: "extra-large", spaciousLayout: true, reducedMotion: true, language: "en",
      })), { theme, highContrast });
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("html")).toHaveAttribute("data-contrast", highContrast ? "more" : "standard");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(result.violations).toEqual([]);
    }
  }
});

test("public chat contract matches the handler and rejects oversized requests", async ({ request }) => {
  const { currentApiContracts } = await import("../src/lib/contracts/current-api");
  const response = await request.post("/api/ai/chat", { data: {
    question: "What does ANC mean?", language: "en", retention: { mode: "ephemeral" },
  } });
  expect(response.status()).toBe(200);
  expect(currentApiContracts["POST /api/ai/chat"].responses[200].safeParse(await response.json()).success).toBe(true);
  const tooLarge = await request.post("/api/ai/chat", { data: { question: "x".repeat(9000) } });
  expect(tooLarge.status()).toBe(400);
  expect(tooLarge.headers()["cache-control"]).toBe("no-store");
});
