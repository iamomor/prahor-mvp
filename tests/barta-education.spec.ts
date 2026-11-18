import { expect, test } from "@playwright/test";

test("Barta preserves the cited turn and its context when switching answer language", async ({ page }) => {
  const sourceUrl = "https://example.invalid/prohor-education-test";
  const requests: unknown[] = [];
  await page.route("**/api/ai/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) {
      await route.fulfill({
        json: {
          status: "grounded",
          answer: "This is a synthetic answer for the browser test.",
          citations: [{
            sourceId: "bb3a7560-a49e-4d49-83bb-dd5897352eed",
            chunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559",
            sourceVersion: "1",
            title: "Synthetic reviewed source",
            publisher: "PROHOR tests",
            url: sourceUrl,
            locator: "Section 1",
            reviewedAt: "2026-11-16T00:00:00.000Z",
          }],
          limitations: ["Synthetic test response."],
        },
      });
      return;
    }

    await route.fulfill({
      status: 503,
      json: {
        status: "abstained",
        reason: "sources_unavailable",
        answer: null,
        citations: [],
        message: "যাচাই করা সূত্রগুলো আপাতত পাওয়া যাচ্ছে না।",
      },
    });
  });

  await page.goto("/ask");
  const language = page.getByLabel(/Answer language|উত্তরের ভাষা/);
  await language.selectOption("en");
  await page.getByRole("textbox", { name: "Your question" }).fill("Synthetic question");
  await page.getByRole("button", { name: "Ask Barta" }).click();
  const citation = page.getByRole("link", { name: "PROHOR tests" });
  await expect(citation).toHaveAttribute("href", sourceUrl);
  expect(requests[0]).toEqual({
    question: "Synthetic question",
    language: "en",
    retention: { mode: "ephemeral" },
  });

  await page.getByRole("textbox", { name: "Your question" }).fill("Keep this draft");
  await language.selectOption("bn");
  await expect(citation).toHaveCount(1);
  await expect(page.getByRole("textbox", { name: "আপনার প্রশ্ন" })).toHaveValue("Keep this draft");
  await page.getByRole("textbox", { name: "আপনার প্রশ্ন" }).fill("নমুনা প্রশ্ন");
  await page.getByRole("button", { name: "বার্তাকে জিজ্ঞেস করুন" }).click();
  const notice = page.getByText("যাচাই করা সূত্রগুলো আপাতত পাওয়া যাচ্ছে না।");
  await expect(notice).toHaveAttribute("lang", "bn");
  await expect(citation).toHaveCount(1);
  expect(requests[1]).toEqual({
    question: "নমুনা প্রশ্ন",
    language: "bn",
    previousChunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559",
    retention: { mode: "ephemeral" },
  });
});
