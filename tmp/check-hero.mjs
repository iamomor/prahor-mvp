import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', args: ['--disable-gpu'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => console.log(error.message));
  await page.goto('http://127.0.0.1:3000');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'tmp/hero-1440.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.story-hero').screenshot({ path: 'tmp/hero-390.png' });
  console.log(await page.locator('.hero-product-scene').evaluate(el=>({width:el.clientWidth,height:el.clientHeight,overflow:document.documentElement.scrollWidth, screen:[...el.querySelectorAll('.hero-screen')].map(s=>({height:s.clientHeight,scroll:s.scrollHeight}))})));
} finally { await browser.close(); }
