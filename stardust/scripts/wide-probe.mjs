import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await (await b.newContext({viewport:{width:1920,height:1000}})).newPage();
await pg.goto('https://www.mdanderson.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await pg.waitForTimeout(3000);
const r = await pg.evaluate(() => {
  const w = (sel) => { const el = document.querySelector(sel); if (!el) return null;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return { w: Math.round(r.width), x: Math.round(r.x), maxW: cs.maxWidth, bg: cs.backgroundColor }; };
  return {
    body: w('body'), header: w('header.mda-nav'), nav: w('nav.mda-nav'),
    main: w('main.mda-content'), hero: w('.mda-survivor-media, .basic-content-media, main .content > div'),
    alertBand: w('[class*="alert"], .emergency-alert, main .content'),
    footer: w('.global-footer, footer'),
    htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    bodyMax: getComputedStyle(document.body).maxWidth,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
