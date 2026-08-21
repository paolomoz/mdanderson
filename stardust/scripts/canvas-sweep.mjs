import { chromium } from 'playwright';
const paths = ['/cancer-types/breast-cancer', '/donors-volunteers', '/research', '/cancerwise', '/about-md-anderson/our-locations'];
const b = await chromium.launch();
for (const p of paths) {
  const pg = await (await b.newContext({viewport:{width:1920,height:1000}})).newPage();
  const errs = []; pg.on('pageerror', e => errs.push(1));
  await pg.goto('https://main--mdanderson--paolomoz.aem.page' + p + '?cb=' + Math.random(), { waitUntil: 'networkidle', timeout: 60000 });
  await pg.waitForTimeout(2500);
  const r = await pg.evaluate(() => ({
    bodyW: Math.round(document.body.getBoundingClientRect().width),
    bodyX: Math.round(document.body.getBoundingClientRect().x),
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
    broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src && !i.src.startsWith('data:')).length,
  }));
  console.log(p, JSON.stringify(r), 'pageerrors:', errs.length);
  await pg.context().close();
}
await b.close();
