import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const directory = "docs/qa/navigation-redesign";
const baseURL = process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3112";
const evidence = [];
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge", args: ["--disable-gpu"] });
try {
  for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) for (const contrast of ["normal", "more"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; }, { theme, contrast });
    const stem = `${theme}${contrast === "more" ? "-contrast-more" : ""}-${width}`;
    const layout = await page.evaluate(() => {
      const header = document.querySelector(".clean-nav");
      const adjust = header.querySelector(".home-access-button");
      return { documentWidth: document.documentElement.scrollWidth, header: { width: header.getBoundingClientRect().width, height: header.getBoundingClientRect().height, top: header.getBoundingClientRect().top, radius: getComputedStyle(header).borderRadius }, adjustWidth: adjust.getBoundingClientRect().width };
    });
    if (layout.documentWidth !== width || layout.header.height !== (width === 1440 ? 72 : 64) || layout.header.top !== 0 || layout.header.radius !== "0px" || layout.adjustWidth !== 44 || errors.length) throw Error(JSON.stringify({ stem, layout, errors }));
    await page.screenshot({ path: `${directory}/${stem}.png` });
    await page.locator(".clean-nav").screenshot({ path: `${directory}/${stem}-header.png` });
    if (width === 390) {
      await page.getByRole("button", { name: "Open navigation", exact: true }).click();
      await page.screenshot({ path: `${directory}/${stem}-menu.png` });
      await page.keyboard.press("Escape");
    } else {
      await page.locator(".clean-nav .home-access-button").focus();
      await page.screenshot({ path: `${directory}/${stem}-tooltip.png`, clip: { x: 0, y: 0, width, height: 170 } });
      await page.keyboard.press("Escape");
    }
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.mouse.move(0, 100);
    await page.locator("#features").evaluate(element => element.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForFunction(() => document.querySelector(".clean-nav").dataset.shrunk === "true");
    await page.screenshot({ path: `${directory}/${stem}-scrolled.png` });
    const scrolled = await page.locator(".clean-nav").evaluate(element => ({ height: element.getBoundingClientRect().height, top: element.getBoundingClientRect().top, current: element.querySelector('[aria-current="location"]')?.getAttribute("href") }));
    if (scrolled.height !== 64 || scrolled.top !== 0 || scrolled.current !== "#features") throw Error(JSON.stringify({ stem, scrolled }));
    evidence.push({ theme, contrast, width, ...layout, scrolled, errors });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 320, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.screenshot({ path: `${directory}/quiet-garden-320-menu.png` });
  await page.locator("#home-mobile-menu").getByRole("button", { name: "Read this homepage in Bangla", exact: true }).click();
  await page.screenshot({ path: `${directory}/bangla-320-menu.png` });
  await page.keyboard.press("Escape");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; document.documentElement.dataset.layout = "spacious"; document.documentElement.dataset.textSpacing = "relaxed"; });
  await page.screenshot({ path: `${directory}/bangla-200-320.png` });
  await page.locator(".home-menu-button").click();
  await page.screenshot({ path: `${directory}/bangla-200-320-menu.png` });
  await writeFile(`${directory}/accessibility-tree.yml`, await page.locator(".clean-nav").ariaSnapshot());
  await context.close();
  await writeFile(`${directory}/measurements.json`, JSON.stringify(evidence, null, 2) + "\n");
  console.log(`Captured ${evidence.length} navigation layouts, menu, tooltip and scrolled states.`);
} finally { await browser.close(); }
