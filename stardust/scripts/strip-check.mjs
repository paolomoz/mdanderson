import { chromium } from 'playwright';
const b = await chromium.launch(); const pg = await (await b.newContext()).newPage();
await pg.goto('https://main--mdanderson--paolomoz.aem.page/cancer-types/breast-cancer?cb=' + Math.random(), { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(2000);
const c = await pg.evaluate(() => {
  const a = document.querySelector('main .section.dark a');
  return a ? getComputedStyle(a).color : 'NO LINK FOUND';
});
console.log('dark strip link color:', c);
await b.close();
