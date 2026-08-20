import { chromium } from 'playwright';
const b = await chromium.launch(); const pg = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0,150)));
await pg.goto('https://uplift-c--mdanderson--paolomoz.aem.page/uplift-c', { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(5000); // let loadLazy finish fully
const pre = await pg.evaluate(() => ({
  lenis: !!window.__lenis || document.documentElement.classList.contains('lenis'),
  sectionsLoaded: [...document.querySelectorAll('main .section')].map(s => s.dataset.sectionStatus),
  animEls: document.querySelectorAll('[data-anim]').length,
  inEls: document.querySelectorAll('[data-anim].in, [data-anim].is-in, [data-anim][data-anim-state="in"]').length,
}));
// slow scroll through the page in steps with settles (real-user-like)
for (let y = 0; y <= 1; y += 0.12) {
  await pg.mouse.wheel(0, 900); await pg.waitForTimeout(700);
}
await pg.waitForTimeout(1500);
const post = await pg.evaluate(() => {
  const cu = document.querySelector('[data-countup]');
  const why = document.querySelector('[data-anim]');
  const anims = [...document.querySelectorAll('[data-anim]')];
  const visible = anims.filter(el => parseFloat(getComputedStyle(el).opacity) > 0.9).length;
  return {
    countupText: cu ? cu.textContent.trim() : 'none',
    animTotal: anims.length,
    animVisible: visible,
    classesSample: anims.slice(0,3).map(e => e.className.toString().slice(0,60)),
  };
});
console.log(JSON.stringify({ pre, post, errs }, null, 1));
await b.close();
