import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const directory = "docs/qa/navigation-polish";
const baseURL = process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3112";
const evidence = [];
await mkdir(directory, { recursive: true });
// Software rendering avoids Edge's repeated textures in long mobile captures.
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge", args: ["--disable-gpu"] });
try {
  for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) for (const contrast of ["normal", "more"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1050 : 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; }, { theme, contrast });
    const stem = `${theme}${contrast === "more" ? "-contrast-more" : ""}-${width}`;
    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      navbarHeight: document.querySelector("header").getBoundingClientRect().height,
      navbarTop: document.querySelector("header").getBoundingClientRect().top,
      activeModule: document.querySelector('.roadmap-tabs [aria-selected="true"]').textContent,
      unavailableFilters: document.querySelectorAll('.roadmap-filters [aria-disabled="true"]').length,
      moduleFont: getComputedStyle(document.querySelector(".upgrade-module-grid strong")).fontFamily,
      moduleFontSize: getComputedStyle(document.querySelector(".upgrade-module-grid strong")).fontSize,
    }));
    if (layout.documentWidth !== width || layout.navbarHeight !== 64 || errors.length) throw Error(JSON.stringify({ stem, layout, errors }));
    await page.screenshot({ path: `${directory}/${stem}.png`, fullPage: true });
    await page.screenshot({ path: `${directory}/${stem}-hero.png` });
    for (const [selector, name] of [[".upgrade-journey", "modules"], [".story-roadmap", "roadmap"]]) {
      await page.locator(selector).screenshot({ path: `${directory}/${stem}-${name}.png`, style: ".home-header,.home-skip{visibility:hidden!important}" });
    }
    if (theme === "quiet-garden" && contrast === "normal") {
      for (const [selector, name] of [[".story-problem", "problem"], [".story-adapt", "adapt"], [".upgrade-companion", "companion"], [".upgrade-support", "support"], [".upgrade-audiences", "windows"], [".upgrade-responsible", "responsible"], [".upgrade-team", "team"], [".upgrade-final", "cta"], ["footer", "footer"]]) {
        await page.locator(selector).screenshot({ path: `${directory}/approved-${name}-${width}.png`, style: ".home-header,.home-skip{visibility:hidden!important}" });
      }
    }
    await page.locator("#features").evaluate(element => element.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForFunction(() => document.querySelector("header").dataset.shrunk === "true");
    await page.screenshot({ path: `${directory}/${stem}-scrolled.png` });
    const scrolled = await page.locator("header").evaluate(element => ({ height: element.getBoundingClientRect().height, top: element.getBoundingClientRect().top, current: element.querySelector('[aria-current="location"]')?.getAttribute("href") }));
    if (scrolled.height !== 56 || scrolled.current !== "#features") throw Error(JSON.stringify({ stem, scrolled }));
    if (width === 390) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForFunction(() => document.querySelector("header").dataset.shrunk === "false");
      await page.getByRole("button", { name: "Open navigation", exact: true }).click();
      await page.screenshot({ path: `${directory}/${stem}-menu.png` });
      await page.keyboard.press("Escape");
    }
    evidence.push({ theme, contrast, width, ...layout, scrolled, errors });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 320, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.screenshot({ path: `${directory}/quiet-garden-320-menu.png` });
  await page.locator("#home-mobile-menu").getByRole("button", { name: "Read this homepage in Bangla", exact: true }).click();
  await page.locator("#home-mobile-menu").getByRole("button").first().click();
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; document.documentElement.dataset.layout = "spacious"; document.documentElement.dataset.textSpacing = "relaxed"; });
  await page.screenshot({ path: `${directory}/bangla-200-320.png` });
  await page.locator(".home-menu-button").click();
  await page.screenshot({ path: `${directory}/bangla-200-320-menu.png` });
  await writeFile(`${directory}/accessibility-tree.yml`, await page.locator(".pro-home").ariaSnapshot());
  await context.close();
  await writeFile(`${directory}/measurements.json`, JSON.stringify(evidence, null, 2) + "\n");
  console.log(`Captured ${evidence.length} layouts, scrolled navigation, six open menus and detail evidence.`);
} finally {
  await browser.close();
}
