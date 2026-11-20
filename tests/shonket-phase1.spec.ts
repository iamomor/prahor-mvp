import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ _schemaVersion: 3, language: "en" })));
});

const topics = [
  ["pregnancy", "Which symptoms in pregnancy need urgent help?"],
  ["labour-and-childbirth", "How do I prepare a birth plan?"],
  ["postpartum", "When are check-ups needed after childbirth?"],
  ["perinatal-mental-health", "Can I talk about emotional well-being at a pregnancy visit?"],
] as const;

test("warning topics expose direct emergency, human and editable Barta actions", async ({ page }) => {
  test.setTimeout(90_000);
  for (const [slug, question] of topics) {
    await page.goto(`/safety/information/${slug}`);
    await expect(page.getByRole("heading", { name: "If something feels wrong right now" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Call 999 now" })).toHaveAttribute("href", "tel:999");
    await expect(page.getByRole("link", { name: "Ask a person for help" })).toHaveAttribute("href", "/app/care/new");
    await expect(page.getByRole("link", { name: "Read about this in Barta" })).toHaveAttribute("href", `/ask?q=${encodeURIComponent(question)}`);
    await expect(page.getByText("Clinician-reviewed information is not available yet.")).toBeVisible();
  }
});

test("unknown warning topic is not found", async ({ page }) => {
  const response = await page.goto("/safety/information/unknown-topic");
  expect(response?.status()).toBe(404);
});

test("warning topic list keeps the immediate-help notice visible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/safety/information");
  await expect(page.getByLabel("Emergency help")).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 999" })).toHaveAttribute("href", "tel:999");
  await expect(page.getByRole("link", { name: "Ask a person for help" })).toHaveAttribute("href", "/app/care/new");
});

test("Shonket pages render in Bangla and reflow at required widths", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ _schemaVersion: 3, language: "bn" })));
  const widths = [320, 360, 375, 390, 414, 768, 1024, 1440];
  const paths = [
    ["/safety", "আপনার সুবিধামতো সহায়তা।"],
    ["/safety/information", "বিষয় অনুযায়ী দেখুন"],
    ["/safety/information/pregnancy", "গর্ভাবস্থা"],
    ["/safety/information/labour-and-childbirth", "প্রসব ও সন্তান জন্ম"],
    ["/safety/information/postpartum", "প্রসবের পর"],
    ["/safety/information/perinatal-mental-health", "গর্ভকাল ও প্রসব-পরবর্তী মানসিক সুস্থতা"],
  ] as const;
  for (const [path, title] of paths) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} at ${width}px`).toBeLessThanOrEqual(width);
    }
  }
});

test("public Barta prefills q without requesting an answer", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/ai/chat", async (route) => { requestCount += 1; await route.abort(); });
  const question = "Which symptoms in pregnancy need urgent help? & <safe>";
  await page.goto(`/ask?q=${encodeURIComponent(question)}`);
  const input = page.locator("#barta-question");
  await expect(input).toHaveValue(question);
  await expect(page.locator("form button[type='submit']")).toBeVisible();
  expect(requestCount).toBe(0);
  await input.fill("");
  await expect(input).toHaveValue("");
  expect(requestCount).toBe(0);
});
