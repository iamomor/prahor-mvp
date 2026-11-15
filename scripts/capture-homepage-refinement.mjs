import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const directory = "docs/qa/refinement";
const baseURL = process.env.PROHOR_TEST_URL ?? "http://localhost:3000";
const themes = ["quiet-garden", "original-rose", "morning-mist"];
const evidence = [];
await mkdir(directory, { recursive: true });
// Software rendering avoids Edge repeating the first texture after 16,384px
// when capturing the long mobile page. It does not change the page's layout.
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge", args: ["--disable-gpu"] });
try {
  for (const theme of themes) for (const contrast of ["normal", "more"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1050 : 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(({ theme, contrast }) => {
      document.documentElement.dataset.theme = theme;
      if (contrast === "more") document.documentElement.dataset.contrast = "more";
      else delete document.documentElement.dataset.contrast;
    }, { theme, contrast });
    const stem = `${theme}${contrast === "more" ? "-contrast-more" : ""}-${width}`;
    await page.screenshot({ path: `${directory}/${stem}.png`, fullPage: true });
    await page.screenshot({ path: `${directory}/${stem}-hero.png` });
    const details = await page.evaluate(() => {
      const heading = document.querySelector("h1");
      const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
      const band = document.querySelector(".story-adapt .story-section-heading > p");
      return {
        documentWidth: document.documentElement.scrollWidth,
        heroLines: Math.round(heading.getBoundingClientRect().height / lineHeight),
        displayFont: getComputedStyle(heading).fontFamily,
        italicStyle: getComputedStyle(heading.querySelector("em")).fontStyle,
        bandParagraph: getComputedStyle(band).color,
        sections: [...document.querySelectorAll("main > section")].map(section => ({ name: section.classList[0], background: getComputedStyle(section).backgroundColor, padding: getComputedStyle(section).paddingTop })),
        phoneCount: document.querySelectorAll(".story-phone").length,
        cardHeights: [...document.querySelectorAll(".upgrade-companion-grid > article")].map(element => Math.round(element.getBoundingClientRect().height)),
        frames: [...document.querySelectorAll(".story-phone")].map(element => ({width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height})),
      };
    });
    if (details.documentWidth > width || errors.length || (width === 1440 && details.heroLines !== 3)) throw new Error(JSON.stringify({ stem, details, errors }));
    evidence.push({ theme, contrast, width, ...details, errors });
    if (theme === "quiet-garden" && contrast === "normal") {
      for (const [selector, name] of [[".upgrade-product-strip", "product"], [".story-problem", "problem"], [".story-adapt", "adapt"], [".upgrade-companion", "companion"], [".upgrade-journey", "journey"], [".upgrade-support", "support"], [".upgrade-audiences", "windows"], [".upgrade-responsible", "responsible"], [".upgrade-team", "team"], [".upgrade-final", "cta"], ["footer", "footer"], [".story-roadmap", "roadmap"]]) {
        await page.locator(selector).screenshot({ path: `${directory}/${name}-${width}.png`, style: ".home-header,.home-skip,nextjs-portal{visibility:hidden!important}" });
      }
      await page.getByRole("tab", { name: "Bondhon 7", exact: true }).click();
      await page.locator(".story-roadmap").screenshot({ path: `${directory}/roadmap-bondhon-${width}.png`, style: ".home-header,.home-skip{visibility:hidden!important}" });
      await page.getByRole("tab", { name: "Adapt 1", exact: true }).click();
      if (width === 390) for (let index = 0; index < 7; index++) await page.locator(".story-device").nth(index).screenshot({ path: `${directory}/phone-${index + 1}-390.png`, style: ".home-header,.home-skip{visibility:hidden!important}" });
    }
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Read this homepage in Bangla" }).click();
  await page.waitForFunction(() => document.documentElement.lang === "bn" && !document.querySelector("h1").textContent.startsWith("Maternal"));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${directory}/bangla-390.png`, fullPage: true });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; document.documentElement.dataset.layout = "spacious"; document.documentElement.dataset.textSpacing = "relaxed"; });
  await page.locator("#visit-question-touch").focus();
  await page.screenshot({ path: `${directory}/bangla-200-320.png` });
  await writeFile(`${directory}/accessibility-tree.yml`, await page.locator(".pro-home").ariaSnapshot());
  await context.close();
  await writeFile(`${directory}/measurements.json`, JSON.stringify(evidence, null, 2) + "\n");
  console.log(`Captured ${evidence.length} theme/contrast layouts, their first viewports, section details and Bangla evidence.`);
} finally {
  await browser.close();
}
