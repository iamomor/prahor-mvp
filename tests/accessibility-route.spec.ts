import { expect, test } from "@playwright/test";

test("accessibility page renders and validates its local demo form", async ({ page }) => {
  const runtimeErrors: string[] = [];
  const apiRequests: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("request", request => {
    if (request.url().includes("/api/")) apiRequests.push(request.url());
  });

  const response = await page.goto("/accessibility", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("PROHOR adapts to you");

  const demoForm = page.getByRole("form", {
    name: "Accessible form example — demo only, no data is submitted",
  });
  const week = demoForm.getByLabel(/Week of pregnancy/);

  await demoForm.getByRole("button", { name: /Save/ }).click();
  await expect(demoForm.getByRole("alert")).toHaveText("Please enter a number between 1 and 42");
  await expect(week).toBeFocused();
  await expect(week).toHaveAttribute("aria-invalid", "true");

  await week.fill("24");
  await demoForm.getByRole("button", { name: /Save/ }).click();
  await expect(demoForm.getByRole("status")).toHaveText(
    "Example is valid. No data was saved or submitted.",
  );
  expect(apiRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test("accessibility page preference panel applies settings immediately", async ({ page }) => {
  await page.goto("/accessibility", { waitUntil: "networkidle" });

  await page.locator('input[type="radio"][value="original-rose"]').check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "original-rose");

  await page.locator('input[type="radio"][value="more"]').check();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");

  await page.locator('input[type="radio"][value="large"]')
    .locator("xpath=ancestor::label[1]")
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-text-scale", "large");
});
