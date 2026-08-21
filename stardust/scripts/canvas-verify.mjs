import { chromium } from 'playwright';
const b = await chromium.launch();
// 1920 canvas check on deployed
const pg = await (await b.newContext({viewport:{width:1920,height:1000}})).newPage();
await pg.goto('https://main--mdanderson--paolomoz.aem.page/?cb=' + Math.random(), { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(3000);
const canvas = await pg.evaluate(() => {
  const w = (sel) => { const el = document.querySelector(sel); if (!el) return null;
    const r = el.getBoundingClientRect(); return { w: Math.round(r.width), x: Math.round(r.x) }; };
  return { body: w('body'), header: w('header'), heroSection: w('main .section:nth-of-type(2)'), footer: w('footer'), utilityBar: w('header .mda-cta-list-container.desktop') };
});
console.log('canvas@1920:', JSON.stringify(canvas));
// trio geometry at 1440
const pg2 = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await pg2.goto('https://main--mdanderson--paolomoz.aem.page/?cb=' + Math.random(), { waitUntil: 'networkidle', timeout: 60000 });
await pg2.waitForTimeout(3000);
const trio = await pg2.evaluate(() => {
  const t = [...document.querySelectorAll('.cards.icon.trio')].pop();
  const c = t.querySelector('.fa-stack').getBoundingClientRect();
  const h = t.querySelector('h3.title').getBoundingClientRect();
  return { circleBottom: Math.round(c.y + c.height), titleTop: Math.round(h.y), gap: Math.round(h.y - (c.y + c.height)) };
});
console.log('trio@1440:', JSON.stringify(trio), '(original gap: 20px)');
await b.close();
