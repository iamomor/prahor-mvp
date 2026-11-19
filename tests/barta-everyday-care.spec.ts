import { expect, test } from "@playwright/test";

test("Auto changes the reply language per typed turn and stays by the composer", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/ask");
  const composer = page.locator("form").filter({ has: page.locator("#barta-question") });
  const language = composer.getByLabel(/Answer language|উত্তরের ভাষা/);
  await expect(language).toHaveValue("auto");
  const draft = composer.locator("#barta-question");
  const submit = composer.getByRole("button", { name: /Ask Barta|বার্তাকে জিজ্ঞেস করুন/ });
  const send = async (text: string) => {
    await draft.fill(text);
    const pending = page.waitForRequest((request) => request.url().endsWith("/api/ai/chat") && request.method() === "POST");
    await submit.click();
    return (await pending).postDataJSON();
  };

  expect(await send("tumi kmn aso")).toMatchObject({ language: "bn" });
  await expect(page.getByText("জিজ্ঞেস করার জন্য ধন্যবাদ।", { exact: false })).toBeVisible();
  expect(await send("What does exclusive breastfeeding mean?")).toMatchObject({ language: "en" });
  await expect(page.getByText("Exclusive breastfeeding means", { exact: false })).toBeVisible();
  await expect(page.getByText("tumi kmn aso", { exact: true })).toBeVisible();
  await expect(language).toHaveValue("auto");

  expect(await send("amar baby kemne manage korbo")).toMatchObject({ language: "bn" });
  await expect(page.getByText("বাচ্চার বয়স কত?", { exact: false })).toBeVisible();
  await page.getByRole("region", { name: "একটি বাক্য বা প্রশ্ন বেছে নিন" })
    .getByRole("button", { name: "শিশুর নিরাপদ ঘুমের জায়গা কীভাবে তৈরি করব?" }).press("Enter");
  await expect(draft).toHaveValue("শিশুর নিরাপদ ঘুমের জায়গা কীভাবে তৈরি করব?");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});
