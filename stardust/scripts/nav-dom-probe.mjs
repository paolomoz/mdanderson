import { chromium } from 'playwright';
const b = await chromium.launch(); const pg = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await pg.goto('https://main--mdanderson--paolomoz.aem.page/?cb=' + Math.random(), { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(3000);
const r = await pg.evaluate(() => {
  const a = [...document.querySelectorAll('header a')].find(x => x.textContent.trim() === 'Patients & Family');
  if (!a) return 'link not found';
  const chain = []; let n = a;
  while (n && n.tagName !== 'BODY' && chain.length < 8) { chain.push(n.tagName.toLowerCase() + (n.id ? '#'+n.id : '') + (n.classList.length ? '.'+[...n.classList].join('.') : '')); n = n.parentElement; }
  const cs = getComputedStyle(a);
  return { chain, color: cs.color, varBg: getComputedStyle(document.documentElement).getPropertyValue('--color-bg'),
    matchesWrapper: !!a.closest('.mda-nav-button-wrapper'), navId: !!a.closest('nav#nav'),
    stylesheetCount: document.styleSheets.length,
    headerCssLoaded: [...document.styleSheets].some(s => (s.href||'').includes('header.css')) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
