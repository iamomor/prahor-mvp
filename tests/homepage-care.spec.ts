import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Adapt works by keyboard without changing the page or losing a draft", async ({ page }) => {
  await page.goto("/");
  const draft = page.locator("#visit-question-touch");
  await draft.fill("Synthetic appointment question");
  const preview = page.locator(".care-adapt-preview");
  const sample = preview.locator(".care-text-sample");
  const before = await sample.evaluate(element => parseFloat(getComputedStyle(element).fontSize));
  await preview.getByRole("button", { name: "A++ sample text size", exact: true }).focus();
  await page.keyboard.press("Enter");
  expect(await sample.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBe(before * 1.25);
  await preview.getByRole("button", { name: "Original Rose", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(preview).toHaveAttribute("data-theme", "original-rose");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "quiet-garden");
  await preview.getByRole("switch", { name: "Higher contrast", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(preview).toHaveAttribute("data-contrast", "more");
  await expect(page.locator("html")).not.toHaveAttribute("data-contrast", "more");
  await preview.getByRole("button", { name: "I have a question", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(preview.getByRole("button", { name: "I have a question", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(preview.getByRole("status")).toContainText("Nothing was sent");
  await expect(draft).toHaveValue("Synthetic appointment question");
  await expect(preview.getByRole("button", { name: "I have a question", exact: true })).toBeFocused();
});

test("default typography, four alternate tag roles and equal bento heights", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".care-card")).toHaveCount(4);
  await expect(page.locator(".care-support-steps > li")).toHaveCount(4);
  const metrics = await page.evaluate(() => ({
    heights: [...document.querySelectorAll(".care-card")].map(element => element.getBoundingClientRect().height),
    titles: [...document.querySelectorAll(".care-card h3,.care-support-steps h3")].map(element => ({ font: getComputedStyle(element).fontFamily, weight: getComputedStyle(element).fontWeight })),
    tags: [...document.querySelectorAll(".care-module-tag,.care-screen-tag .story-sample")].map(element => getComputedStyle(element).fontFamily),
    small: [...document.querySelectorAll(".care-companion *,.care-support *")].filter(element => [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())).filter(element => element.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(element).fontSize) < 12.5).map(element => element.className),
    headingLines: document.querySelector("#support-title")!.getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector("#support-title")!).lineHeight),
  }));
  expect(Math.max(...metrics.heights) - Math.min(...metrics.heights)).toBeLessThan(1);
  expect(metrics.titles.every(title => title.font.includes("Fraunces") && title.weight === "600")).toBe(true);
  expect(metrics.tags.every(font => font.includes("JetBrains Mono"))).toBe(true);
  expect(metrics.small).toEqual([]);
  expect(metrics.headingLines).toBeLessThanOrEqual(2.01);
  for (const preset of ["rubik", "google-sans", "noto-serif", "roboto-slab"]) {
    await page.evaluate(value => { document.documentElement.dataset.font = value; }, preset);
    expect(await page.locator(".care-module-tag").first().evaluate(element => getComputedStyle(element).fontFamily)).not.toContain("JetBrains");
  }
});

test("read-aloud fallback is announced and preview actions cannot send or call", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/") && !["GET", "HEAD"].includes(request.method())) calls.push(request.url()); });
  await page.addInitScript(() => { Object.defineProperty(window, "speechSynthesis", { value: undefined, configurable: true }); });
  await page.goto("/");
  await page.locator(".care-read-button").click();
  await expect(page.locator(".care-speech-status")).toContainText("unavailable");
  for (const selector of [".care-card-barta", ".care-card-shonket", ".care-card-bondhon"]) {
    await expect(page.locator(selector).getByRole("img")).toHaveAccessibleName(/Sample data/);
    await expect(page.locator(`${selector} .care-static-screen`)).toHaveAttribute("inert", "");
  }
  await expect(page.locator('.care-request-steps [data-complete="true"]')).toHaveCount(1);
  await expect(page.locator('.care-request-steps [data-complete="false"]')).toHaveCount(3);
  expect(calls).toEqual([]);
});

test("all themes, contrast combinations, local previews and Bangla reflow pass scoped axe", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  const scan = async () => (await new AxeBuilder({ page }).include(".care-companion").include(".care-support").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations;
  for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) for (const contrast of ["normal", "more"]) {
    await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; }, { theme, contrast });
    expect(await scan(), `${theme}, ${contrast}`).toEqual([]);
  }
  for (const name of ["Original Rose", "Morning Mist", "Quiet Garden"]) {
    await page.locator(".care-adapt-preview").getByRole("button", { name, exact: true }).click();
    expect(await scan(), `local ${name}`).toEqual([]);
  }
  await page.locator("footer").getByRole("button", { name: "Switch homepage language to Bangla", exact: true }).click();
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; document.documentElement.dataset.textSpacing = "relaxed"; document.documentElement.dataset.layout = "spacious"; });
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.locator(".care-companion,.care-support").evaluateAll(elements => elements.map(element => ({ width: element.clientWidth, scroll: element.scrollWidth })).filter(size => size.scroll > size.width + 1)), `${width}px`).toEqual([]);
  }
  expect(await scan()).toEqual([]);
});

test("support reveals once; reduced motion and forced colors stay visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const panel = page.locator(".care-support-panel");
  await expect(panel).toHaveAttribute("data-reveal", "ready");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveAttribute("data-reveal", "visible");
  await expect(page.locator(".care-connector path")).toHaveCSS("animation-duration", "1.2s");
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.reload();
  await panel.scrollIntoViewIfNeeded();
  for (const step of await page.locator(".care-support-steps > li").all()) { await expect(step).toHaveCSS("opacity", "1"); await expect(step).toHaveCSS("transform", "none"); }
  await expect(page.locator(".care-connector path")).toHaveCSS("stroke-dashoffset", "0px");
});
