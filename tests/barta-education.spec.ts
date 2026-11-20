import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ _schemaVersion: 3, language: "en" })));
});

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
  expect(await notice.evaluate(element => element.closest("[lang]")?.getAttribute("lang"))).toBe("bn");
  await expect(citation).toHaveCount(1);
  expect(requests[1]).toEqual({
    question: "নমুনা প্রশ্ন",
    language: "bn",
    previousChunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559",
    retention: { mode: "ephemeral" },
  });
});

test("Shonket topic handoffs prefill an editable Barta question without submitting private context", async ({ page }) => {
  test.setTimeout(90_000);
  const topics = [
    ["pregnancy", "Which symptoms in pregnancy need urgent help?"],
    ["labour-and-childbirth", "How do I prepare a birth plan?"],
    ["postpartum", "When are check-ups needed after childbirth?"],
    ["perinatal-mental-health", "Can I talk about emotional well-being at a pregnancy visit?"],
  ] as const;
  const requests: unknown[] = [];
  for (const [slug, questionText] of topics) {
    const requestCount = requests.length;
    await page.goto(`/safety/information/${slug}`);
    const handoff = page.getByRole("link", { name: "Read about this in Barta" });
    await expect(handoff).toHaveAttribute("href", `/ask?q=${encodeURIComponent(questionText)}`);
    await handoff.click();
    await page.waitForURL(url => url.pathname === "/ask" && url.searchParams.get("q") === questionText);
    const question = page.locator("#barta-question");
    await expect(question).toHaveValue(questionText);
    expect(requests).toHaveLength(requestCount);
    await question.fill("");
    await expect(question).toHaveValue("");
    await question.fill(`${questionText} edited`);
    await page.route("**/api/ai/chat", async route => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ json: {
        status: "grounded", answer: "Synthetic cited education answer.",
        citations: [{ sourceId: "bb3a7560-a49e-4d49-83bb-dd5897352eed", chunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559", sourceVersion: "1", title: "Synthetic reviewed source", publisher: "PROHOR tests", url: "https://example.invalid/source", locator: "Section 1", reviewedAt: "2026-11-16T00:00:00.000Z" }],
        limitations: ["Synthetic educational limitation."],
      } });
    });
    await question.locator("xpath=ancestor::form").locator('button[type="submit"]').click();
    await expect(page.getByText("Synthetic cited education answer.")).toBeVisible();
    await expect(page.getByRole("link", { name: "PROHOR tests" })).toHaveAttribute("href", "https://example.invalid/source");
    expect(requests.at(-1)).toEqual({ question: `${questionText} edited`, language: "en", retention: { mode: "ephemeral" } });
    expect(JSON.stringify(requests.at(-1))).not.toMatch(/diary|wellness|care request|pregnancy record/i);
    await page.unrouteAll({ behavior: "ignoreErrors" });
  }
});

test("offline Shonket keeps 999 available and Barta stays visibly unavailable without a false answer", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "onLine", { configurable: true, value: false }));
  await page.goto("/safety/information/pregnancy");
  await expect(page.getByText("Barta and care requests need an internet connection", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 999 now" })).toHaveAttribute("href", "tel:999");
  await page.getByRole("link", { name: "Read about this in Barta" }).click();
  await expect(page.getByText("Barta needs an internet connection and is unavailable offline", { exact: false })).toBeVisible();
  const question = page.locator("#barta-question");
  await expect(question).toHaveValue("Which symptoms in pregnancy need urgent help?");
  let requestCount = 0;
  await page.route("**/api/ai/chat", async route => { requestCount += 1; await route.abort("failed"); });
  expect(requestCount).toBe(0);
  await question.locator("xpath=ancestor::form").locator('button[type="submit"]').click();
  await expect(page.locator('[role="alert"]').filter({ hasText: "Barta could not load a response" })).toBeVisible();
  await expect(question).toHaveValue("Which symptoms in pregnancy need urgent help?");
  expect(requestCount).toBe(1);
  await expect(page.getByText("Synthetic cited education answer.")).toHaveCount(0);
});
