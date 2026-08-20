// stardust:uplift — validation cascade (prototype SKILL.md Phases 2.5–2.8 substance)
// Usage: node stardust/uplift/scripts/validate.mjs <a|b|c>
import { chromium } from 'playwright';
import fs from 'node:fs';

const variant = process.argv[2];
const url = `http://localhost:8791/uplift-${variant}.html`;
const outDir = `stardust/validation/uplift-${variant}`;
fs.mkdirSync(outDir, { recursive: true });

const report = { variant, url, at: new Date().toISOString(), viewports: {}, mobileNavAudit: {}, audit: {}, motion: null, verdict: null };
const problems = [];

const browser = await chromium.launch();

function collect(page, bucket) {
  page.on('console', m => { if (m.type() === 'error') bucket.consoleErrors.push(m.text()); });
  page.on('pageerror', e => bucket.pageErrors.push(String(e)));
  page.on('requestfailed', r => bucket.failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`));
  page.on('response', r => { if (r.status() >= 400) bucket.failedRequests.push(`${r.url()} :: HTTP ${r.status()}`); });
}

// ---- Pass A: multi-viewport render (1440 / 768 / 390) — console clean, no overflow, screenshots
for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const bucket = { consoleErrors: [], pageErrors: [], failedRequests: [] };
  collect(page, bucket);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  const overflow = await page.evaluate(() => {
    const d = document.documentElement, b = document.body;
    return { doc: d.scrollWidth - d.clientWidth, body: b.scrollWidth - b.clientWidth };
  });
  // broken images
  const brokenImgs = await page.evaluate(() =>
    [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src));
  await page.screenshot({ path: `${outDir}/${w}.png`, fullPage: true });
  const vp = { consoleErrors: bucket.consoleErrors, pageErrors: bucket.pageErrors,
               failedRequests: bucket.failedRequests, overflowPx: overflow, brokenImgs };
  report.viewports[w] = vp;
  if (bucket.consoleErrors.length || bucket.pageErrors.length) problems.push(`${w}px: console/page errors`);
  if (bucket.failedRequests.length) problems.push(`${w}px: failed requests ${bucket.failedRequests.length}`);
  if (overflow.doc > 0 || overflow.body > 0) problems.push(`${w}px: horizontal overflow ${JSON.stringify(overflow)}`);
  if (brokenImgs.length) problems.push(`${w}px: broken images ${brokenImgs.length}`);
  await ctx.close();
}

// ---- Pass B (2.7 mobile-adapt audit specifics at 360×800)
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const res = await page.evaluate(() => {
    const d = document.documentElement, b = document.body;
    const overflow = Math.max(d.scrollWidth - d.clientWidth, b.scrollWidth - b.clientWidth);
    let minFont = 999, minGap = 999;
    document.querySelectorAll('header nav *').forEach(el => {
      const cs = getComputedStyle(el);
      if (el.textContent.trim() && cs.display !== 'none') minFont = Math.min(minFont, parseFloat(cs.fontSize));
    });
    document.querySelectorAll('header nav').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.display.includes('flex') || cs.display.includes('grid')) {
        const g = parseFloat(cs.columnGap || cs.gap || '999');
        if (!Number.isNaN(g)) minGap = Math.min(minGap, g);
      }
    });
    const meta = document.querySelector('meta[name="viewport"]')?.content || null;
    const mediaRules = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } })
      .filter(r => r.media && /max-width/.test(r.media.mediaText))
      .map(r => r.media.mediaText);
    const narrowest = Math.min(...mediaRules.map(t => parseInt((t.match(/max-width:\s*(\d+)/) || [])[1] || '99999')));
    return { overflow, minNavFont: minFont === 999 ? null : minFont, minNavGap: minGap === 999 ? null : minGap, viewportMeta: meta, narrowestBreakpoint: narrowest, mediaRuleCount: mediaRules.length };
  });
  report.mobileNavAudit = res;
  if (res.overflow > 0) problems.push(`360px: horizontal-overflow-at-360px (${res.overflow}px)`);
  if (res.minNavFont !== null && res.minNavFont < 11) problems.push('360px: nav-readability-floor (font)');
  if (res.minNavGap !== null && res.minNavGap < 10) problems.push('360px: nav-readability-floor (gap)');
  if (!res.viewportMeta || !/width=device-width/.test(res.viewportMeta)) problems.push('viewport meta missing');
  if (!(res.narrowestBreakpoint <= 640)) problems.push('no <=640px breakpoint');
  await ctx.close();
}

// ---- Pass C (2.6 audit specifics): LCP attrs + contrast computation of rendered text pairs
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  const audit = await page.evaluate(() => {
    // LCP image
    let lcp = null;
    for (const img of document.images) {
      const r = img.getBoundingClientRect();
      if (r.width > 100 && r.height > 60 && r.top < innerHeight && r.bottom > 0) {
        lcp = { src: img.src.split('/').pop(), loading: img.loading, fetchpriority: img.getAttribute('fetchpriority') };
        break;
      }
    }
    // contrast: sample visible text elements against effective background
    function lum(rgb) {
      const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    function parse(c) { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? { c: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] } : null; }
    function bgOf(el) {
      let e = el;
      while (e && e !== document.documentElement) {
        const p = parse(getComputedStyle(e).backgroundColor);
        if (p && p.a >= 0.9) return p.c;
        // element with a background image we cannot average — mark as image
        if (getComputedStyle(e).backgroundImage !== 'none') return null;
        if (e.tagName === 'IMG') return null;
        e = e.parentElement;
      }
      return [255, 255, 255];
    }
    const fails = [];
    const seen = new Set();
    document.querySelectorAll('main *, footer *, header *').forEach(el => {
      if (!el.childNodes.length) return;
      const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2);
      if (!hasText) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return;
      const r = el.getBoundingClientRect();
      if (r.width < 5 || r.height < 5) return;
      const fg = parse(cs.color); if (!fg) return;
      // skip elements over images/scrims (hero/story) — judged visually
      let e = el, overImage = false;
      while (e && e !== document.body) {
        if (e.querySelector?.(':scope > img.hero-bg, :scope > img.story-bg')) { overImage = true; break; }
        if (/hero|story/.test(e.className) && e.tagName === 'SECTION') { overImage = true; break; }
        e = e.parentElement;
      }
      if (overImage) return;
      const bg = bgOf(el); if (!bg) return;
      const L1 = lum(fg.c), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const px = parseFloat(cs.fontSize);
      const bold = +cs.fontWeight >= 700;
      const large = px >= 24 || (px >= 18.66 && bold);
      const min = large ? 3 : 4.5;
      if (ratio < min) {
        const key = `${cs.color}|${bg.join(',')}|${el.tagName}`;
        if (!seen.has(key)) { seen.add(key); fails.push({ tag: el.tagName, cls: String(el.className).slice(0, 40), text: el.textContent.trim().slice(0, 40), ratio: +ratio.toFixed(2), min, px }); }
      }
    });
    return { lcp, contrastFails: fails.slice(0, 20) };
  });
  report.audit = audit;
  if (audit.lcp && (audit.lcp.loading === 'lazy' || audit.lcp.fetchpriority !== 'high')) problems.push('LCP image not eager/high-priority');
  if (audit.contrastFails.length) problems.push(`contrast failures: ${audit.contrastFails.length}`);
  await ctx.close();
}

// ---- Pass D (2.8 / Pass 6) — motion gates, variant C only
if (variant === 'c') {
  const motion = { probes: [], reducedMotion: {}, noJs: {}, scrollJack: {}, cliff: {}, lenisBoot: null };

  // 6a Lenis boot + scroll probes + 6d screenshots
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const bucket = { consoleErrors: [], pageErrors: [], failedRequests: [] };
  collect(page, bucket);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  motion.lenisBoot = await page.evaluate(() => !!(window.__lenis && typeof window.__lenis.scroll === 'number'));
  if (!motion.lenisBoot) problems.push('6a: Lenis boot failed');
  if (bucket.consoleErrors.length || bucket.pageErrors.length) problems.push('6a: console errors during boot');

  const dims = await page.evaluate(() => ({ heroH: document.querySelector('.hero').offsetHeight, totalH: document.documentElement.scrollHeight, vh: innerHeight }));
  const positions = [0, Math.round(0.5 * dims.heroH), Math.round(0.95 * dims.heroH), dims.heroH + 200,
    Math.round(0.45 * dims.totalH), Math.round(0.65 * dims.totalH), Math.round(0.85 * dims.totalH), dims.totalH - dims.vh];
  for (const y of positions) {
    await page.evaluate(yy => window.__lenis.scrollTo(yy, { immediate: true }), y);
    await page.waitForTimeout(500);
    const hidden = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width < 80 || r.height < 24) return;
        if (r.bottom < 0 || r.top > innerHeight) return;
        const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2);
        const isMedia = /^(IMG|SVG|VIDEO|PICTURE)$/.test(el.tagName);
        if (!hasText && !isMedia) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || el.getAttribute('aria-hidden') === 'true') return;
        // effective opacity along ancestor chain
        let e = el, op = 1;
        while (e && e !== document.documentElement) { op *= +getComputedStyle(e).opacity; e = e.parentElement; }
        if (op < 0.05) out.push({ tag: el.tagName, cls: String(el.className).slice(0, 40), top: Math.round(r.top) });
      });
      return out.slice(0, 8);
    });
    const overlaps = await page.evaluate(() => {
      const secs = [...document.querySelectorAll('[data-section]')].map(el => {
        const r = el.getBoundingClientRect();
        const sY = window.__lenis.scroll;
        return { k: el.getAttribute('data-section'), top: r.top + sY, bottom: r.bottom + sY };
      });
      const out = [];
      for (let i = 0; i < secs.length - 1; i++) {
        // header contains nested? skip pairs where one contains the other by checking order only among siblings in main
      }
      const mains = secs.filter(s => !['header', 'footer', 'mission'].includes(s.k));
      for (let i = 0; i < mains.length - 1; i++) {
        if (mains[i].bottom > mains[i + 1].top + 1.5) out.push({ a: mains[i].k, b: mains[i + 1].k, by: +(mains[i].bottom - mains[i + 1].top).toFixed(1) });
      }
      return out;
    });
    motion.probes.push({ scrollY: y, hidden, overlaps });
  }
  // 6d screenshots
  await page.evaluate(() => window.__lenis.scrollTo(0, { immediate: true })); await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/cine-top.png` });
  await page.evaluate(() => window.__lenis.scrollTo(900, { immediate: true })); await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/cine-mid.png` });
  await page.evaluate(() => window.__lenis.scrollTo(2400, { immediate: true })); await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/cine-deep.png` });

  // 6c scroll-jack: keyboard + programmatic + scrollable within 250ms
  await page.evaluate(() => window.__lenis.scrollTo(0, { immediate: true })); await page.waitForTimeout(300);
  await page.mouse.wheel(0, 600); await page.waitForTimeout(700);
  const wheelScroll = await page.evaluate(() => window.__lenis.scroll);
  await page.keyboard.press('End'); await page.waitForTimeout(900);
  const keyScroll = await page.evaluate(() => window.scrollY || window.__lenis.scroll);
  motion.scrollJack = { wheelScroll: Math.round(wheelScroll), keyEndScroll: Math.round(keyScroll) };
  if (wheelScroll < 100) problems.push('6c: wheel scroll blocked');

  // 6f cliff detector
  motion.cliff = await page.evaluate(() => ({
    animElementCount: document.querySelectorAll('[data-anim], [data-tile-anim]').length,
    infiniteLoops: [...document.querySelectorAll('*')].filter(el => {
      const cs = getComputedStyle(el);
      return cs.animationIterationCount.includes('infinite') && cs.animationName !== 'none';
    }).length,
    liveSweeps: document.querySelectorAll('.live-sweep').length,
  }));
  motion.cliff.maxSectionStaggerMs = 5 * 90; // stagger 0.10 progress * mod6 ≈ 90ms equivalent steps
  motion.cliff.maxParallaxVh = 35;
  if (motion.cliff.animElementCount > 80) problems.push('6f: anim overload');
  if (motion.cliff.infiniteLoops > 2) problems.push('6f: >2 infinite loops');
  await ctx.close();

  // 6b reduced motion
  {
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p2 = await ctx2.newPage();
    await p2.goto(url, { waitUntil: 'networkidle' });
    await p2.waitForTimeout(800);
    motion.reducedMotion = await p2.evaluate(() => {
      const bad = [];
      document.querySelectorAll('[data-anim]').forEach(el => {
        const cs = getComputedStyle(el);
        if (+cs.opacity < 0.95) bad.push('opacity:' + el.className);
        if (cs.transform !== 'none' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(cs.transform)) bad.push('transform:' + el.className);
      });
      const cu = document.querySelector('[data-countup]');
      const countOk = cu ? cu.textContent.trim() === cu.getAttribute('data-countup') : true;
      const wm = document.querySelector('.site-footer__wordmark');
      const wmOk = wm ? (getComputedStyle(wm).clipPath === 'none') : true;
      return { badElements: bad.slice(0, 10), countupForced: countOk, wordmarkVisible: wmOk };
    });
    if (motion.reducedMotion.badElements.length || !motion.reducedMotion.countupForced || !motion.reducedMotion.wordmarkVisible)
      problems.push('6b: reduced-motion fallback incomplete');
    await ctx2.close();
  }

  // Pass 4: no-JS state
  {
    const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const p3 = await ctx3.newPage();
    await p3.goto(url, { waitUntil: 'load' });
    await p3.waitForTimeout(500);
    motion.noJs = await p3.evaluate(() => {
      const bad = [];
      document.querySelectorAll('[data-anim]').forEach(el => {
        const cs = getComputedStyle(el);
        if (+cs.opacity < 0.95 || (cs.transform !== 'none' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(cs.transform))) bad.push(el.className || el.tagName);
      });
      const cu = document.querySelector('[data-countup]');
      const wm = document.querySelector('.site-footer__wordmark');
      return { hiddenWithoutJs: bad.slice(0, 10), countupStatic: cu ? cu.textContent.trim() : null, wordmarkClip: wm ? getComputedStyle(wm).clipPath : null };
    });
    if (motion.noJs.hiddenWithoutJs.length) problems.push('Pass4: content hidden without JS');
    if (motion.noJs.countupStatic !== '15') problems.push('Pass4: countup fallback not 15');
    await ctx3.close();
  }

  // mobile motion fallback screenshot
  {
    const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p4 = await ctx4.newPage();
    await p4.goto(url, { waitUntil: 'networkidle' });
    await p4.waitForTimeout(1200);
    await p4.screenshot({ path: `${outDir}/cine-mobile.png` });
    await ctx4.close();
  }

  report.motion = motion;
}

await browser.close();
report.problems = problems;
report.verdict = problems.length ? 'FINDINGS' : 'PASS';
fs.writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ variant, verdict: report.verdict, problems }, null, 2));
