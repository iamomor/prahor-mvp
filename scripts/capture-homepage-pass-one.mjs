import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const baseURL = process.env.PROHOR_TEST_URL ?? "http://localhost:3000";
const directory = "docs/qa/pass-1";
const themes = ["quiet-garden", "original-rose", "morning-mist"];
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const evidence = [];
try {
  for (const theme of themes) {
    for (const contrast of ["normal", "more"]) {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1050 : 844 }, reducedMotion: "reduce" });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        await page.goto(baseURL, { waitUntil: "networkidle" });
        await page.evaluate(({ theme, contrast }) => {
          document.documentElement.dataset.theme = theme;
          if (contrast === "more") document.documentElement.dataset.contrast = "more";
          else delete document.documentElement.dataset.contrast;
        }, { theme, contrast });
        await page.evaluate(() => document.fonts.ready);
        const stem = `${theme}${contrast === "more" ? "-contrast-more" : ""}-${width}`;
        await page.screenshot({ path: `${directory}/${stem}.png`, fullPage: true });
        await page.screenshot({ path: `${directory}/${stem}-hero.png` });
        const measurements = await page.evaluate(() => ({
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          sections: [...document.querySelectorAll("main > section")].map(section => {
            const style = getComputedStyle(section);
            return { name: section.classList[0], background: style.backgroundColor, gradient: style.backgroundImage, topPadding: style.paddingTop, bottomPadding: style.paddingBottom };
          }),
          phones: [...document.querySelectorAll(".pass-phone")].map(phone => ({ width: phone.getBoundingClientRect().width, height: phone.getBoundingClientRect().height })),
          fontStatus: document.fonts.status,
          placeholderCount: document.querySelectorAll(".pass-image-placeholder").length,
        }));
        if (measurements.documentWidth > width || errors.length) throw new Error(JSON.stringify({ stem, measurements, errors }));
        evidence.push({ theme, contrast, width, screenshot: `${stem}.png`, ...measurements, errors });
        await context.close();
      }
    }
  }
  const banglaContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const banglaPage = await banglaContext.newPage();
  await banglaPage.goto(baseURL, { waitUntil: "networkidle" });
  await banglaPage.getByRole("button", { name: "Read this homepage in Bangla" }).click();
  await banglaPage.waitForFunction(() => document.documentElement.lang === "bn" && !document.querySelector("h1").textContent.startsWith("Maternal"));
  await banglaPage.screenshot({ path: `${directory}/bangla-390.png`, fullPage: true });
  await banglaPage.setViewportSize({ width: 320, height: 900 });
  await banglaPage.evaluate(() => {
    document.documentElement.dataset.layout = "spacious";
    document.documentElement.dataset.textSpacing = "relaxed";
    document.documentElement.style.fontSize = "200%";
  });
  await banglaPage.screenshot({ path: `${directory}/bangla-200-320.png` });
  await banglaPage.locator("#visit-question-touch").focus();
  await banglaPage.screenshot({ path: `${directory}/bangla-200-320-task.png` });
  await writeFile(`${directory}/accessibility-tree.yml`, await banglaPage.locator(".pro-home").ariaSnapshot());
  await banglaContext.close();
  await writeFile(`${directory}/measurements.json`, JSON.stringify(evidence, null, 2) + "\n");
  console.log(`Captured ${evidence.length} full pages and ${evidence.length} first viewports in ${directory}.`);
} finally {
  await browser.close();
}
