import { chromium } from 'playwright';
const [,, path='', width='1440', out='/tmp/deployed.png'] = process.argv;
const b = await chromium.launch(); const pg = await (await b.newContext({viewport:{width:+width,height:900}, deviceScaleFactor:1})).newPage();
await pg.goto(`https://main--mdanderson--paolomoz.aem.page${path}`, { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(2500);
for (let y=0;y<=1;y+=0.25){ await pg.evaluate(f=>window.scrollTo(0,document.body.scrollHeight*f),y); await pg.waitForTimeout(400);}
await pg.evaluate(()=>window.scrollTo(0,0)); await pg.waitForTimeout(600);
await pg.screenshot({ path: out, fullPage: true });
console.log('shot', out);
await b.close();
