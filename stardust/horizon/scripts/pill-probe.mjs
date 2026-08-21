import { chromium } from 'playwright';
const F = 'file:///Users/paolo/stardust/2026-08/mdanderson/stardust/prototypes/horizon-cinematic.html';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(F, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
await p.waitForTimeout(1200);
await p.evaluate(() => window.__lenis.scrollTo(2600, { immediate: true }));
await p.waitForTimeout(600);
console.log(await p.evaluate(() => {
  const pills = [...document.querySelectorAll('.site-head .npill')];
  return pills.map(el => ({
    cls: el.className, bg: getComputedStyle(el).backgroundColor,
    color: getComputedStyle(el).color, filter: getComputedStyle(el).backdropFilter.slice(0,40)
  }));
}));
await b.close();
