import { chromium } from 'playwright';
const url = 'https://main--mdanderson--paolomoz.aem.page/';
const b = await chromium.launch(); const pg = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errors = []; pg.on('pageerror', e => errors.push(String(e).slice(0,120)));
await pg.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(3000);
const r = await pg.evaluate(() => {
  const out = {};
  out.bodyAppear = document.body.classList.contains('appear');
  out.sections = document.querySelectorAll('main .section').length;
  out.blocksDecorated = document.querySelectorAll('[data-block-name]').length;
  out.blocksLoaded = document.querySelectorAll('[data-block-status="loaded"]').length;
  out.h1 = document.querySelectorAll('h1').length;
  out.headerRendered = !!document.querySelector('header .mda-nav-header, header nav');
  out.footerRendered = !!document.querySelector('footer .footer, footer [class*="footer"]');
  // grid/flex invariants: any block CSS declaring grid must compute grid
  const gridly = [...document.querySelectorAll('main [class*="cards"], main [class*="icon-wells"], main [class*="columns"], main [class*="link-list"]')].slice(0,20);
  out.gridChecks = gridly.map(el => {
    const d = getComputedStyle(el).display;
    return { cls: el.className.toString().slice(0,40), display: d };
  }).filter(g => g.display === 'grid' || g.display === 'flex').length + '/' + gridly.length;
  out.brokenImgs = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src && !i.src.startsWith('data:')).map(i => i.src.slice(0,90));
  return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('pageerrors:', errors.length, errors.slice(0,3));
await b.close();
