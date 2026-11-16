import { expect, test } from "@playwright/test";

test("language preference localizes supported UI and accurately labels English fallback", async ({ page }) => {
  await page.goto("/app/adapt", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");

  await page.locator('input[name="prohor-theme"][value="original-rose"]').check();
  await page.locator('input[type="radio"][value="more"]').check();
  await page.locator('input[name="prohor-text-scale"][value="large"]').check();
  await page.locator('input[name="prohor-layout"][value="spacious"]').check();

  await page.locator('input[name="prohor-language"][value="en"]').check();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Adjust how you use PROHOR");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "original-rose");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.locator("html")).toHaveAttribute("data-text-scale", "large");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "spacious");

  await page.locator('input[name="prohor-language"][value="bn"]').check();
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("প্রহর ব্যবহারের ধরন বদলান");
  await expect(page.getByRole("navigation", { name: "প্রধান নেভিগেশন" }).getByRole("link", { name: "আমার যত্ন" })).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "original-rose");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.locator("html")).toHaveAttribute("data-text-scale", "large");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "spacious");

  await page.goto("/ask", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await expect(page.locator("main")).toHaveAttribute("lang", "en");
  await expect(page.getByText("এই পাতার কিছু লেখা এখনো ইংরেজিতে আছে।", { exact: true })).toBeVisible();
  expect(await page.locator("main").getByRole("heading", { level: 1 }).evaluate(el => el.closest("[lang]")?.getAttribute("lang"))).toBe("en");

  await page.goto("/app/adapt", { waitUntil: "networkidle" });
  await page.locator('input[name="prohor-language"][value="en"]').check();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Adjust how you use PROHOR");
  await expect(page.getByRole("navigation", { name: "In-App Primary" }).getByRole("link", { name: "My care" })).toBeVisible();
});
