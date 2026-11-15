import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const directory = "docs/qa/homepage-care";
const baseURL = process.env.PROHOR_TEST_URL ?? "http://localhost:3011";
const themes = ["quiet-garden", "original-rose", "morning-mist"];
const evidence = [];
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge", args: ["--disable-gpu"] });
try {
  for (const theme of themes) for (const contrast of ["normal", "more"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => { if (response.url().includes("/_next/") && response.status() >= 400) errors.push(`Asset ${response.status()}: ${response.url()}`); });
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(({ theme, contrast }) => {
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.contrast = contrast;
    }, { theme, contrast });
    const stem = `${theme}-${contrast}-${width}`;
    for (const [selector, label] of [[".care-companion", "companion"], [".care-support-panel", "support"]]) {
      await page.locator(selector).screenshot({ path: `${directory}/${stem}-${label}.png`, style: "header,.home-skip,nextjs-portal{visibility:hidden!important}" });
    }
    const metrics = await page.evaluate(() => {
      const canvas = document.createElement("canvas"); canvas.width = 1; canvas.height = 1;
      const context = canvas.getContext("2d");
      const color = value => { context.clearRect(0,0,1,1); context.fillStyle = value; context.fillRect(0,0,1,1); return [...context.getImageData(0,0,1,1).data]; };
      const mix = (fg,bg) => fg.slice(0,3).map((value,i) => value * fg[3]/255 + bg[i] * (1-fg[3]/255));
      const luminance = rgb => { const [r,g,b] = rgb.map(value => value/255).map(value => value <= .04045 ? value/12.92 : ((value+.055)/1.055)**2.4); return r*.2126+g*.7152+b*.0722; };
      const ratio = (a,b) => { const x=luminance(a),y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
      const text = [...document.querySelectorAll(".care-companion *,.care-support *")].filter(element => [...element.childNodes].some(node => node.nodeType===Node.TEXT_NODE && node.textContent.trim()) && !element.closest(".home-sr-only") && element.getBoundingClientRect().width>0);
      const checks = text.map(element => {
        const ancestors=[]; for(let ancestor=element;ancestor;ancestor=ancestor.parentElement) ancestors.unshift(ancestor);
        let background=[255,255,255]; for(const ancestor of ancestors) background=mix(color(getComputedStyle(ancestor).backgroundColor),background);
        const style=getComputedStyle(element); const foreground=mix(color(style.color),background);
        return { text: element.textContent.trim().slice(0,90), ratio: ratio(foreground,background), size: parseFloat(style.fontSize) };
      });
      const heading=document.querySelector("#support-title");
      return {
        pageWidth: document.documentElement.scrollWidth,
        cardHeights: [...document.querySelectorAll(".care-card")].map(element=>element.getBoundingClientRect().height),
        headingLines: heading.getBoundingClientRect().height/parseFloat(getComputedStyle(heading).lineHeight),
        headingFont: getComputedStyle(document.querySelector(".care-card h3")).fontFamily,
        bodyFont: getComputedStyle(document.querySelector(".care-card-description")).fontFamily,
        bodyWeight: getComputedStyle(document.querySelector(".care-card-description")).fontWeight,
        tagFont: getComputedStyle(document.querySelector(".care-module-tag")).fontFamily,
        minimumTextSize: Math.min(...checks.map(check=>check.size)),
        minimumContrast: Math.min(...checks.map(check=>check.ratio)),
        contrastFailures: checks.filter(check=>check.ratio<4.5),
        sectionOverflow: [...document.querySelectorAll(".care-companion,.care-support")].map(element=>element.scrollWidth-element.clientWidth),
      };
    });
    evidence.push({ theme, contrast, width, ...metrics, errors });
    if (errors.length || !metrics.headingFont.includes("Fraunces") || !metrics.bodyFont.includes("Manrope") || metrics.bodyWeight !== "500" || !metrics.tagFont.includes("JetBrains Mono") || metrics.contrastFailures.length || metrics.minimumTextSize < 12.5 || metrics.sectionOverflow.some(value=>value>1) || (width===1440 && metrics.headingLines>2.01)) throw new Error(JSON.stringify(evidence.at(-1),null,2));
    await context.close();
    console.log(`Captured ${stem}; contrast floor ${metrics.minimumContrast.toFixed(2)}:1, minimum text ${metrics.minimumTextSize}px.`);
  }
  // Contact sheets retain each full image; originals remain linked in the gallery.
  for (const width of [1440,390]) for (const label of ["companion","support"]) {
    const tileWidth=width===1440?480:260;
    const tiles=[];
    for (const contrast of ["normal","more"]) for (const theme of themes) {
      const stem=`${theme}-${contrast}-${width}-${label}`;
      const buffer=await sharp(`${directory}/${stem}.png`).resize({width:tileWidth}).png().toBuffer();
      const metadata=await sharp(buffer).metadata();
      tiles.push({buffer,height:metadata.height});
    }
    const rowHeight=Math.max(...tiles.map(tile=>tile.height));
    await sharp({create:{width:tileWidth*3,height:rowHeight*2,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(tiles.map((tile,index)=>({input:tile.buffer,left:(index%3)*tileWidth,top:Math.floor(index/3)*rowHeight}))).png().toFile(`${directory}/matrix-${label}-${width}.png`);
  }
  await writeFile(`${directory}/measurements.json`,JSON.stringify(evidence,null,2)+"\n");
  const rows=themes.map(theme=>`<section><h2>${theme.replaceAll("-"," ")}</h2>${["normal","more"].map(contrast=>`<h3>${contrast==="more"?"Higher contrast":"Default contrast"}</h3><div class="pair">${[1440,390].map(width=>`<article><h4>${width}px</h4>${["companion","support"].map(label=>`<a href="${theme}-${contrast}-${width}-${label}.png"><img loading="lazy" src="${theme}-${contrast}-${width}-${label}.png" alt="${theme}, ${contrast} contrast, ${width}px, ${label} section"></a>`).join("")}</article>`).join("")}</div>`).join("")}</section>`).join("");
  await writeFile(`${directory}/index.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PROHOR homepage redesign — screenshots</title><style>body{font:500 16px/1.6 system-ui;max-width:1440px;margin:auto;padding:24px}h1,h2,h3{line-height:1.3}section{margin-block:48px}h2{text-transform:capitalize}.pair{display:grid;grid-template-columns:2fr 1fr;gap:24px}img{display:block;width:100%;height:auto;border:1px solid currentColor;margin-bottom:16px}a:focus-visible{outline:3px solid currentColor;outline-offset:4px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>PROHOR: two redesigned homepage sections</h1><p>24 screenshots: both sections at 1440px and 390px, in all three themes with default and higher contrast. Captured from the production build. All care data is synthetic; only Adapt’s local controls are interactive.</p><p><a href="REPORT.md">Test report</a> · <a href="measurements.json">Measurements</a></p>${rows}</html>`);
  console.log(`Saved 24 screenshots, four contact sheets, measurements and the gallery in ${directory}.`);
} finally { await browser.close(); }
