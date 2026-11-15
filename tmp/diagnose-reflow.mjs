import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', args: ['--disable-gpu'] });
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 950 }, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:3113', { waitUntil: 'networkidle' });
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';document.documentElement.dataset.layout='spacious';document.documentElement.dataset.textSpacing='relaxed';});
  console.log(await page.evaluate(()=>({
    width: document.documentElement.scrollWidth,
    hero:document.querySelector('.story-hero').getBoundingClientRect().toJSON(),
    overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1 && getComputedStyle(e).position !== 'absolute').map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right,section:e.closest('section')?.className})).slice(0,30),
  })));
  await page.locator('.story-hero').screenshot({path:'tmp/hero-320-200.png'});
} finally {await browser.close();}
