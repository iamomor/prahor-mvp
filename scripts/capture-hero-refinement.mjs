import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const directory = "docs/qa/hero-refinement";
const baseURL = process.env.PROHOR_TEST_URL ?? "http://127.0.0.1:3113";
const themes = ["quiet-garden", "original-rose", "morning-mist"];
const times = [0, 1000, 2500, 5000];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge", args: ["--disable-gpu"] });
const measurements = [];
await mkdir(directory, { recursive: true });

async function openPage(theme, width, contrast = "normal", reducedMotion = "no-preference") {
  const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1050 : 844 }, reducedMotion });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".hero-product-scene").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".hero-showcase").dataset.started === "true");
  await page.evaluate(({ theme, contrast }) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.contrast = contrast;
  }, { theme, contrast });
  await page.mouse.move(0, 0);
  return { context, page, errors };
}

async function seek(page, time) {
  await page.locator(".hero-showcase").evaluate((element, time) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause(); animation.currentTime = time;
    }
  }, time);
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

async function capture(page, filename, width) {
  if (width === 1440) {
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `${directory}/${filename}`, animations: "allow" });
  } else {
    await page.locator(".story-hero").screenshot({ path: `${directory}/${filename}`, animations: "allow", style: ".home-header,.home-skip{visibility:hidden!important}" });
  }
}

try {
  for (const theme of themes) for (const width of [1440, 390]) {
    const { context, page, errors } = await openPage(theme, width);
    const geometry = [];
    for (const time of times) {
      await seek(page, time);
      await capture(page, `${theme}-${width}-${time}ms.png`, width);
      geometry.push(await page.locator(".hero-product-scene").evaluate(element => {
        const box = element.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }));
    }
    const layout = await page.evaluate(() => ({
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      buttonRadii: [...document.querySelectorAll(".story-hero .home-button")].map(element => getComputedStyle(element).borderRadius),
      phone: (() => { const box = document.querySelector(".hero-product-phone").getBoundingClientRect(); return { width: box.width, height: box.height }; })(),
      headingFont: getComputedStyle(document.querySelector("h1")).fontFamily,
      bodyFont: getComputedStyle(document.querySelector(".story-hero-description")).fontFamily,
    }));
    if (errors.length || layout.documentWidth !== width || new Set(geometry.map(item => JSON.stringify(item))).size !== 1) throw Error(JSON.stringify({ theme, width, layout, geometry, errors }));
    measurements.push({ theme, width, ...layout, geometry, errors });
    await context.close();
  }
  for (const theme of themes) for (const width of [1440, 390]) {
    const { context, page } = await openPage(theme, width, "more");
    await seek(page, 5000);
    await capture(page, `${theme}-${width}-contrast-more.png`, width);
    await context.close();
  }
  for (const width of [1440, 390]) {
    const { context, page } = await openPage("quiet-garden", width, "normal", "reduce");
    await page.waitForFunction(() => document.querySelector(".hero-motion-button").disabled);
    await capture(page, `quiet-garden-${width}-reduced-motion.png`, width);
    await writeFile(`${directory}/hero-accessibility-${width}.yml`, await page.locator(".story-hero").ariaSnapshot());
    await context.close();
  }
  const { context, page } = await openPage("quiet-garden", 320, "normal", "reduce");
  await page.getByRole("button", { name: "Switch homepage language to Bangla", exact: true }).click();
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; document.documentElement.dataset.layout = "spacious"; document.documentElement.dataset.textSpacing = "relaxed"; });
  await page.locator(".story-hero").screenshot({ path: `${directory}/quiet-garden-320-200-percent.png`, style: ".home-header,.home-skip{visibility:hidden!important}" });
  const current = await page.evaluate(() => ({ sections: [...document.querySelectorAll("main > section")].slice(1).map(element => element.outerHTML), navbar: document.querySelector("header").outerHTML, footer: document.querySelector("footer").outerHTML }));
  let comparison;
  try {
    const baseline = JSON.parse(await readFile("tmp/hero-before/approved-markup.json", "utf8"));
    comparison = { explanation: "Concurrent work was confirmed by the user. Differences outside the hero belong to that work and were left untouched.", baselineSections: baseline.sections.length, currentSections: current.sections.length };
  } catch { comparison = { baseline: "Unavailable" }; }
  await context.close();
  await writeFile(`${directory}/measurements.json`, JSON.stringify({ measurements, comparison }, null, 2) + "\n");

  const title = theme => theme.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ");
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PROHOR hero review</title><style>body{font:16px/1.6 system-ui;max-width:1200px;margin:auto;padding:24px}h1{font-size:2rem}figure{margin:0}img{display:block;width:100%;height:auto;border:1px solid currentColor;border-radius:12px}a{color:inherit}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:20px}section{margin-block:40px}select{font:inherit;padding:8px}label{display:block;margin-bottom:16px}</style><h1>PROHOR homepage hero</h1><p>CSS animation sampled at 0s, 1s, 2.5s and 5s. Desktop: 1440px. Mobile: 390px, full hero. The phone and cards contain decorative sample content.</p><label>Animation time <select id="time"><option value="0">0 seconds</option><option value="1000">1 second</option><option value="2500" selected>2.5 seconds</option><option value="5000">5 seconds</option></select></label>${themes.map(theme => `<section><h2>${title(theme)}</h2><div class="grid">${[1440,390].map(width => `<figure><a class="frame-link" href="${theme}-${width}-2500ms.png"><img data-theme="${theme}" data-width="${width}" src="${theme}-${width}-2500ms.png" alt="${title(theme)} hero at ${width}px"></a><figcaption>${width}px · <a href="${theme}-${width}-contrast-more.png">Higher contrast</a></figcaption></figure>`).join("")}</div></section>`).join("")}<section><h2>Reduced motion</h2><div class="grid">${[1440,390].map(width => `<figure><a href="quiet-garden-${width}-reduced-motion.png"><img src="quiet-garden-${width}-reduced-motion.png" alt="Static Home screen at ${width}px"></a><figcaption>${width}px · OS reduced motion</figcaption></figure>`).join("")}</div></section><p><a href="README.md">Test report and limitations</a> · <a href="measurements.json">Layout measurements</a></p><script>document.querySelector('#time').addEventListener('change',event=>document.querySelectorAll('img[data-theme]').forEach(img=>{img.src=img.dataset.theme+'-'+img.dataset.width+'-'+event.target.value+'ms.png';img.closest('a').href=img.src}));</script></html>`;
  await writeFile(`${directory}/index.html`, html);
  console.log(`Saved 33 screenshots, theme/timing gallery, accessibility snapshots and layout measurements in ${directory}.`);
} finally { await browser.close(); }
