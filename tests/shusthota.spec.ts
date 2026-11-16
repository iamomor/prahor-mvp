import { test, expect } from "@playwright/test";

test("Shusthota renders its optional check-in with keyboard-accessible fields", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/app/shusthota");
  await expect(page.getByRole("heading", { name: "Wellness & Well-being" })).toBeVisible();
  await page.getByLabel("Mood").selectOption("tired");
  await page.getByLabel("Hours of sleep").fill("7");
  await page.getByLabel("Private diary entry for today").fill("A private synthetic note.");
  await expect(page.getByRole("button", { name: "Save check-in (feature coming soon)" })).toBeDisabled();
  await expect(page.getByText("This entry is stored only on your device. It is not shared with anyone.")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
