import { chromium } from 'playwright';
const F = 'file:///Users/paolo/stardust/2026-08/mdanderson/stardust/prototypes/horizon-cinematic.html';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(F, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
await p.waitForTimeout(1200);
await p.evaluate(() => window.__lenis.scrollTo(2600, { immediate: true }));
await p.waitForTimeout(700);
console.log(await p.evaluate(() => {
  const stack = document.elementsFromPoint(150, 48).slice(0, 6).map(el =>
    el.tagName + '.' + String(el.className).slice(0, 36) + ' bg=' + getComputedStyle(el).backgroundColor.slice(0, 42));
  const pill = document.querySelector('.site-head .npill');
  const r = pill.getBoundingClientRect();
  return { stack, pillRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) } };
}));
await p.screenshot({ path: 'stardust/validation/horizon/pill-debug.png', clip: { x: 0, y: 0, width: 500, height: 110 } });
await b.close();
