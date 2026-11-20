import { expect, test } from "@playwright/test";

test("picture and video links stay collapsed inside a mobile answer", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.fulfill({ body: "Synthetic video player" }));
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const question = page.getByRole("textbox", { name: "Your question" });
  const send = page.getByRole("button", { name: "Ask Barta" });

  await question.fill("Hello");
  await send.click();
  await expect(page.getByText(/^Hello.*I.m Barta/u)).toBeVisible();
  await expect(page.getByText(/^Pictures and videos/u)).toHaveCount(0);

  await question.fill("How can I tell if my baby is getting enough breast milk?");
  await send.click();
  const summary = page.getByText("Pictures and videos (2)", { exact: true });
  const illustratedGuide = page.getByRole("link", { name: /Breastfeeding positions in pictures/ });
  await expect(summary).toBeVisible();
  await expect(illustratedGuide).toBeHidden();
  await summary.press("Enter");
  await expect(illustratedGuide).toBeVisible();
  await expect(illustratedGuide).toHaveAttribute("target", "_blank");
  await expect(illustratedGuide).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("link", { name: /Common breastfeeding questions/ })).toBeVisible();
  const preview = page.locator('iframe[title="Common breastfeeding questions"]');
  await expect(preview).toHaveCount(0);
  await page.getByRole("button", { name: "Load video from YouTube" }).press("Enter");
  await expect(preview).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/mTm9zvz5-Dc?rel=0");
  await page.getByRole("button", { name: "Close video" }).press("Enter");
  await expect(preview).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("a source picture opens on request and leaves the source link available", async ({ page }) => {
  await page.route("https://www.cdc.gov/**", (route) => route.fulfill({
    contentType: "image/gif",
    body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"),
  }));
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await page.getByRole("textbox", { name: "Your question" }).fill("When should I get help for loose or watery stools?");
  await page.getByRole("button", { name: "Ask Barta" }).click();
  await page.getByText("Pictures and videos (1)", { exact: true }).press("Enter");
  const poster = page.getByRole("img", { name: /CDC poster showing/, includeHidden: true });
  await expect(poster).toHaveCount(0);
  await page.getByRole("button", { name: "Show picture" }).press("Enter");
  await expect(poster).toHaveAttribute("src", /wash-your-hands-poster\.JPG$/u);
  await poster.scrollIntoViewIfNeeded();
  await expect.poll(() => poster.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(1);
  await expect(page.getByRole("link", { name: /Handwashing reminder poster/ })).toBeVisible();
  await page.getByRole("button", { name: "Hide picture" }).press("Enter");
  await expect(poster).toHaveCount(0);
});
