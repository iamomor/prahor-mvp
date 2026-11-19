import { expect, test } from "@playwright/test";

test("Ask Barta uses only the previous public chunk ID to answer a follow-up", async ({ page }) => {
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const question = page.getByRole("textbox", { name: "Your question" });
  const ask = page.getByRole("button", { name: "Ask Barta" });

  await question.fill("What does ANC mean?");
  const [initialResponse] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/api/ai/chat")
      && response.request().method() === "POST", { timeout: 65_000 }),
    ask.click(),
  ]);
  expect(initialResponse.ok(), "Initial ANC chat response").toBeTruthy();
  expect(await initialResponse.json()).toMatchObject({
    status: "grounded",
    answer: expect.stringContaining("ANC stands for antenatal care."),
  });
  await expect(page.getByText("ANC stands for antenatal care.", { exact: false })).toBeVisible();
  await expect(page.getByRole("region", { name: "Keep going" }).getByRole("button", { name: "What happens at ANC visits?" })).toBeVisible();

  await question.fill("What happens there?");
  const followUpRequest = page.waitForRequest((request) => request.url().endsWith("/api/ai/chat")
    && request.method() === "POST");
  await ask.click();
  expect((await followUpRequest).postDataJSON()).toEqual({
    question: "What happens there?",
    language: "en",
    retention: { mode: "ephemeral" },
    previousChunkId: "efdc34fe-36c4-464a-8339-11ce87cc65ba",
  });
  await expect(page.getByText("Antenatal visits are a chance", { exact: false })).toBeVisible();
  await expect(page.getByText("ANC stands for antenatal care.", { exact: false })).toBeVisible();

  await question.fill("What about food? I am bleeding heavily.");
  await ask.click();
  await expect(page.getByText("seek medical care immediately", { exact: false })).toBeVisible();
  await expect(page.getByText("Table 1, recommendation A.1.1", { exact: false })).toHaveCount(0);

  await page.getByRole("button", { name: "Clear conversation" }).click();
  await expect(page.getByText("ANC stands for antenatal care.", { exact: false })).toHaveCount(0);
  await expect(question).toBeFocused();
});

test("Ask Barta offers a keyboard-selectable clarification and returns cited structured output", async ({ page }) => {
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const question = page.getByRole("textbox", { name: "Your question" });
  const ask = page.getByRole("button", { name: "Ask Barta" });
  await question.fill("Breastfeeding");
  await ask.click();
  await expect(page.getByText("What would you like to know?", { exact: false })).toBeVisible();
  await page.getByRole("region", { name: "Choose a phrase or question" }).getByRole("button", { name: "What does exclusive breastfeeding mean?" }).press("Enter");
  await expect(question).toHaveValue("What does exclusive breastfeeding mean?");
  await expect(question).toBeFocused();

  const pendingAnswer = page.waitForResponse((response) => response.url().endsWith("/api/ai/chat")
    && response.request().method() === "POST");
  await ask.click();
  const result = await (await pendingAnswer).json();
  expect(result).toMatchObject({
    status: "grounded",
    action_level: "info",
    abstained: false,
    confidence: "high",
    answer_en: expect.stringContaining("breast milk"),
  });
  expect(result.claims[0].chunk_ids).toEqual([result.citations[0].chunkId]);
  await expect(page.getByRole("link", { name: "WHO · 2024", exact: true })).toBeVisible();
});

test("mobile layout lets a follow-up fill the question without submitting it", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/ask");
  const emergencyLink = page.getByRole("link", { name: /Call 999 in Bangladesh/ });
  await expect(emergencyLink).toBeVisible();
  const rightEdge = await emergencyLink.evaluate((element) => element.getBoundingClientRect().right);
  expect(rightEdge).toBeLessThanOrEqual(360);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const question = page.getByRole("textbox", { name: "Your question" });
  const ask = page.getByRole("button", { name: "Ask Barta" });
  await question.fill("What does ANC mean?");
  await ask.click();

  const followUp = page.getByRole("region", { name: "Keep going" })
    .getByRole("button", { name: "What happens at ANC visits?" });
  await followUp.press("Enter");
  await expect(question).toHaveValue("What happens at ANC visits?");
  await expect(question).toBeFocused();
  await expect(page.getByText("Antenatal visits are a chance", { exact: false })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

  await ask.click();
  await expect(page.getByText("Antenatal visits are a chance", { exact: false })).toBeVisible();
  await expect(page.getByRole("region", { name: "Keep going" })).toHaveCount(1);
});

test("compact citations expose their full titles on request", async ({ page }) => {
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await page.getByRole("textbox", { name: "Your question" }).fill("What happens at ANC visits?");
  await page.getByRole("button", { name: "Ask Barta" }).click();

  const source = page.getByRole("region", { name: "Reviewed sources" });
  await expect(source.getByRole("link", { name: "WHO", exact: true })).toBeVisible();
  const sourceTitle = source.getByText("WHO programme manager’s handbook: maternal care interventions");
  await expect(sourceTitle).toBeHidden();
  await source.getByText("Citation details", { exact: true }).press("Enter");
  await expect(sourceTitle).toBeVisible();
});

test("Barta's symbol shortcut and emoji suggestions lead to an editable draft", async ({ page }) => {
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");

  const shortcut = page.getByRole("button", { name: "Use symbols" });
  await shortcut.press("Enter");
  await expect(shortcut).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#barta-symbol-input > summary")).toBeFocused();
  await expect(page.getByRole("button", { name: /Headache/ })).toBeVisible();

  const question = page.getByRole("textbox", { name: "Your question" });
  await question.fill("🤕");
  await page.getByRole("button", { name: "Ask Barta" }).click();
  const choices = page.getByRole("region", { name: "Choose a phrase or question" });
  let submissions = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/ai/chat") && request.method() === "POST") submissions++;
  });
  await choices.getByRole("button", { name: "I have a headache." }).press("Enter");
  await expect(question).toHaveValue("I have a headache.");
  await expect(question).toBeFocused();
  expect(submissions).toBe(0);
});
