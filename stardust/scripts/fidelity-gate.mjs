// Replica fidelity gate — the POC-completion quality bar.
// Compares the deployed EDS page against a FROZEN live snapshot (captured on
// first run and reused thereafter — matches POC gate methodology, avoids
// live-content-drift noise from rotating carousels / call-tracking numbers).
// PASS = pixel diff ≤ threshold (default 10%, POC convention; achieved 1.6–4.4%)
// AND height Δ ≤ 10%. Appends to stardust/migration-plan/fidelity-log.tsv.
//
// Usage: node stardust/scripts/fidelity-gate.mjs <livePath> [edsPath] [threshold]
//   node stardust/scripts/fidelity-gate.mjs /treatment-options/brachytherapy.html
// Refresh the frozen snapshot by deleting stardust/validation/gate/<slug>/live.png
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';

const [, , livePath, edsPathArg, thresholdArg] = process.argv;
if (!livePath) { console.error('usage: fidelity-gate.mjs <livePath> [edsPath] [threshold%]'); process.exit(2); }
const edsPath = edsPathArg || livePath.replace(/\.html$/, '');
const threshold = Number(thresholdArg || 10);
const EDS = 'https://main--mdanderson--paolomoz.aem.page';
const LIVE = 'https://www.mdanderson.org';

async function shot(url, out) {
  const b = await chromium.launch();
  const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
  await pg.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await pg.waitForTimeout(2500);
  for (let y = 0; y <= 1; y += 0.25) { await pg.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), y); await pg.waitForTimeout(400); }
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(800);
  // hide cross-env noise (chat launcher, consent overlays) and pin the fixed
  // utility bar to absolute — full-page shots can repaint fixed chrome
  // mid-page (the artifact that inflated the homepage gate to 10.5%);
  // applied to BOTH live and EDS shots so the comparison stays symmetric
  await pg.evaluate(() => {
    document.querySelectorAll('[id*="loyal"],[class*="loyal"],iframe[src*="loyal"],iframe[title*="chat" i],[id*="guide-"],#onetrust-consent-sdk,.privacy_prompt').forEach((n) => { n.style.visibility = 'hidden'; });
    document.querySelectorAll('.mda-cta-list-container').forEach((n) => { n.style.position = 'absolute'; });
  });
  await pg.screenshot({ path: out, fullPage: true });
  await b.close();
}

const slug = livePath.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'index';
const dir = `stardust/validation/gate/${slug}`;
fs.mkdirSync(dir, { recursive: true });
const liveShot = `${dir}/live.png`;
const edsShot = `${dir}/eds.png`;
// Reference precedence: gate-dir frozen snapshot (this script's methodology:
// chat hidden, single chrome paint) > POC-era gate ref > fresh freeze.
// POC refs can carry screenshot-stitching artifacts (fixed utility bar
// repainted mid-page, chat bubble) — delete the gate-dir live.png only to
// force a re-freeze, not to fall back to the POC ref.
const pocRef = `stardust/replica/gates/${slug}-1440/live.png`;
let refShot = liveShot;
if (!fs.existsSync(liveShot)) {
  if (fs.existsSync(pocRef)) refShot = pocRef;
  else await shot(`${LIVE}${livePath}`, liveShot);
}
await shot(`${EDS}${edsPath}`, edsShot);

const a = PNG.sync.read(fs.readFileSync(refShot));
const b = PNG.sync.read(fs.readFileSync(edsShot));
const w = Math.min(a.width, b.width);
const h = Math.min(a.height, b.height);
const crop = (img) => { const out = new PNG({ width: w, height: h }); PNG.bitblt(img, out, 0, 0, w, h, 0, 0); return out; };
const diffImg = new PNG({ width: w, height: h });
const bad = pixelmatch(crop(a).data, crop(b).data, diffImg.data, w, h, { threshold: 0.1 });
fs.writeFileSync(`${dir}/diff.png`, PNG.sync.write(diffImg));
const heightPenalty = Math.abs(a.height - b.height) / Math.max(a.height, b.height) * 100;
const pct = (bad / (w * h)) * 100;
const verdict = pct <= threshold && heightPenalty <= 10 ? 'PASS' : 'FAIL';
fs.appendFileSync('stardust/migration-plan/fidelity-log.tsv',
  `${new Date().toISOString()}\t${livePath}\t${edsPath}\t${pct.toFixed(2)}%\theightΔ ${heightPenalty.toFixed(1)}%\t${verdict}\tref:${refShot === pocRef ? 'poc-gate' : 'frozen-live'}\n`);
console.log(`${verdict} ${livePath} — pixel diff ${pct.toFixed(2)}% (threshold ${threshold}%), height Δ ${heightPenalty.toFixed(1)}% (ref ${a.height}px vs eds ${b.height}px), ref=${refShot}`);
process.exit(verdict === 'PASS' ? 0 : 1);
