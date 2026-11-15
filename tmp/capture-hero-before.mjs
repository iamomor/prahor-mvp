import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', args: ['--disable-gpu'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  await page.goto('http://127.0.0.1:3000');
  await page.evaluate(() => document.fonts.ready);
  await mkdir('tmp/hero-before', { recursive: true });
  await writeFile('tmp/hero-before/approved-markup.json', JSON.stringify(await page.evaluate(() => ({
    navbar: document.querySelector('header').outerHTML,
    sections: [...document.querySelectorAll('main > section')].slice(1).map(s => s.outerHTML),
    footer: document.querySelector('footer').outerHTML,
  }))));
  await page.screenshot({ path: 'tmp/hero-before/1440.png' });
} finally { await browser.close(); }
