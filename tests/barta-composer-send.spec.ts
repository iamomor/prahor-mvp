import { expect, test } from "@playwright/test";

test("the question box has one reachable send button and keeps multiline drafts", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const question = page.getByRole("textbox", { name: "Your question" });
  const box = question.locator("..");
  const send = box.getByRole("button", { name: "Ask Barta" });

  await expect(question.locator("xpath=ancestor::form").locator("button[type='submit']")).toHaveCount(1);
  await expect(send).toBeDisabled();
  await question.fill("What does ANC mean?");
  await question.press("Enter");
  await expect(question).toHaveValue("What does ANC mean?\n");
  await expect(send).toBeEnabled();
  await expect(send).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  const [request] = await Promise.all([
    page.waitForRequest((request) => request.url().endsWith("/api/ai/chat") && request.method() === "POST"),
    send.press("Enter"),
  ]);
  expect(request.postDataJSON().question).toBe("What does ANC mean?");
  await expect(page.getByText("ANC stands for antenatal care.", { exact: false })).toBeVisible();
});
