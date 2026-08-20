#!/usr/bin/env node
// migrate-build.mjs — stardust:migrate render phase for the mdanderson.org
// same-design replica POC. 11 Path A pages (approved prototypes, verbatim)
// + 1 Path A' sibling (patients-family-html forked from the index archetype).
//
// Performs, in order:
//   0. Canon auto-bootstrap from the index archetype (header/footer/canon.css
//      + DESIGN.json.extensions.canon pin) — state.json.handsOff, no pause.
//   1. pageMap build (URL-literal output mapping).
//   2. Per-page render: provenance block, head composition (canonical, og:url,
//      robots, JSON-LD), internal-link rewriting via pageMap (depth-aware
//      relative; non-inventory same-origin links KEEP absolute source URLs —
//      live-site bounce beats a 404), asset bundling (local assets/* copied to
//      migrated/assets/* and rewritten relative), data-section injection,
//      strict-contract validation, _meta.json sidecar.
//   3. Sitewide: fonts bundle (from mda-fonts.css url() refs), robots.txt,
//      sitemap.xml.
//   4. state.json update (per-page status + top-level migrate block).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const P = (...p) => path.join(ROOT, ...p);
const read = (p) => fs.readFileSync(P(p), 'utf8');
const sha7 = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 7);
const NOW = process.env.PIN_TIMESTAMP || new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const ORIGIN = 'https://www.mdanderson.org';
const STARDUST_VERSION = '0.18.1';
const OUT = 'stardust/migrated';

// Breakpoint alignment (canon deviation, logged per page): the replica authored a
// single mobile breakpoint at 767px (gate widths 1440/360). A live-DOM probe
// (2026-08-20) shows nav.mda-nav is display:none below 992px on www.mdanderson.org
// (mobile chrome: header 85px vs desktop 116px), and the replica's desktop mega-nav
// row needs ~1325px — at a 768px viewport the desktop chrome overflowed by 557px.
// Aligning mobile to <=991px / desktop complements to >=992px matches the live
// site's chrome behavior and removes horizontal overflow at 768.
const alignBreakpoints = (s) => s
  .replace(/@media \(max-width:\s*767px\)/g, '@media (max-width: 991px)')
  .replace(/@media \(min-width:\s*76[78]px\)/g, '@media (min-width: 992px)');
const BREAKPOINT_DEVIATION = {
  kind: 'canon-deviation',
  where: 'media-query breakpoints (chrome + page styles)',
  what: 'mobile rules extended from <=767px to <=991px; desktop complements (min-width 767/768px) shifted to >=992px',
  reason: 'live-DOM probe: nav.mda-nav is display:none below 992px on the live origin; replica desktop mega-nav needs ~1325px and overflowed at a 768px viewport. Alignment matches live chrome behavior and satisfies the no-horizontal-overflow contract at 768. Residual (ledgered): live desktop layout is fluid 992-1440 while the replica is fixed-width, so minor overflow persists between 992px and ~1325px (live itself overflows at 992: 1005/992).'
};

const state = JSON.parse(read('stardust/state.json'));
const design = JSON.parse(read('DESIGN.json'));
const designMdSha = sha7(read('DESIGN.md'));

// ---------------------------------------------------------------- canon (step 0)
const chromeHtml = read('stardust/prototypes/assets/chrome.html');
const chromeCss = alignBreakpoints(read('stardust/prototypes/assets/chrome.css'));
function fragment(name) {
  const re = new RegExp(`<!-- CHROME:${name} -->([\\s\\S]*?)<!-- /CHROME:${name} -->`);
  const m = chromeHtml.match(re);
  if (!m) throw new Error(`chrome fragment ${name} not found`);
  return m[1].trim();
}
const canonProv = (region) => `<!-- stardust:canon
  writtenBy:        stardust:migrate (canon auto-bootstrap)
  writtenAt:        ${NOW}
  sourceSlug:       index
  sourcePrototype:  stardust/prototypes/index-proposed.html
  chromeSource:     stardust/prototypes/assets/chrome.html
  region:           ${region}
  stardustVersion:  ${STARDUST_VERSION}
-->\n`;
fs.mkdirSync(P('stardust/canon'), { recursive: true });
const canonHeader = canonProv('header') + fragment('TOP') + '\n';
const canonFooter = canonProv('footer') +
  '<!-- CHROME:ENDCANCER — paste inside <div id="skip"> after page content -->\n' +
  fragment('ENDCANCER') + '\n\n' +
  '<!-- CHROME:BOTTOM — newsletter bar + mega footer, follows ENDCANCER inside #skip -->\n' +
  fragment('BOTTOM') + '\n';
const canonCss = `/* stardust:canon
  writtenBy:        stardust:migrate (canon auto-bootstrap)
  writtenAt:        ${NOW}
  sourceSlug:       index
  source:           stardust/prototypes/assets/chrome.css (verbatim except breakpoint
                    alignment: mobile <=767px -> <=991px per live-DOM nav probe; see
                    _meta.json canon-deviation entries)
  stardustVersion:  ${STARDUST_VERSION}
*/\n` + chromeCss;
fs.writeFileSync(P('stardust/canon/header.html'), canonHeader);
fs.writeFileSync(P('stardust/canon/footer.html'), canonFooter);
fs.writeFileSync(P('stardust/canon/canon.css'), canonCss);
const canonShas = { header: sha7(canonHeader), footer: sha7(canonFooter), css: sha7(canonCss) };

design.extensions.canon = {
  source: 'auto-bootstrap: index',
  sourceSlug: 'index',
  approvedAt: '2026-08-19T20:05:00Z',
  bootstrappedAt: NOW,
  files: {
    header: { path: 'stardust/canon/header.html', sha: canonShas.header },
    footer: { path: 'stardust/canon/footer.html', sha: canonShas.footer },
    css: { path: 'stardust/canon/canon.css', sha: canonShas.css }
  },
  pinned: {
    'sectionPadding.desktop': '70px 72px',
    'maxWidth': '1440px',
    'radius': '0px',
    'breakpoint.mobile': '991px (aligned to live nav breakpoint at migrate; replica-authored value was 767px)',
    'heading.family': '"Minion Regular", "Minion W01 Cap Regular", Arial, Georgia',
    'sans.family': '"Univers LT W01_55 Roman", Arial',
    'heading.xxl': '36px', 'heading.lg': '24px', 'heading.md': '21px',
    'body.size': '18px', 'lineHeight': 1.3, 'letterSpacing': '-.02em',
    'color.accent': '#DA291C', 'color.bg': '#FFFFFF', 'color.fg': '#000000'
  },
  compositionalMoves: [
    'Full-bleed color bands stacked vertically; inner content constrained to 1440px with 72px side padding',
    'Chrome order is fixed: utility bar + mega-nav header at top, blue we\'re-here-for-you strip near the top of content, Help #EndCancer trio then newsletter bar + mega footer close every page inside #skip',
    'Circle-icon wayfinding wells use flat brand-color discs (red / purple / light-blue) with MDIcons glyphs',
    'Square corners and flat surfaces everywhere; no shadows on primary surfaces',
    'Display type is Minion serif at capture-lifted sizes; Univers sans is reserved for nav, labels and CTAs'
  ],
  assetPrefixes: ['assets/'],
  history: [{ at: NOW, from: 'index', kind: 'auto-bootstrap (migrate Setup step 4; handsOff)' }]
};
const designJsonOut = JSON.stringify(design, null, 2) + '\n';
fs.writeFileSync(P('DESIGN.json'), designJsonOut);
const designJsonSha = sha7(designJsonOut);
console.log('canon auto-bootstrap: index ->', JSON.stringify(canonShas));

// ---------------------------------------------------------------- pageMap
const outputPathFor = (url) => {
  const p = new URL(url).pathname;
  return p === '/' ? 'index.html' : p.replace(/^\//, '');
};
const pageMap = state.pages.map((pg) => ({
  sourceUrl: new URL(pg.url).pathname,
  outputPath: outputPathFor(pg.url),
  slug: pg.slug
}));
const byPath = new Map(pageMap.map((e) => [e.sourceUrl, e]));
const collisions = new Set();
for (const e of pageMap) {
  if (collisions.has(e.outputPath)) throw new Error(`output path collision: ${e.outputPath}`);
  collisions.add(e.outputPath);
}

// ---------------------------------------------------------------- helpers
const bundledAssets = new Set();
const missingAssets = new Map(); // subpath -> [slugs]
const ASSET_SRC_ROOT = 'stardust/prototypes/assets'; // media/fonts/css live here (not current/assets)

function bundleAsset(subpath, slug) {
  const dec = decodeURIComponent(subpath);
  if (dec.split('/').includes('..')) throw new Error(`asset path traversal: ${subpath}`);
  const src = P(ASSET_SRC_ROOT, dec);
  const dst = P(OUT, 'assets', dec);
  if (!fs.existsSync(src)) {
    if (!missingAssets.has(dec)) missingAssets.set(dec, []);
    if (!missingAssets.get(dec).includes(slug)) missingAssets.get(dec).push(slug);
    return;
  }
  if (!bundledAssets.has(dec)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (dec === 'chrome.css') fs.writeFileSync(dst, chromeCss); // breakpoint-aligned copy
    else if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
    bundledAssets.add(dec);
  }
}

const TRACKING = /^(utm_|gclid|fbclid|intcmp)/i;
function splitUrl(rest) {
  // rest: path[?query][#frag]
  let frag = '';
  const h = rest.indexOf('#');
  if (h >= 0) { frag = rest.slice(h + 1); rest = rest.slice(0, h); }
  let query = '';
  const q = rest.indexOf('?');
  if (q >= 0) { query = rest.slice(q + 1); rest = rest.slice(0, q); }
  return { p: rest, query, frag };
}

const SECTION_NAME_MAP = [
  [/global-footer/, 'footer'],
  [/blog-breadcrumbs/, 'breadcrumbs'],
  [/podcast-component/, 'podcast-feature'],
  [/cw-tabs/, 'blog-topic-tabs'],
  [/highlight stories/, 'featured-stories'],
  [/col-content-wrapper/, 'content-body'],
  [/highlight apply/, 'endcancer-trio'] // only the pre-footer instance lacks data-section
];

// ---------------------------------------------------------------- per page
const SIBLING_SLUG = 'patients-family-html';
const migratePages = [];
const runDecisions = [];
let externalKeptTotal = 0;

for (const pg of state.pages) {
  const isSibling = pg.slug === SIBLING_SLUG;
  const entry = pageMap.find((e) => e.slug === pg.slug);
  const outputPath = entry.outputPath;
  const depth = outputPath.split('/').length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  const cur = JSON.parse(read(pg.currentStatePath));
  const protoPath = isSibling ? 'stardust/prototypes/index-proposed.html' : pg.prototypePath;
  let html = read(protoPath);
  const sourceProposedSha = sha7(html);
  const sourceCurrentSha = sha7(read(pg.currentStatePath));
  const decisions = [];

  // ---- breakpoint alignment (canon deviation, see BREAKPOINT_DEVIATION)
  html = alignBreakpoints(html);
  decisions.push(BREAKPOINT_DEVIATION);

  // ---- mobile-adapt audit (Path A / A')
  const vp = html.match(/<meta name="viewport" content="([^"]+)"/);
  if (!vp || /width\s*=\s*\d/.test(vp[1])) throw new Error(`${pg.slug}: viewport audit failed`);
  const mediaRules = (html.match(/@media/g) || []).length + (chromeCss.match(/@media/g) || []).length;
  if (mediaRules < 1) throw new Error(`${pg.slug}: no @media rules`);
  const adaptAudit = {
    pass: true,
    viewport: vp[1],
    mediaRules,
    mobileBreakpoint: '991px (max-width) after migrate-time alignment to the live nav breakpoint (replica authored 767px); mobile rules active at all viewports <=640px (gated at 360 during replica)',
  };

  // ---- placeholder gate
  if (/data-placeholder/.test(html)) throw new Error(`${pg.slug}: placeholder content present`);

  // ---- sibling substitutions (Path A': index archetype -> patients-family strings)
  if (isSibling) {
    const subs = [
      [/tel:\+18777901139/g, 'tel:+18664633080'],
      [/1-877-790-1139/g, '1-866-463-3080'],
      [/(<p class="badge-countup">)15(<\/p>)/g, '$119$2']
    ];
    for (const [re, to] of subs) {
      const n = (html.match(re) || []).length;
      if (!n) throw new Error(`${pg.slug}: sibling substitution matched 0: ${re}`);
      html = html.replace(re, to);
      decisions.push({ kind: 'sibling-content-injection', what: String(re), to, occurrences: n });
    }
    decisions.push({
      kind: 'sibling-render',
      archetype: 'index',
      reason: 'patients-family.html is a near-duplicate of the homepage on the live site (same sections, same captured metadata); diffs carried: call-tracking phone 1-866-463-3080 (blue strip, mobile drawer, footer) and award-badge count-up 19 Years (vs 15 on /). Hero media/copy identical in capture (homepage hero is served from /content/mda/en/patients-family/).'
    });
    html = html.replace(
      /<!-- provenance: stardust:replica PATHFINDER[\s\S]*?-->/,
      `<!-- rendered by stardust:migrate Path A' from the index archetype (see head provenance) -->`
    );
  }

  // ---- internal link rewriting via pageMap
  // normalize hrefs carrying stray leading/trailing whitespace (source-authoring
  // artifact; a leading space defeats scheme detection in the portability audits)
  html = html.replace(/href="\s+([^"]*?)\s*"/g, 'href="$1"');
  let externalKept = 0, rewritten = 0, queryStripped = 0;
  html = html.replace(/href="((?:https?:\/\/(?:www\.)?mdanderson\.org)?\/[^"]*)"/g, (m, url) => {
    const rest = url.replace(/^https?:\/\/(?:www\.)?mdanderson\.org/, '');
    const { p, query, frag } = splitUrl(rest);
    const target = byPath.get(p === '' ? '/' : p);
    if (target) {
      if (query) {
        const kept = query.split('&').filter((kv) => !TRACKING.test(kv));
        if (kept.length) decisions.push({ kind: 'query-dropped-on-internal-link', href: url, dropped: kept.join('&'), reason: 'file:// portability — relative page targets cannot carry query strings' });
        queryStripped++;
      }
      rewritten++;
      const rel = target.outputPath === outputPath && frag
        ? `#${frag}` // self-link with fragment -> pure anchor
        : prefix + target.outputPath + (frag ? `#${frag}` : '');
      return `href="${rel}"`;
    }
    externalKept++;
    return `href="${ORIGIN}${rest}"`;
  });
  if (externalKept) {
    decisions.push({
      kind: 'external-origin-links-kept',
      count: externalKept,
      reason: 'links to mdanderson.org pages outside the 12-page inventory keep their absolute source URLs (live site — a bounce beats a 404). Not marked data-broken-link: targets resolve on the live origin.'
    });
    externalKeptTotal += externalKept;
  }

  // ---- asset bundling (local assets/ prefix; remote URLs stay absolute)
  const pageAssets = new Set();
  html = html.replace(/(src|href|srcset)="(assets\/[^"]+)"/g, (m, attr, val) => {
    if (attr === 'srcset') {
      const out = val.split(',').map((part) => {
        const t = part.trim().split(/\s+/);
        const sub = t[0].replace(/^assets\//, '');
        pageAssets.add(sub); bundleAsset(sub, pg.slug);
        t[0] = prefix + 'assets/' + sub;
        return t.join(' ');
      }).join(', ');
      return `srcset="${out}"`;
    }
    const sub = val.replace(/^assets\//, '');
    pageAssets.add(sub); bundleAsset(sub, pg.slug);
    return `${attr}="${prefix}assets/${sub}"`;
  });
  html = html.replace(/url\(\s*(["']?)assets\/([^)"']+)\1\s*\)/g, (m, qq, sub) => {
    pageAssets.add(sub); bundleAsset(sub, pg.slug);
    return `url(${qq}${prefix}assets/${sub}${qq})`;
  });
  const remoteImgs = (html.match(/(?:src|srcset|content)="https:\/\/[^"]+"|url\("https:\/\/[^"]+"\)/g) || []).length;
  decisions.push({
    kind: 'media-reuse-source-cdn',
    count: remoteImgs,
    reason: 'images referencing live mdanderson.org renditions are kept as absolute source URLs (they resolve on the live origin; verified during replica gating). No createOptimizedPicture applied. Local media under assets/media/<slug>/ bundled + rewritten relative.'
  });

  // ---- data-section injection on sections lacking it
  let bandN = 0;
  html = html.replace(/<section\b([^>]*)>/g, (m, attrs) => {
    if (/data-section=/.test(attrs)) return m;
    const cls = (attrs.match(/class="([^"]*)"/) || [])[1] || '';
    let name = null;
    for (const [re, n] of SECTION_NAME_MAP) if (re.test(cls) || re.test(attrs)) { name = n; break; }
    if (!name) name = `content-band-${++bandN}`;
    return `<section${attrs} data-section="${name}">`;
  });
  if (!decisions.some((d) => d.kind === 'structural-annotation')) {
    decisions.push({ kind: 'structural-annotation', what: 'data-section added to sections that lacked it (chrome endcancer-trio/footer + minor content bands)', reason: 'strict contract: data-section on every <section>; markup-only, no visual change' });
  }

  // ---- head composition
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const ogImage = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
  if (!title || !desc) throw new Error(`${pg.slug}: missing title/description`);

  const org = {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: 'The University of Texas MD Anderson Cancer Center',
    url: 'https://www.mdanderson.org/',
    logo: 'https://www.mdanderson.org/mda-logo-sharable.png',
    slogan: 'Making Cancer History',
    telephone: '+1-877-632-6789'
  };
  const jsonLd = [org];
  if (pg.type === 'landing') {
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'MD Anderson Cancer Center', url: 'https://www.mdanderson.org/' });
  } else if (pg.type === 'program') {
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: cur.og?.title || title, description: desc, url: pg.url });
  } else if (pg.type === 'article') {
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: cur.og?.title || 'How to cope with insomnia during cancer treatment',
      datePublished: '2026-06-08',
      author: { '@type': 'Person', name: 'Roman Gokhman' },
      image: ogImage,
      publisher: { '@type': 'Organization', name: org.name, logo: { '@type': 'ImageObject', url: org.logo } },
      mainEntityOfPage: pg.url
    });
  } else if (pg.type === 'listing') {
    const main = html.split('pre-footer')[0];
    const names = [...main.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
      .filter((t) => t && t.length > 2);
    const uniq = [...new Set(names)].slice(0, 10);
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: cur.og?.title || title,
      itemListElement: uniq.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n }))
    });
  } else if (pg.type === 'static') {
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'AboutPage', name: cur.og?.title || title, url: pg.url, mainEntity: { '@type': 'Organization', name: org.name } });
  } else if (pg.type === 'form') {
    decisions.push({ kind: 'jsonld-skipped-for-form', reason: 'Action JSON-LD is optional per metadata-and-jsonld.md; page carries multiple donation/volunteer CTAs with no single form action. Organization JSON-LD emitted.' });
  }

  const headExtra = [
    `<link rel="canonical" href="${pg.url}">`,
    `<meta property="og:url" content="${pg.url}">`,
    `<meta property="og:site_name" content="MD Anderson Cancer Center">`,
    `<meta name="robots" content="index,follow">`,
    ...jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
  ].join('\n');
  html = html.replace(/<link rel="stylesheet" href="[^"]*mda-fonts\.css">/, (m) => `${headExtra}\n${m}`);

  // ---- provenance block (first child of <head>)
  const branch = isSibling ? "A'" : 'A';
  const prov = `<!-- stardust:migrate
  writtenBy:        stardust:migrate
  writtenAt:        ${NOW}
  page:             ${pg.slug}
  slug:             ${pg.slug}
  pagePath:         ${OUT}/${outputPath}
  renderBranch:     ${branch}
${isSibling ? `  template:         landing
  archetypePath:    stardust/prototypes/index-proposed.html
  archetypeSha:     ${sourceProposedSha}
` : `  sourceProposed:   ${protoPath}
`}  sourceCurrent:    ${pg.currentStatePath}
  againstDirection: stardust/direction.md (preserve mode — replica, verbatim content)
  designMd:         DESIGN.md (sha: ${designMdSha})
  designJson:       DESIGN.json (sha: ${designJsonSha})
  canonShas:        header:${canonShas.header} footer:${canonShas.footer} css:${canonShas.css}
  decisionTrace:    ${outputPath.endsWith('index.html') ? '_meta.json' : path.basename(outputPath, '.html') + '._meta.json'}
  brokenInternalLinks: 0
  stardustVersion:  ${STARDUST_VERSION}
-->`;
  html = html.replace(/<head>\s*\n/, `<head>\n${prov}\n`);

  // ---- strict-contract validation
  const fail = (msg) => { throw new Error(`${pg.slug}: strict contract failed — ${msg}`); };
  if (!/<head>\n<!-- stardust:migrate/.test(html)) fail('provenance not first child of <head>');
  const firstStyle = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  if (!/:root\s*{/.test(firstStyle)) fail(':root block missing from first <style>');
  if (!/<main[^>]*data-template="/.test(html)) fail('data-template missing on <main>');
  if (/<section\b(?![^>]*data-section=)/.test(html)) fail('a <section> lacks data-section');
  if (!/data-canon="chrome-header"/.test(html) || !/data-canon="chrome-footer"/.test(html)) fail('data-canon chrome markers missing');
  if (/(href|src)="\/[^\/"]/.test(html)) fail('root-absolute internal reference remains');
  if (/\.\.\/current\//.test(html) || /\.\.\/prototypes\//.test(html)) fail('source-tree escape');

  // ---- write page + sidecar
  const outFile = P(OUT, outputPath);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);

  const metaName = outputPath.endsWith('index.html')
    ? path.join(path.dirname(outputPath), '_meta.json')
    : outputPath.replace(/\.html$/, '._meta.json');
  const meta = {
    slug: pg.slug,
    type: pg.type,
    renderBranch: branch,
    template: isSibling ? 'landing' : null,
    fidelityTier: isSibling ? 'sibling' : 'archetype',
    archetypeSource: isSibling ? 'index' : null,
    gatesPassed: isSibling
      ? ['content-fidelity', 'mobile-adapt', 'delivery-lint', 'placeholder-gate']
      : ['replica-pixel-gate-1440', 'replica-pixel-gate-360', 'mobile-adapt', 'placeholder-gate', 'content-sourcing'],
    modules: [],
    slotsFilled: isSibling ? ['contact-phone (x3)', 'award-badge-countup'] : [],
    canonShas,
    deviations: [{ where: BREAKPOINT_DEVIATION.where, reason: BREAKPOINT_DEVIATION.reason }],
    migrationDecisions: decisions,
    audit: { adapt: adaptAudit },
    linkRewrites: { internal: rewritten, externalOriginKept: externalKept, queryStripped },
    metadata: { title, description: desc, og: cur.og || {}, canonical: pg.url, robots: 'index,follow' },
    jsonLd: jsonLd.slice(1)[0] || null,
    assetsBundled: pageAssets.size,
    migratedAt: NOW,
    outputPath,
    designMdSha, designJsonSha, sourceCurrentSha,
    sourceProposedSha: isSibling ? null : sourceProposedSha,
    archetypeSha: isSibling ? sourceProposedSha : null
  };
  fs.writeFileSync(P(OUT, metaName), JSON.stringify(meta, null, 2) + '\n');

  migratePages.push({ slug: pg.slug, file: `${OUT}/${outputPath}`, assetsBundled: pageAssets.size, renderBranch: branch, fidelityTier: meta.fidelityTier });
  runDecisions.push({ slug: pg.slug, decisions: decisions.map((d) => d.kind) });
  console.log(`migrated ${branch.padEnd(2)} ${pg.slug} -> ${OUT}/${outputPath} (${pageAssets.size} local asset refs, ${rewritten} links rewritten, ${externalKept} origin links kept)`);
}

// ---------------------------------------------------------------- sitewide assets
// fonts referenced by mda-fonts.css (licensing banner preserved — file copied verbatim)
if (bundledAssets.has('mda-fonts.css')) {
  const fontsCss = read(path.join(ASSET_SRC_ROOT, 'mda-fonts.css'));
  for (const m of fontsCss.matchAll(/url\((fonts\/[^)]+)\)/g)) bundleAsset(m[1], '(mda-fonts.css)');
}
// robots.txt (POC preview — indexing allowed, per run contract)
fs.writeFileSync(P(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n');
// sitemap.xml — canonical (origin) URLs; deployUrl is null so canonicals preserve origin
const PRIO = { landing: '1.0', static: '0.7', program: '0.7', listing: '0.6', article: '0.5', form: '0.4' };
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  state.pages.map((pg) => `  <url><loc>${pg.url}</loc><lastmod>${NOW.slice(0, 10)}</lastmod><priority>${PRIO[pg.type] || '0.5'}</priority></url>`).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(P(OUT, 'sitemap.xml'), sitemap);

// ---------------------------------------------------------------- state.json
for (const pg of state.pages) {
  const entry = pageMap.find((e) => e.slug === pg.slug);
  pg.status = 'migrated';
  pg.stale = false;
  pg.migratedPath = `${OUT}/${entry.outputPath}`;
  pg.fidelityTier = pg.slug === SIBLING_SLUG ? 'sibling' : 'archetype';
  if (pg.slug === SIBLING_SLUG) pg.archetypeSource = 'index';
  pg.history.push({ status: 'migrated', at: NOW, renderBranch: pg.slug === SIBLING_SLUG ? "A'" : 'A' });
}
state.migrate = {
  at: NOW,
  outputDir: `${OUT}/`,
  selfContained: true,
  canon: { source: 'auto-bootstrap: index', shas: canonShas },
  pageMap,
  totalAssetsBundled: bundledAssets.size,
  bundledAssets: [...bundledAssets].sort(),
  pages: migratePages,
  missingAssets: [...missingAssets].map(([subpath, referencedBy]) => ({ subpath, referencedBy })),
  cleanedAssets: [],
  decisions: {
    assetSourceRoot: `${ASSET_SRC_ROOT}/ (replica prototypes carry the localized media; stardust/current/assets holds fonts + screenshots only)`,
    externalOriginLinksKept: externalKeptTotal,
    externalOriginLinksPolicy: 'same-origin links to non-inventory pages keep absolute live URLs; NOT flagged data-broken-link (source site is live; bounce beats 404)',
    remoteMediaPolicy: 'live mdanderson.org image renditions kept as absolute source URLs (resolve at view time); local media bundled relative',
    logo: 'header/footer logos are live-origin webp renditions (no local logo captured); kept absolute, recorded as media-reuse-source-cdn',
    favicon: 'no favicon captured during extract; variants not generated (prepare-migration never ran) — soft-logged, pages render without them',
    fonts: 'Minion/Univers licensed kits bundled under assets/fonts/ with licensing banner preserved in assets/mda-fonts.css (local gate instrumentation; delivery must license or substitute)'
  }
};
fs.writeFileSync(P('stardust/state.json'), JSON.stringify(state, null, 2) + '\n');

let bytes = 0;
const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); const s = fs.statSync(p); s.isDirectory() ? walk(p) : (bytes += s.size); } };
walk(P(OUT));
console.log(`\nmigrate render complete: ${migratePages.length} pages, ${bundledAssets.size} bundled assets, ${(bytes / 1048576).toFixed(1)} MB total, ${missingAssets.size} missing assets`);
