import { expect, test } from "@playwright/test";

test("a source outage preserves the question for retry instead of adding a failed turn", async ({ page }) => {
  await page.route("**/api/ai/chat", route => route.fulfill({ status: 503, json: {
    status: "abstained", answer: null, citations: [], reason: "sources_unavailable",
    message: "Synthetic source outage. Please retry.",
  } }));
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const draft = page.locator("#barta-question");
  await draft.fill("What does ANC mean?");
  await page.getByRole("button", { name: "Ask Barta", exact: true }).click();
  await expect(page.getByRole("region", { name: "Barta conversation" }).getByRole("alert"))
    .toHaveText("Synthetic source outage. Please retry.");
  await expect(draft).toHaveValue("What does ANC mean?");
  await expect(draft).toBeEditable();
  await expect(page.getByText("You", { exact: true })).toHaveCount(0);
});

test("leaving Barta cancels its pending chat request", async ({ page }) => {
  await page.route("**/api/ai/chat", () => {});
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await page.locator("#barta-question").fill("What does ANC mean?");
  const sent = page.waitForRequest(request => request.url().endsWith("/api/ai/chat"));
  await page.getByRole("button", { name: "Ask Barta", exact: true }).click();
  await sent;
  let cancelled = false;
  page.on("requestfailed", request => { if (request.url().endsWith("/api/ai/chat")) cancelled = true; });
  await page.locator('header a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => cancelled).toBe(true);
});
