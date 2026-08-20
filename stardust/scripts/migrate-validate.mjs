#!/usr/bin/env node
// migrate-validate.mjs — master validation for the migrated tree: render
// representative pages at 1440/768/390 via file://, assert no console errors,
// no missing local (file://) assets, no horizontal overflow; save screenshots.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const PAGES = [
  { slug: 'index', file: 'stardust/migrated/index.html' },
  { slug: 'cancer-types-breast-cancer-html', file: 'stardust/migrated/cancer-types/breast-cancer.html' }
];
const VIEWPORTS = [{ w: 1440, h: 900 }, { w: 768, h: 1024 }, { w: 390, h: 844 }];
const MIGRATED = path.join(ROOT, 'stardust/migrated');

const browser = await chromium.launch();
let failures = 0;
for (const pg of PAGES) {
  const outDir = path.join(ROOT, 'stardust/validation', `migrated-${pg.slug}`);
  fs.mkdirSync(outDir, { recursive: true });
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const failedLocal = [];
    const failedRemote = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('requestfailed', (r) => {
      const u = r.url();
      if (u.startsWith('file://') && fileURLToPath(u).startsWith(MIGRATED)) failedLocal.push(u);
      else if (/^https?:/.test(u)) failedRemote.push(`${u} (${r.failure()?.errorText})`);
    });
    await page.goto(pathToFileURL(path.join(ROOT, pg.file)).toString(), { waitUntil: 'networkidle', timeout: 60000 }).catch(async () => {
      await page.waitForTimeout(3000);
    });
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
      return { scrollW: d.scrollWidth, clientW: d.clientWidth, overflow: d.scrollWidth > d.clientWidth };
    });
    await page.screenshot({ path: path.join(outDir, `${vp.w}.png`), fullPage: false });
    const bad = consoleErrors.length || failedLocal.length || overflow.overflow;
    if (bad) failures++;
    console.log(`${pg.slug} @${vp.w}: consoleErrors=${consoleErrors.length} failedLocalAssets=${failedLocal.length} hOverflow=${overflow.overflow} (${overflow.scrollW}/${overflow.clientW}) remoteFailures=${failedRemote.length}${bad ? '  << FAIL' : '  OK'}`);
    for (const e of consoleErrors.slice(0, 5)) console.log('   console:', e.slice(0, 160));
    for (const f of failedLocal.slice(0, 5)) console.log('   local-missing:', f);
    for (const f of failedRemote.slice(0, 3)) console.log('   remote:', f.slice(0, 140));
    await ctx.close();
  }
}
await browser.close();
process.exit(failures ? 1 : 0);
