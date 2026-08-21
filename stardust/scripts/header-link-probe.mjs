import { chromium } from 'playwright';
const b = await chromium.launch();
for (const url of ['https://www.mdanderson.org/', 'https://main--mdanderson--paolomoz.aem.page/?cb=' + Math.random()]) {
  const pg = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await pg.waitForTimeout(3500);
  const r = await pg.evaluate(() => {
    const probe = (label, el) => el ? { label, text: (el.textContent||'').trim().slice(0,22), color: getComputedStyle(el).color } : { label, missing: true };
    const links = [...document.querySelectorAll('header a, nav a')].filter(a => a.offsetParent);
    const byText = (t) => links.find(a => a.textContent.trim().toUpperCase().startsWith(t));
    return [
      probe('utility(MyChart)', byText('MYCHART') || document.querySelector('header .mda-cta-list-container a')),
      probe('topline(CLINICAL TRIALS)', byText('CLINICAL TRIALS')),
      probe('topline(LOCATIONS)', byText('LOCATIONS')),
      probe('rednav(PATIENTS)', byText('PATIENTS')),
      probe('rednav(RESEARCH)', [...document.querySelectorAll('nav a, header nav a')].find(a => a.textContent.trim().toUpperCase() === 'RESEARCH')),
    ];
  });
  console.log(url.includes('mdanderson.org') ? 'ORIGINAL:' : 'DEPLOYED:', JSON.stringify(r, null, 1));
  await pg.context().close();
}
await b.close();
