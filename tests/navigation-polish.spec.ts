import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { preferredModuleIndex } from "../src/components/marketing/roadmap-selection";

test("default module prioritizes available content, totals and stable ties", () => {
  const group = (...statuses: string[]) => ({ features: statuses.map(status => ({ status })) });
  expect(preferredModuleIndex([group("Future", "Future"), group("Limited")])).toBe(1);
  expect(preferredModuleIndex([group("Limited"), group("Working", "Future")])).toBe(1);
  expect(preferredModuleIndex([group("Future"), group("Future", "Future")])).toBe(1);
  expect(preferredModuleIndex([group("Limited"), group("Working")])).toBe(0);
});

test("full-width navbar stays flat and compact, tracks location, and exposes icon-button help", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 }); await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  const header = page.locator(".floating-nav");
  await expect(header).toHaveCSS("height", "72px"); expect((await header.boundingBox())!.width).toBe(1440);
  expect((await header.boundingBox())!.y).toBe(0);
  await expect(header).toHaveCSS("border-radius", "0px");
  const adjust = header.getByRole("button", { name: "Adjust how you use PROHOR", exact: true });
  expect((await adjust.boundingBox())!.width).toBe(44);
  await adjust.focus(); await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape"); await expect(page.getByRole("tooltip")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Read this homepage in English", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.locator("#features").evaluate(element => element.scrollIntoView({ block: "start", behavior: "instant" }));
  await expect(header).toHaveAttribute("data-shrunk", "true"); await expect(header).toHaveCSS("height", "64px");
  await expect(page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Features", exact: true })).toHaveAttribute("aria-current", "location");
  await page.setViewportSize({ width: 900, height: 900 });
  await header.locator(".home-brand").focus();
  await header.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).focus();
  await expect(page.getByRole("tooltip")).toBeVisible(); await expect(header.locator(".nav-access-label")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const card = page.locator(".upgrade-module-grid a").first(); await card.hover(); await expect(card).toHaveCSS("transform", "none");
});

test("mobile sheet traps focus, locks scrolling, switches language and restores its trigger", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  const menu = page.getByRole("button", { name: "Open navigation", exact: true });
  await menu.click(); const sheet = page.getByRole("dialog", { name: "Explore PROHOR", exact: true });
  await expect(sheet).toBeVisible(); await expect(sheet.getByRole("button", { name: "Close navigation", exact: true })).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Shift+Tab"); await expect(sheet.getByRole("button", { name: "Sign in", exact: true })).toBeFocused();
  await page.keyboard.press("Tab"); await expect(sheet.getByRole("button", { name: "Close navigation", exact: true })).toBeFocused();
  for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) for (const contrast of ["normal", "more"]) {
    await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; }, { theme, contrast });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations, `Mobile sheet in ${theme} ${contrast}`).toEqual([]);
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = "quiet-garden"; document.documentElement.dataset.contrast = "normal"; });
  await page.keyboard.press("Escape"); await expect(sheet).not.toBeVisible(); await expect(menu).toBeFocused();
  expect(await page.locator("body").evaluate(element => getComputedStyle(element).overflow)).not.toBe("hidden");
  await menu.click(); await sheet.getByRole("button", { name: "Read this homepage in Bangla", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "bn"); await expect(page.locator("#home-mobile-menu")).toBeVisible();
  await page.locator("#home-mobile-menu").getByRole("button", { name: "Read this homepage in English", exact: true }).click();
  await sheet.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Adjust how you use PROHOR", exact: true })).toBeVisible();
  await page.keyboard.press("Escape"); await expect(menu).toBeFocused();
  await menu.click(); await sheet.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Sign in to PROHOR", exact: true })).toBeVisible();
  await page.keyboard.press("Escape"); await expect(menu).toBeFocused();
});

test("module and roadmap typography, centered labels and available markers", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 }); await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  for (const selector of [".upgrade-module-grid strong", ".upgrade-showcase-phones .story-device-label > span:first-child", ".roadmap-panel h3", ".roadmap-tabs button > span[lang=en]"]) {
    const element = page.locator(selector).first(); expect(await element.evaluate(node => getComputedStyle(node).fontFamily)).toContain("Fraunces"); await expect(element).toHaveCSS("font-weight", "600");
  }
  await expect(page.locator(".upgrade-module-grid strong").first()).toHaveCSS("font-size", "20px");
  await expect(page.locator(".upgrade-provider-pills > span").first()).toHaveCSS("font-size", "14px");
  await expect(page.locator(".upgrade-provider-pills")).toHaveCSS("margin-bottom", "24px");
  await expect(page.locator(".roadmap-available-dot")).toHaveCount(1);
  await expect(page.locator("#roadmap-tab-0")).toHaveAttribute("aria-describedby", "roadmap-available-note");
  await expect(page.locator(".roadmap-filters button[aria-disabled=true]")).toHaveCount(2);
  expect(await page.locator(".upgrade-showcase-phones .story-device-label").evaluateAll(elements => elements.every(element => { const name = element.children[0].getBoundingClientRect(); const tag = element.children[1].getBoundingClientRect(); return tag.left - name.right < 10 && Math.abs(name.top + name.height / 2 - tag.top - tag.height / 2) < 1; }))).toBe(true);
});

test("200% Bangla mobile menu retains readable label widths and vertical scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 }); await page.goto("/");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.locator("#home-mobile-menu").getByRole("button", { name: "Read this homepage in Bangla", exact: true }).click();
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; document.documentElement.dataset.layout = "spacious"; document.documentElement.dataset.textSpacing = "relaxed"; });
  const heading = await page.locator("#nav-sheet-title").boundingBox();
  expect(heading!.width).toBeGreaterThan(160); expect(heading!.height).toBeLessThan(180);
  expect(await page.locator("#home-mobile-menu").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.locator("#home-mobile-menu .nav-sheet-sign-in").focus();
  const button = await page.locator("#home-mobile-menu .nav-sheet-sign-in").boundingBox();
  expect(button!.y).toBeGreaterThanOrEqual(0); expect(button!.y + button!.height).toBeLessThanOrEqual(900);
  await page.keyboard.press("Escape"); await expect(page.locator(".home-menu-button")).toBeFocused();
});
