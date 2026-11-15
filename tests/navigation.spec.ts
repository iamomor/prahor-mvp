import { test, expect } from "@playwright/test";

test("Public homepage explains the product and opens access settings", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Maternal care, designed around every mother.");
  await page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).first().click();
  await expect(page.getByRole("dialog", { name: "Adjust how you use PROHOR" })).toBeVisible();
});

test("Existing disconnected services report their actual state", async ({ request }) => {
  const answer = await request.post("/api/ai/chat", { data: { question: "What is antenatal care?" } });
  expect(answer.status()).toBe(501);
  expect((await answer.json()).status).toBe("not_connected");
  const care = await request.post("/api/care-requests", { data: { message: "Synthetic integration check", method: "text" } });
  expect(care.status()).toBe(501);
  expect((await care.json()).status).toBe("not_sent");
});
