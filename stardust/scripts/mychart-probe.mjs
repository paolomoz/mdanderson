import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, url] of [['ORIGINAL','https://www.mdanderson.org/'], ['DEPLOYED','https://main--mdanderson--paolomoz.aem.page/?cb=' + Math.random()]]) {
  const pg = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await pg.waitForTimeout(3000);
  const r = await pg.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find(x => x.textContent.replace(/\s/g,'') === 'MyChart' && x.offsetParent);
    if (!a) return 'not found';
    return {
      html: a.outerHTML.slice(0, 220),
      parts: [...a.childNodes].map(n => n.nodeType === 3
        ? { text: n.textContent.trim(), color: getComputedStyle(a).color }
        : { text: n.textContent.trim(), color: getComputedStyle(n).color }).filter(p => p.text),
      bg: getComputedStyle(a.closest('li,div')).backgroundColor,
    };
  });
  console.log(name, JSON.stringify(r, null, 1));
  await pg.context().close();
}
await b.close();
