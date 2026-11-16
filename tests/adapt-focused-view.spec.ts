import { expect, test } from "@playwright/test";

test("focused view reduces decorative UI and preserves care access across routes", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/adapt");

  const focusedSection = page.locator("section").filter({
    has: page.getByRole("heading", { name: "মনোযোগী দৃশ্য" }),
  });
  const focusedControl = focusedSection.getByRole("checkbox");
  const sectionIcon = focusedSection.locator(".mb-4 > span[aria-hidden='true']");

  await expect(sectionIcon).toBeVisible();
  await focusedControl.check();
  await expect(page.locator("html")).toHaveAttribute("data-focused", "true");
  await expect(sectionIcon).toBeHidden();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-focused", "true");
  await expect(page.locator("section").filter({
    has: page.getByRole("heading", { name: "মনোযোগী দৃশ্য" }),
  }).locator(".mb-4 > span[aria-hidden='true']")).toBeHidden();

  const primaryNav = page.getByRole("navigation", { name: "মোবাইল নেভিগেশন" });
  await expect(primaryNav).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "আমার যত্ন" })).toBeVisible();

  await page.goto("/app/shonket");
  await expect(page.locator("html")).toHaveAttribute("data-focused", "true");
  await expect(page.getByRole("heading", { name: "Emergency contacts — always available" })).toBeVisible();
  const emergencyLink = page.getByRole("link", { name: "Call 999" });
  await expect(emergencyLink).toBeVisible();
  let emergencyLinkReachedByKeyboard = false;
  for (let index = 0; index < 24 && !emergencyLinkReachedByKeyboard; index += 1) {
    await page.keyboard.press("Tab");
    emergencyLinkReachedByKeyboard = await emergencyLink.evaluate(
      element => document.activeElement === element,
    );
  }
  expect(emergencyLinkReachedByKeyboard).toBe(true);
  await expect(emergencyLink).toBeFocused();
  expect(await emergencyLink.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");

  await page.goto("/app/bondhon");
  await expect(page.locator("html")).toHaveAttribute("data-focused", "true");
  await expect(page.getByText("Consent-controlled sharing with supporters and care providers.")).toBeVisible();
  await expect(page.getByText("Consented access").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Manage access for Fatema Begum/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Request care coordination" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Adjust access" })).toBeVisible();

  await page.goto("/app/adapt");
  const returnedSection = page.locator("section").filter({
    has: page.getByRole("heading", { name: "মনোযোগী দৃশ্য" }),
  });
  await expect(returnedSection.getByRole("checkbox")).toBeChecked();
  await expect(returnedSection.locator(".mb-4 > span[aria-hidden='true']")).toBeHidden();
  await returnedSection.getByRole("checkbox").uncheck();
  await expect(returnedSection.locator(".mb-4 > span[aria-hidden='true']")).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-focused", "true");
  expect(runtimeErrors).toEqual([]);
});
