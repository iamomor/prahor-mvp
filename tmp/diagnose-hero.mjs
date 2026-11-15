import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', args: ['--disable-gpu'] });
try {
  for (const port of [3000, 3113]) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 1050 } });
    page.on('pageerror', error => console.log(port, 'ERROR', error.message));
    page.on('console', msg => { if (msg.type() === 'error') console.log(port, msg.text()); });
    page.on('requestfailed', request => console.log(port, 'FAILED', request.url(), request.failure()));
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    console.log(port, await page.evaluate(() => ({
      ready: document.querySelector('.hero-showcase')?.dataset,
      overflow: [...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right})).slice(0,15),
      scripts: [...document.scripts].map(s=>s.src).filter(Boolean),
    })));
    await page.close();
  }
} finally { await browser.close(); }
