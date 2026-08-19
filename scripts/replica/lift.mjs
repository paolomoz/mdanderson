// replica Phase-3 CSS lift — per-page, per-breakpoint layout map + token harvest.
// Usage: node scripts/replica/lift.mjs <url> <slug> [--widths 1440,360] [--out stardust/replica/capture]
// Emits:
//   <out>/<slug>/<width>.json   layout map: visible elements w/ selector path, rect, computed styles
//   <out>/css/<hash>.css        every stylesheet response body (shared, deduped)
//   stardust/current/assets/fonts/<name>  every font response
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const [,, url, slug, ...rest] = process.argv;
if (!url || !slug) { console.error('usage: lift.mjs <url> <slug> [--widths 1440,360]'); process.exit(2); }
let widths = [1440, 360];
let out = 'stardust/replica/capture';
for (let i = 0; i < rest.length; i += 1) {
  if (rest[i] === '--widths') widths = rest[(i += 1)].split(',').map(Number);
  else if (rest[i] === '--out') out = rest[(i += 1)];
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const HEADERS = { 'Accept-Language': 'en-US,en;q=0.9', 'Upgrade-Insecure-Requests': '1' };

const PROPS = [
  'display','position','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing',
  'textTransform','textAlign','color','backgroundColor','backgroundImage','backgroundSize','backgroundPosition',
  'paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft',
  'borderRadius','border','borderTop','borderBottom','boxShadow','maxWidth','width','height','minHeight',
  'flexDirection','justifyContent','alignItems','gap','gridTemplateColumns','textDecoration','overflow','zIndex','opacity','objectFit','aspectRatio',
];

const browser = await chromium.launch({ headless: true });
const cssDir = path.join(out, 'css');
const fontsDir = 'stardust/current/assets/fonts';
await mkdir(cssDir, { recursive: true });
await mkdir(fontsDir, { recursive: true });
await mkdir(path.join(out, slug), { recursive: true });

const cssSeen = new Set();
const fontSeen = new Set();

for (const width of widths) {
  const ctx = await browser.newContext({
    userAgent: UA, extraHTTPHeaders: HEADERS,
    viewport: { width, height: width < 800 ? 844 : 900 },
    deviceScaleFactor: 1, reducedMotion: 'reduce',
    isMobile: width < 800, hasTouch: width < 800,
  });
  const page = await ctx.newPage();
  page.on('response', async (resp) => {
    try {
      const u = resp.url();
      const ct = (resp.headers()['content-type'] || '');
      if (/text\/css/.test(ct) || u.endsWith('.css')) {
        const body = await resp.text().catch(() => null);
        if (body) {
          const h = createHash('sha1').update(u).digest('hex').slice(0, 10);
          if (!cssSeen.has(h)) { cssSeen.add(h); await writeFile(path.join(cssDir, `${h}.css`), `/* ${u} */\n${body}`); }
        }
      } else if (/font\//.test(ct) || /\.(woff2?|ttf|otf)(\?|$)/.test(u)) {
        const name = path.basename(new URL(u).pathname);
        if (!fontSeen.has(name)) {
          fontSeen.add(name);
          const buf = await resp.body().catch(() => null);
          if (buf) await writeFile(path.join(fontsDir, name), buf);
        }
      }
    } catch { /* best-effort harvest */ }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  // dismiss consent + survey (same classes as crawl)
  await page.evaluate(() => {
    const sels = ['#onetrust-accept-btn-handler', '[aria-label*="Accept" i]', 'button[id*="accept" i]'];
    for (const s of sels) { const el = document.querySelector(s); if (el) { el.click(); break; } }
  }).catch(() => {});
  await page.waitForTimeout(500);
  for (const frame of page.frames()) {
    await frame.evaluate(() => {
      const btns = [...document.querySelectorAll('a,button')];
      const no = btns.find((b) => /^\s*(no,?\s*thanks|decline|not now)\s*$/i.test(b.textContent || ''));
      if (no) no.click();
    }).catch(() => {});
  }
  // lazy-load settle
  for (let y = 0; y <= 1; y += 0.34) {
    await page.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), y);
    await page.waitForTimeout(350);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.mouse.move(4, 800);

  const map = await page.evaluate((props) => {
    const vis = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 || r.height > 0;
    };
    const selPath = (el) => {
      const parts = [];
      let n = el;
      while (n && n.nodeType === 1 && parts.length < 5) {
        let p = n.tagName.toLowerCase();
        if (n.id) p += `#${n.id}`;
        else if (n.classList.length) p += `.${[...n.classList].slice(0, 3).join('.')}`;
        parts.unshift(p);
        n = n.parentElement;
      }
      return parts.join(' > ');
    };
    const els = [...document.querySelectorAll('body *')].filter((el) => {
      if (['SCRIPT','STYLE','NOSCRIPT','LINK','META','svg','path','IFRAME'].includes(el.tagName)) return false;
      if (el.closest('svg')) return false;
      return vis(el);
    });
    const scrollY = window.scrollY;
    const records = els.slice(0, 2500).map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const st = {};
      for (const p of props) { const v = cs[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px') st[p] = v; }
      const rec = {
        sel: selPath(el), tag: el.tagName.toLowerCase(),
        rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
        st,
      };
      const txt = (el.childElementCount === 0 ? el.textContent : '').trim();
      if (txt) rec.text = txt.slice(0, 160);
      if (el.tagName === 'IMG') rec.src = el.currentSrc || el.src;
      if (el.tagName === 'A') rec.href = el.getAttribute('href');
      return rec;
    });
    return {
      url: location.href, width: innerWidth, docHeight: document.documentElement.scrollHeight,
      bodyFont: getComputedStyle(document.body).fontFamily,
      htmlFontSize: getComputedStyle(document.documentElement).fontSize,
      count: records.length, totalVisible: els.length, records,
    };
  }, PROPS);

  await writeFile(path.join(out, slug, `${width}.json`), JSON.stringify(map));
  console.error(`[lift] ${slug} @${width}: ${map.count}/${map.totalVisible} elements, docHeight ${map.docHeight}`);
  await ctx.close();
}
await browser.close();
console.error(`[lift] css files: ${cssSeen.size}, fonts: ${fontSeen.size}`);
