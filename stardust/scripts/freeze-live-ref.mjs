// Freeze a CLEAN live reference for the fidelity gate.
// Same shot() methodology as fidelity-gate.mjs (viewport 1440, scroll-settle,
// chat/loyal hidden, fixed utility bar pinned to absolute) so the frozen ref
// carries none of the POC-era stitching artifacts. The gate prefers
// stardust/validation/gate/<slug>/live.png automatically.
//
// Usage: node stardust/scripts/freeze-live-ref.mjs <livePath>
import { chromium } from 'playwright';
import fs from 'fs';

const [, , livePath] = process.argv;
if (!livePath) { console.error('usage: freeze-live-ref.mjs <livePath>'); process.exit(2); }
const LIVE = 'https://www.mdanderson.org';

async function shot(url, out) {
  const b = await chromium.launch();
  const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
  await pg.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await pg.waitForTimeout(2500);
  for (let y = 0; y <= 1; y += 0.25) { await pg.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), y); await pg.waitForTimeout(400); }
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(800);
  await pg.evaluate(() => {
    document.querySelectorAll('[id*="loyal"],[class*="loyal"],iframe[src*="loyal"],iframe[title*="chat" i],[id*="guide-"],#onetrust-consent-sdk').forEach((n) => { n.style.visibility = 'hidden'; });
    document.querySelectorAll('.mda-cta-list-container').forEach((n) => { n.style.position = 'absolute'; });
  });
  await pg.screenshot({ path: out, fullPage: true });
  await b.close();
}

const slug = livePath.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'index';
const dir = `stardust/validation/gate/${slug}`;
fs.mkdirSync(dir, { recursive: true });
await shot(`${LIVE}${livePath}`, `${dir}/live.png`);
console.log(`frozen ${dir}/live.png`);
