import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
mkdirSync('stardust/validation/horizon', { recursive: true });
const F = 'file:///Users/paolo/stardust/2026-08/mdanderson/stardust/prototypes/horizon-cinematic.html';
const b = await chromium.launch();
const errors = [];
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0,120)); });
p.on('pageerror', e => errors.push('PAGEERROR ' + String(e).slice(0,120)));
await p.goto(F, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
await p.waitForTimeout(1600);
const boot = await p.evaluate(() => !!window.__lenis);
const H = await p.evaluate(() => document.body.scrollHeight);
const stops = [0, 0.25, 0.5, 0.75, 0.97];
const hidden = [];
for (const s of stops) {
  await p.evaluate(y => window.__lenis ? window.__lenis.scrollTo(y, {immediate:true}) : window.scrollTo(0, y), Math.round(s * (H - 900)));
  await p.waitForTimeout(900);
  const bad = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-anim]').forEach(el => {
      const r = el.getBoundingClientRect();
      const inView = r.top < innerHeight * 0.7 && r.bottom > 120 && r.width > 0;
      const op = parseFloat(getComputedStyle(el).opacity);
      if (inView && op < 0.55) out.push(el.className.toString().slice(0,40) + ' op=' + op.toFixed(2));
    });
    return out;
  });
  if (bad.length) hidden.push({ at: s, bad });
  await p.screenshot({ path: `stardust/validation/horizon/motion-1440-${Math.round(s*100)}.png` });
}
const count15 = await p.evaluate(() => document.querySelector('[data-countup]')?.textContent);
// reduced motion pass
const rm = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await rm.goto(F, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
await rm.waitForTimeout(1200);
const rmState = await rm.evaluate(() => {
  const ops = [...document.querySelectorAll('[data-anim]')].map(el => parseFloat(getComputedStyle(el).opacity));
  return { min: Math.min(...ops), countup: document.querySelector('[data-countup]')?.textContent };
});
console.log(JSON.stringify({ boot, count15, hidden, rmState, errors: errors.slice(0,5) }, null, 1));
await b.close();
