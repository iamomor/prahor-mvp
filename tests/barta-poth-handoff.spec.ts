import { expect, test } from "@playwright/test";

test("Barta saves a cited question for Poth only in the same tab", async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const question = "What happens at ANC visits?";
  await page.getByRole("textbox", { name: "Your question" }).fill(question);
  await page.getByRole("button", { name: "Ask Barta" }).press("Enter");
  await expect(page.getByRole("region", { name: "Reviewed sources" })).toBeVisible();

  const save = page.getByRole("button", { name: "Save question for my doctor" });
  await save.press("Enter");
  await expect(page.getByText("Question saved in this tab.")).toBeVisible();
  await save.press("Enter");
  const review = page.getByRole("link", { name: "Review saved questions in Poth" });
  await expect(review).toHaveAttribute("href", "/poth#poth-visit-questions");
  await review.press("Enter");
  await expect(page).toHaveURL(/\/poth#poth-visit-questions$/, { timeout: 30_000 });

  const saved = page.getByRole("region", { name: /Questions saved from Barta/ });
  await expect(saved.getByText(question, { exact: true })).toHaveCount(1);
  expect(await saved.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.reload();
  await expect(saved.getByText(question, { exact: true })).toBeVisible();

  const separateTab = await context.newPage();
  await separateTab.goto("/poth");
  await expect(separateTab.getByText(/No questions saved yet/)).toBeVisible();
  await separateTab.close();

  await saved.getByRole("button", { name: /Remove question 1/ }).press("Enter");
  await expect(saved.getByText(question, { exact: true })).toHaveCount(0);
  await expect(saved.getByRole("heading")).toBeFocused();
});

test("Barta offers care links without chat and in existing urgent replies", async ({ page }) => {
  await page.goto("/ask");
  const help = page.getByRole("region", { name: "Help without chat" });
  await expect(help.getByRole("link", { name: /Call 999/ })).toHaveAttribute("href", "tel:999");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await page.getByRole("textbox", { name: "Your question" }).fill("My baby hasn't moved today");
  await page.getByRole("button", { name: "Ask Barta" }).press("Enter");
  const chat = page.getByRole("region", { name: "Barta conversation" });
  await expect(chat.getByRole("link", { name: "Call 999 in Bangladesh" })).toHaveAttribute("href", "tel:999");
  await expect(chat.getByRole("button", { name: "Save question for my doctor" })).toHaveCount(0);
  await chat.getByRole("link", { name: "Find care" }).press("Enter");
  await expect(page).toHaveURL(/\/poth$/);
});
