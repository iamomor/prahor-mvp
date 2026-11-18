import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440];
const themes = ["quiet-garden", "original-rose", "morning-mist"];
const openPreferences = async (page: Page) => { await page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).first().click(); return page.getByRole("dialog"); };

async function darkHeadingContrast(page: Page) {
  return page.evaluate(() => {
    const context = document.createElement("canvas").getContext("2d")!;
    const rgb = (color: string) => { context.clearRect(0,0,1,1); context.fillStyle = color; context.fillRect(0,0,1,1); return Array.from(context.getImageData(0,0,1,1).data).slice(0,3); };
    const luminance = (color: number[]) => { const values = color.map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4); return values[0] * .2126 + values[1] * .7152 + values[2] * .0722; };
    const ratio = (a: number[], b: number[]) => { const x = luminance(a), y = luminance(b); return (Math.max(x,y) + .05) / (Math.min(x,y) + .05); };
    const tokens = getComputedStyle(document.documentElement);
    const background = rgb(tokens.getPropertyValue("--pro-primary"));
    const accent = rgb(tokens.getPropertyValue("--pro-accent"));
    const circleBackground = background.map((value,index) => value * .87 + accent[index] * .13);
    return [ratio(rgb(getComputedStyle(document.querySelector(".story-adapt h2 em")!).color), background), ratio(rgb(getComputedStyle(document.querySelector(".upgrade-support-panel h2 em")!).color), background), ratio(rgb(getComputedStyle(document.querySelector(".upgrade-final-card h2 em")!).color), circleBackground)];
  });
}

test("exact product counts, seven phones, eight modules and all 24 capabilities", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "quiet-garden");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Maternal care, designed around every mother.");
  await expect(page.locator("main > section")).toHaveCount(12);
  await expect(page.locator(".upgrade-product-number")).toHaveText(["8", "24", "0", "2"]);
  await expect(page.locator(".care-bento > article")).toHaveCount(4);
  await expect(page.locator(".upgrade-module-grid > a")).toHaveCount(8);
  await expect(page.locator(".story-phone")).toHaveCount(7);
  await expect(page.locator(".story-device .story-sample")).toHaveCount(7);
  await expect(page.locator(".story-module-row")).toHaveCount(0);
  await expect(page.locator(".upgrade-team-grid > article")).toHaveCount(5);
  await expect(page.locator(".upgrade-maternal-facts > p")).toHaveCount(2);
  await expect(page.getByText("Image placeholder", { exact: true })).toHaveCount(0);
  expect(await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute("href")!).filter(href => !document.getElementById(href.slice(1))))).toEqual([]);
  await expect(page.locator("#roadmap details")).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Adapt 1", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Adapt 1", exact: true })).toBeVisible();
  expect((await page.locator(".story-capability-number").allTextContents()).map(Number).sort((a,b) => a-b)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  await expect(page.locator(".roadmap-panel .story-status-limited")).toHaveCount(1);
  await expect(page.locator(".roadmap-panel .story-status-future")).toHaveCount(23);
  expect(await page.locator(".story-status").evaluateAll(elements => elements.every(element => element.closest("#roadmap")))).toBe(true);
  const signIn = page.getByRole("button", { name: "Sign in", exact: true }).first();
  await signIn.click(); await expect(page.getByRole("dialog", { name: "Sign in to PROHOR" })).toBeVisible();
  await page.keyboard.press("Escape"); await expect(signIn).toBeFocused();
});

test("roadmap totals, filters, shared mapping and ARIA keyboard tabs", async ({ page }) => {
  await page.goto("/");
  const filters = page.getByRole("group", { name: "Filter capabilities by status" });
  await expect(filters.locator("button")).toHaveText(["All24", "Working0", "Limited1", "Simulated0", "Future23"]);
  await expect(filters.getByRole("button", { name: "Working 0", exact: true })).toHaveAttribute("aria-disabled", "true");
  await expect(filters.getByRole("button", { name: "Simulated 0", exact: true })).toHaveAttribute("aria-disabled", "true");
  await filters.getByRole("button", { name: "Working 0", exact: true }).focus(); await page.keyboard.press("Enter");
  await expect(filters.getByRole("button", { name: "All 24", exact: true })).toHaveAttribute("aria-pressed", "true");
  await filters.getByRole("button", { name: "Future 23", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Bondhon 7", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(7);
  const adapt = page.getByRole("tab", { name: "Adapt 1", exact: true });
  await adapt.focus(); await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: "Barta 3", exact: true })).toBeFocused();
  await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(3);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tabpanel").locator(".roadmap-panel-heading strong")).toHaveText("Shonket + Bondhon");
  await expect(page.getByRole("tabpanel").locator(".story-capability-number")).toHaveText(["04", "23"]);
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Bondhon 7", exact: true })).toBeFocused();
  await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(7);
  await filters.getByRole("button", { name: "Limited 1", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Adapt 1", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Bondhon 7", exact: true }).click();
  await expect(filters.getByRole("button", { name: "All 24", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  await page.getByRole("tab", { name: "Bondhon 7", exact: true }).focus(); await page.keyboard.press("Home"); await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Barta 3", exact: true })).toBeFocused();
  await page.keyboard.press("Tab"); await expect(page.getByRole("tabpanel")).toBeFocused();
});

test("refined lines, compact cards, matching phones and footer navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 }); await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  const before = await page.locator(".story-problem-copy").boundingBox(); const visual = await page.locator(".story-problem-visual").boundingBox(); expect(before!.x).toBeLessThan(visual!.x);
  await expect(page.locator(".section-eyebrow")).toHaveCount(11);
  await expect(page.locator(".section-eyebrow-line[aria-hidden=true]")).toHaveCount(11);
  await expect(page.locator(".upgrade-product-strip")).toHaveCSS("border-top-width", "1px");
  await expect(page.locator(".upgrade-product-strip")).toHaveCSS("border-bottom-width", "1px");
  await expect(page.locator(".upgrade-product-grid > div").nth(1)).toHaveCSS("border-left-width", "1px");
  for (const selector of [".story-visit-phones", ".upgrade-showcase-phones"]) {
    const boxes = await page.locator(`${selector} .story-phone`).evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { width: box.width, height: box.height, top: box.top }; }));
    expect(Math.max(...boxes.map(box => box.width))).toBeLessThanOrEqual(261); expect(Math.max(...boxes.map(box => box.height))-Math.min(...boxes.map(box => box.height))).toBeLessThan(1); expect(Math.max(...boxes.map(box => box.top))-Math.min(...boxes.map(box => box.top))).toBeLessThan(1);
    expect(Math.abs(boxes[0].height / boxes[0].width - 19 / 9)).toBeLessThan(.01);
  }
  const cards = await page.locator(".care-bento > article").evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height)); expect(Math.max(...cards) - Math.min(...cards)).toBeLessThan(1);
  expect(await page.locator('.care-bento [lang="bn"]').evaluateAll(elements => elements.every(element => getComputedStyle(element).fontFamily.includes("Noto Sans Bengali")))).toBe(true);
  await expect(page.locator("footer nav")).toHaveCount(3); await expect(page.locator(".refined-footer-modules a")).toHaveCount(8);
  await page.locator("footer").getByRole("button", { name: "Switch homepage language to Bangla", exact: true }).click(); await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".upgrade-product-grid > div").nth(1)).toHaveCSS("border-top-width", "1px");
  await expect(page.locator(".upgrade-product-grid > div").nth(1)).toHaveCSS("border-left-width", "0px");
  const positions = await page.locator(".story-problem-grid > div").evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top)); expect(positions[0]).toBeLessThan(positions[1]);
  for (const selector of [".story-visit-phones", ".upgrade-showcase-phones"]) expect(await page.locator(selector).evaluate(element => element.scrollWidth > element.clientWidth && getComputedStyle(element).scrollSnapType === "x mandatory")).toBe(true);
});

test("Default has real Fraunces italic and three desktop lines; other presets keep their roles", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 }); await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  const heading = page.locator("h1");
  await openPreferences(page); await page.keyboard.press("Escape");
  expect(await heading.evaluate(element => getComputedStyle(element).fontFamily)).toContain("Fraunces");
  await expect(heading.locator("em")).toHaveCSS("font-style", "italic");
  const size = await heading.evaluate(element => ({ height: element.getBoundingClientRect().height, line: parseFloat(getComputedStyle(element).lineHeight), scroll: element.scrollWidth, width: element.clientWidth }));
  expect(Math.abs(size.height - size.line * 3)).toBeLessThan(2); expect(size.scroll).toBeLessThanOrEqual(size.width + 1);
  expect(await page.locator(".story-hero-description").evaluate(element => getComputedStyle(element).fontFamily)).toContain("Manrope");
  for (const font of ["rubik", "google-sans", "noto-serif", "roboto-slab"]) { await page.evaluate(value => { document.documentElement.dataset.font = value; }, font); expect(await heading.evaluate(element => getComputedStyle(element).fontFamily)).not.toContain("Fraunces"); }
  await page.evaluate(() => { document.documentElement.dataset.font = "default"; });
  await page.getByRole("button", { name: "Read this homepage in Bangla" }).click();
  await expect(heading.locator("em")).toHaveCSS("font-style", "normal");
  expect(await heading.evaluate(element => getComputedStyle(element).fontFamily)).toContain("Noto Sans Bengali");
});

test("keyboard completes the question and restores visible modal focus", async ({ page }) => {
  await page.goto("/"); await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page.locator("main")).toBeFocused();
  for (let step = 0; step < 25 && !(await page.locator("#visit-question-touch").evaluate(el => el === document.activeElement)); step++) await page.keyboard.press("Tab");
  await expect(page.locator("#visit-question-touch")).toBeFocused();
  await page.keyboard.press("Control+A"); await page.keyboard.type("A synthetic visit question"); await page.keyboard.press("Tab"); await page.keyboard.press("Enter");
  await expect(page.locator(".story-question-review")).toHaveCount(3);
  await expect(page.getByRole("status").filter({ hasText: "Nothing was sent" })).toBeVisible();
  const trigger = page.locator(".story-adapt-bottom button"); await trigger.focus(); await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog"); await expect(dialog).toBeVisible(); await expect(dialog.getByRole("button", { name: "Close preferences" })).toBeFocused();
  await page.keyboard.press("Shift+Tab"); expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  await page.keyboard.press("Escape"); await expect(trigger).toBeFocused(); expect(await trigger.evaluate(el => getComputedStyle(el).outlineStyle)).toBe("solid");
});

test("complete phrases never duplicate and drafts survive live controls, language and preferences", async ({ page }) => {
  const calls: string[] = []; page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); }); await page.goto("/");
  const input = page.locator("#visit-question-touch"); const original = await input.inputValue();
  await page.getByRole("button", { name: "About my visit", exact: true }).click(); await page.getByRole("button", { name: "About my visit", exact: true }).click();
  await expect(input).toHaveValue(original); await expect(page.locator(".story-question-gloss")).toHaveText(Array(3).fill("How can I prepare for my next visit?"));
  await input.fill("Synthetic visit question");
  await page.locator("#module-adapt").getByRole("button", { name: "Original Rose", exact: true }).click();
  await page.locator("#module-adapt").getByRole("switch", { name: "Higher contrast", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "quiet-garden"); await expect(page.locator("html")).not.toHaveAttribute("data-contrast", "more");
  await page.reload(); await expect(page.locator("html")).toHaveAttribute("lang", "en"); await expect(page.locator("#visit-question-touch")).toHaveAttribute("aria-busy", "false");
  await input.fill("Synthetic visit question");
  const dialog = await openPreferences(page);
  await dialog.getByRole("radio", { name: "Original Rose", exact: true }).check();
  await dialog.locator('input[type="radio"][value="more"]').check();
  await dialog.getByLabel("Text size", { exact: true }).selectOption("extra-large");
  await dialog.getByLabel("Typeface", { exact: true }).selectOption("rubik");
  await dialog.getByLabel("Layout", { exact: true }).selectOption("spacious");
  await dialog.getByLabel("Relaxed text spacing", { exact: true }).check();
  await dialog.getByLabel("Reduce motion", { exact: true }).check();
  await dialog.getByRole("button", { name: "Done, keep exploring" }).click();
  await page.getByRole("button", { name: "Read this homepage in Bangla" }).click(); await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  for (const id of ["touch", "larger", "picture"]) await expect(page.locator(`#visit-question-${id}`)).toHaveValue("Synthetic visit question"); expect(calls).toEqual([]);
  await page.reload(); for (const [attribute, value] of [["data-theme", "original-rose"], ["data-contrast", "more"], ["data-font", "rubik"], ["data-layout", "spacious"], ["lang", "bn"]]) await expect(page.locator("html")).toHaveAttribute(attribute, value); await expect(input).toHaveValue(original);
});

test("practice inputs become editable only after their shared state initializes", async ({ browser, page, baseURL }) => {
  const noScript = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const staticPage = await noScript.newPage();
    await staticPage.goto("/");
    await expect(staticPage.locator("#visit-question-touch")).toHaveAttribute("readonly", "");
    await expect(staticPage.locator("#visit-question-touch")).toHaveAttribute("aria-busy", "true");
  } finally {
    await noScript.close();
  }
  await page.goto("/");
  for (const id of ["touch", "larger", "picture"]) {
    await expect(page.locator(`#visit-question-${id}`)).toBeEditable();
    await expect(page.locator(`#visit-question-${id}`)).toHaveAttribute("aria-busy", "false");
  }
});

test("facility filtering, check-in and consent stay local and truthful", async ({ page }) => {
  const calls: string[] = []; page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); }); await page.goto("/");
  const search = page.getByLabel("Find a facility", { exact: true }); await search.fill("Mitford"); await expect(page.locator(".story-facility-list > a")).toHaveCount(1); await expect(page.locator(".story-facility-list > a")).toHaveAttribute("href", /facilities\/52\/profile/);
  await search.fill("no example matches"); await expect(page.getByRole("status").filter({ hasText: "No match in these examples" })).toBeVisible();
  await page.getByRole("radio", { name: "Tired", exact: true }).check(); await expect(page.getByRole("radio", { name: "Tired", exact: true })).toBeChecked();
  const consent = page.locator("#module-bondhon"); await expect(consent.getByRole("img")).toHaveAccessibleName(/Sample data/); await expect(consent.getByRole("checkbox")).toHaveCount(0);
  await expect(page.locator(".care-call")).toHaveCount(1); await expect(page.locator(".care-call")).toHaveJSProperty("disabled", false); expect(calls).toEqual([]);
});

test("320–1440px reflow includes 200% Bangla, spacious layout and relaxed spacing", async ({ page }) => {
  await page.goto("/");
  for (const width of widths) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `English at ${width}px`).toBe(true); }
  await page.getByRole("button", { name: "Read this homepage in Bangla" }).click(); await page.evaluate(() => { document.documentElement.dataset.layout = "spacious"; document.documentElement.dataset.textSpacing = "relaxed"; document.documentElement.style.fontSize = "200%"; });
  for (const width of widths) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Bangla 200% at ${width}px`).toBe(true); expect(await page.locator(".story-phone-body,.upgrade-mini-ui,.upgrade-product-grid,.home-nav").evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.className)), `Content at ${width}px`).toEqual([]); expect(await page.locator(".story-phone-body").evaluateAll(elements => Math.min(...elements.map(element => element.clientHeight))), `Usable screen area at ${width}px`).toBeGreaterThan(160); }
  await page.setViewportSize({ width: 768, height: 900 }); await page.locator("main").focus();
  for (let step = 0; step < 22; step++) { await page.keyboard.press("Tab"); await page.evaluate(() => new Promise(requestAnimationFrame)); expect(await page.evaluate(() => { const el = document.activeElement!; const header = document.querySelector("header")!; return document.querySelector("main")!.contains(el) && getComputedStyle(header).position === "sticky" && el.getBoundingClientRect().top < header.getBoundingClientRect().bottom - 1; }), `Focus at step ${step}`).toBe(false); }
});

test("axe checks all themes, independent contrast, Bangla and both dialogs", async ({ page }) => {
  test.setTimeout(90000);
  // Sample stable colors, not a partially transparent decorative entrance frame.
  // Animation, pause and reduced-motion behavior are covered in hero.spec.ts.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const theme of themes) for (const contrast of ["normal", "more"]) { await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; }, { theme, contrast }); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations, `${theme} ${contrast}`).toEqual([]); for (const ratio of await darkHeadingContrast(page)) expect(ratio, `4.5:1 floor for large accent text in ${theme} ${contrast}`).toBeGreaterThanOrEqual(4.5); }
  await openPreferences(page); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]); await page.keyboard.press("Escape"); await page.getByRole("button", { name: "Sign in", exact: true }).first().click(); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]); await page.keyboard.press("Escape"); await page.getByRole("button", { name: "Read this homepage in Bangla" }).click(); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
});

test("mobile menu, offline feedback, reduced motion and forced colors stay usable", async ({ page, context }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message)); await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click(); await page.getByRole("navigation", { name: "Mobile primary" }).getByRole("link", { name: "Features", exact: true }).click(); await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" }); await expect(page.locator(".home-button").first()).toHaveCSS("transition-duration", "0s"); await expect(await openPreferences(page)).toBeVisible(); await page.keyboard.press("Escape");
  console.log("Initial on page load, navigator.onLine:", await page.evaluate(() => navigator.onLine));
  console.log("Initial home-offline count:", await page.locator(".home-offline").count());
  await context.setOffline(true);
  await expect(page.getByRole("status").filter({ hasText: "You’re offline" })).toBeVisible();
  console.log("Before setOffline(false), navigator.onLine:", await page.evaluate(() => navigator.onLine));
  await context.setOffline(false);
  console.log("Immediately after setOffline(false), navigator.onLine:", await page.evaluate(() => navigator.onLine));
  await page.waitForTimeout(500);
  console.log("After 500ms, navigator.onLine:", await page.evaluate(() => navigator.onLine));
  await expect(page.locator(".home-offline")).toHaveCount(0);
  expect(errors).toEqual([]);
});
