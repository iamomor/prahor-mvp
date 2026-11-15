import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', args: ['--disable-gpu'] });
const results=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});
  await page.goto(process.env.PROHOR_TEST_URL ?? 'http://127.0.0.1:3113',{waitUntil:'networkidle'});
  for(const theme of ['quiet-garden','original-rose','morning-mist']) for(const contrast of ['normal','more']) {
    await page.evaluate(({theme,contrast})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.contrast=contrast;},{theme,contrast});
    const pairs=await page.locator('.story-hero').evaluate(hero=>{
      const ctx=document.createElement('canvas').getContext('2d');
      const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((v,i)=>i===3?v/255:v);};
      const lum=color=>{const c=color.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
      const blend=(fg,bg)=>fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3]));
      const walker=document.createTreeWalker(hero,NodeFilter.SHOW_TEXT);
      const pairs=[];
      while(walker.nextNode()) {
        const node=walker.currentNode;
        if(!node.textContent.trim())continue;
        const el=node.parentElement;
        if(!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
        let background=rgba(getComputedStyle(document.documentElement).getPropertyValue('--pro-bg'));
        const chain=[];for(let parent=el;parent;parent=parent.parentElement)chain.unshift(parent);
        for(const parent of chain)background=blend(rgba(getComputedStyle(parent).backgroundColor),background);
        const foreground=blend(rgba(getComputedStyle(el).color),background);
        const a=lum(foreground),b=lum(background);
        const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
        pairs.push({text:node.textContent.trim(),ratio:Number(ratio.toFixed(2))});
      }
      return pairs;
    });
    results.push({theme,contrast,minimum:Math.min(...pairs.map(p=>p.ratio)),failures:pairs.filter(p=>p.ratio<4.5),pairs});
  }
  await page.setViewportSize({width:320,height:950});
  await page.getByRole('button',{name:'Switch homepage language to Bangla',exact:true}).click();
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';document.documentElement.dataset.layout='spacious';document.documentElement.dataset.textSpacing='relaxed';});
  const reflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth,hero:document.querySelector('.story-hero').scrollWidth,overflow:[...document.querySelectorAll('.story-hero *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,class:e.getAttribute('class'),right:e.getBoundingClientRect().right})).slice(0,15)}));
  await writeFile('docs/qa/hero-refinement/contrast.json',JSON.stringify({results,reflow},null,2));
  console.log(JSON.stringify({contrast:results.map(({theme,contrast,minimum,failures})=>({theme,contrast,minimum,failures})),reflow},null,2));
  if (results.some(result => result.failures.length) || reflow.hero > reflow.viewport) process.exitCode = 1;
} finally {await browser.close();}
