import { chromium } from 'playwright';
const files = ['a-frontpage', 'b-horizon', 'c-canvas', 'index'];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const f of files) {
  await page.goto(`file:///Users/paolo/stardust/2026-08/mdanderson/stardust/wireframes/${f}.html`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `stardust/wireframes/refs/shot-${f}.png`, fullPage: f !== 'index' });
  console.log('shot', f);
}
await browser.close();
