import { chromium } from 'playwright';
const b = await chromium.launch(); const pg = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await pg.goto('https://main--mdanderson--paolomoz.aem.page/', { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(2000);
const r = await pg.evaluate(() => {
  const out = [];
  document.querySelectorAll('main .block').forEach(bl => {
    const name = bl.dataset.blockName;
    // find deepest container with >2 element children — the layout container
    const cands = [bl, ...bl.querySelectorAll(':scope > div, :scope > div > div, .wrap, [class*="grid"], [class*="row"], [class*="list"]')].slice(0, 12);
    const layouts = cands.map(c => getComputedStyle(c).display).filter(d => d === 'grid' || d === 'flex');
    const rect = bl.getBoundingClientRect ? bl.getBoundingClientRect() : {height: 0};
    out.push({ name, layoutHits: layouts.length, height: Math.round(bl.offsetHeight) });
  });
  return out;
});
console.log(JSON.stringify(r));
await b.close();
