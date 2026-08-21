import { chromium } from 'playwright';
const b = await chromium.launch(); const pg = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await pg.goto('https://main--mdanderson--paolomoz.aem.page/', { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(3000);
const r = await pg.evaluate(() => {
  const out = [];
  const trio = [...document.querySelectorAll('.cards.icon.trio')].pop();
  if (!trio) return 'NO TRIO';
  trio.querySelectorAll('.card-col').forEach(col => {
    const item = {};
    ['.promo-icon', '.fa-stack', 'h3.title', '.icon', 'img', 'span'].forEach(sel => {
      const el = col.querySelector(sel);
      if (el) { const rr = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        item[sel] = { y: Math.round(rr.y), h: Math.round(rr.height), w: Math.round(rr.width), disp: cs.display, mb: cs.marginBottom, lh: cs.lineHeight }; }
    });
    out.push(item);
  });
  return out.slice(0,1);
});
console.log(JSON.stringify(r, null, 1));
await b.close();
