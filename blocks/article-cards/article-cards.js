/**
 * article-cards — editorial story-card listings (invented listing family).
 * Converts on cancer-types/breast-cancer as `grid` (8 story cards, 2 shown +
 * View more); reused on clinical-trials as `news` (2-col) and `experts`
 * (2-up large with summary + Read more). The EDITORIAL (cancerwise) cluster
 * adds `featured` (single large card w/ summary + Keep reading CTA),
 * `rail-tab` (Latest/Top tab lists w/ colored category tag), `topic`
 * (6 tab-grouped topic panels w/ date line) and `rail` (thumb rows) on the
 * same decode. Consecutive `rail-tab`/`topic` instances in one section are
 * grouped into a tab UI client-side (D2-safe; first instance = active tab).
 * Schemas: stardust/eds-schema/cancer-types-breast-cancer-html.json
 * (A.blog-summary x8), …-clinical-trials-html.json, cancerwise-html.json
 * (featured split + topic tabs), …insomnia…-html.json (more-stories rail).
 *
 * Authoring rows: ONE row per card —
 *   cell 1: <picture>/<img> (optional)
 *   cell 2: [<p>Category</p> (rail-tab)] + <h3><a href="story">Title</a></h3>
 *           [+ <p>summary</p> …] [+ <p><a>Read more/Keep reading</a></p>]
 *           [+ <p>Month DD, YYYY</p> (topic — the author-date line)]
 * Grouped variants (`rail-tab`, `topic`) lead with label rows (no links):
 *   row 1: tab label ("Top Stories" / "Diagnosis & Treatment")
 *   row 2 (topic only): the panel headline sentence
 * Section head ("Featured Articles", "Find stories by topic", …) is DEFAULT
 * CONTENT in the same section, styled in place (D1) — never a block row.
 * Decode is cell-cascade + classifier-based (#48/#53/#62/#72/#104).
 *
 * INDEX MODE (production path, stardust/rollout/dynamic-blocks-map.md §1):
 * add variant `index` and the authored rows become CONFIG (key | value):
 *   source   — query-index URL (default /cancerwise/query-index.json)
 *   category — filter to one closed-set topic (label or slug)
 *   limit    — max cards (default 8; per panel for `topic index`)
 *   sort     — `<field>-<asc|desc>` (default publishdate-desc)
 *   label    — tab label for `rail-tab index` (default "Latest")
 * Index rows hydrate the SAME card DOM the static decode builds, so every
 * visual variant composes with `index`. `topic index` = one fetch grouped by
 * category over the closed topic set (panel labels from TOPIC_SLUGS).
 * Empty index / fetch error → block renders nothing (console.warn).
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

const SHOW_DEFAULT = 2;

/* closed topic set (log §7/§9): CSS class + index category = slugified topic */
const TOPIC_SLUGS = {
  'diagnosis & treatment': 'diagnosis-treatment',
  'patients & caregivers': 'patients-caregivers',
  'patient & caregiver stories': 'patients-caregivers',
  'healthy living': 'healthy-living',
  research: 'research',
  'expert insights': 'expert-insights',
  philanthropy: 'philanthropy',
};

function topicSlug(text) {
  const t = (text || '').trim().toLowerCase();
  return TOPIC_SLUGS[t]
    || t.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mediaOf(nodes) {
  for (const el of nodes) {
    if (el.matches?.('picture, img')) return el;
    const m = el.querySelector?.('picture, img');
    if (m) return m;
  }
  return null;
}

function cardFrom(row, variant) {
  const cells = [...row.children];
  const nodes = cells.flatMap((c) => (c.children.length ? [...c.children] : [c]));
  const media = mediaOf(nodes);
  const titleEl = row.querySelector('h1,h2,h3,h4,h5,h6');
  const titleLink = titleEl?.querySelector('a') || row.querySelector('a');
  const href = titleLink?.getAttribute('href') || '#';
  const titleText = (titleEl || titleLink)?.textContent.trim() || '';
  const paragraphs = [...row.querySelectorAll('p')].filter((p) => {
    const a = p.querySelector('a');
    if (!a) return !!p.textContent.trim() && !p.querySelector('picture, img');
    return false;
  });
  // the CTA is an anchor ALONE in its paragraph ("Keep reading" / "Read
  // more") — summary paragraphs may carry INLINE links (featured) and must
  // not be mistaken for the CTA
  const ctaLink = [...row.querySelectorAll('p')].filter((p) => {
    const a = p.querySelector('a');
    return a && a !== titleLink && p.textContent.trim() === a.textContent.trim();
  }).map((p) => p.querySelector('a')).pop() || null;

  const mediaDiv = document.createElement('div');
  mediaDiv.className = 'ac-media';
  if (media) mediaDiv.append(media.cloneNode(true));

  const titleWrap = document.createElement('div');
  titleWrap.className = 'ac-title';
  const h = document.createElement('h3');
  h.textContent = titleText;
  titleWrap.append(h);

  if (variant === 'experts' || variant === 'featured') {
    // large editorial card: linked media+title, then summary text + CTA.
    // `featured` keeps link-bearing summary paragraphs (inline story links).
    const card = document.createElement('div');
    card.className = 'ac-card';
    const a = document.createElement('a');
    a.className = 'ac-card-link';
    a.href = href;
    a.append(mediaDiv, titleWrap);
    card.append(a);
    const text = document.createElement('div');
    text.className = 'ac-text';
    const summaryPs = variant === 'featured'
      ? [...row.querySelectorAll('p')].filter((p) => {
        if (p.querySelector('picture, img')) return false;
        if (!p.textContent.trim()) return false;
        const link = p.querySelector('a');
        // a paragraph that IS just a link is the CTA, not summary
        if (link && link.textContent.trim() === p.textContent.trim()) return false;
        return true;
      })
      : paragraphs;
    summaryPs.forEach((p) => {
      const s = document.createElement('div');
      s.className = 'ac-summary';
      s.append(...[...p.childNodes].map((n) => n.cloneNode(true)));
      text.append(s);
    });
    if (ctaLink) {
      const ctaP = document.createElement('p');
      ctaP.className = 'ac-cta';
      const cta = ctaLink.cloneNode(true);
      cta.innerHTML = `${cta.textContent}<i class="ac-arrow" aria-hidden="true"></i>`;
      ctaP.append(cta);
      text.append(ctaP);
    }
    card.append(text);
    return card;
  }

  if (variant === 'rail-tab' || variant === 'topic') {
    // story list card mirroring the replica DOM: separate image link,
    // [category tag (rail-tab)], linked title (h3 > a), [date line (topic)].
    const card = document.createElement('div');
    card.className = 'ac-card';
    if (media) {
      const mediaLink = document.createElement('a');
      mediaLink.className = 'ac-media-link';
      mediaLink.href = href;
      mediaLink.setAttribute('aria-hidden', 'true');
      mediaLink.tabIndex = -1;
      mediaLink.append(mediaDiv);
      card.append(mediaLink);
    }
    const body = document.createElement('div');
    body.className = 'ac-card-body';
    if (variant === 'rail-tab' && paragraphs[0]) {
      const catText = paragraphs[0].textContent.trim();
      const cat = document.createElement('div');
      cat.className = `ac-cat cat-${topicSlug(catText)}`;
      cat.textContent = catText;
      body.append(cat);
    }
    const h3 = document.createElement('h3');
    const titleA = document.createElement('a');
    titleA.href = href;
    titleA.textContent = titleText;
    h3.append(titleA);
    titleWrap.replaceChildren(h3);
    body.append(titleWrap);
    if (variant === 'topic') {
      const dateP = paragraphs.find((p) => /\d{4}/.test(p.textContent));
      if (dateP) {
        const d = document.createElement('p');
        d.className = 'ac-date';
        d.textContent = dateP.textContent.trim();
        body.append(d);
      }
    }
    card.append(body);
    return card;
  }

  const a = document.createElement('a');
  a.className = 'ac-card';
  a.href = href;
  a.append(mediaDiv, titleWrap);
  return a;
}

/* ── tab grouping (rail-tab / topic): consecutive instances in one section
      merge into the FIRST instance's tab UI; first tab = active (§7) ─────── */

let acTabUid = 0;

function tabHostOf(block, variant) {
  const section = block.closest('.section') || block.parentElement;
  if (!section) return null;
  const host = [...section.querySelectorAll(`.article-cards.${variant} .ac-tabs`)]
    .find((t) => !block.contains(t));
  return host || null;
}

function registerTab(host, label, slug, panel) {
  const menu = host.querySelector('.ac-tab-menu');
  const panels = host.querySelector('.ac-panels');
  const first = !menu.children.length;
  acTabUid += 1;
  const id = `ac-panel-${acTabUid}`;
  panel.id = id;
  panel.setAttribute('role', 'tabpanel');
  const li = document.createElement('li');
  li.className = `ac-tab cat-${slug}${first ? ' ac-tab-active' : ''}`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-controls', id);
  btn.setAttribute('aria-selected', String(first));
  btn.textContent = label;
  li.append(btn);
  menu.append(li);
  if (!first) panel.classList.add('ac-panel-hidden');
  panels.append(panel);
  btn.addEventListener('click', () => {
    menu.querySelectorAll('.ac-tab').forEach((t) => {
      t.classList.remove('ac-tab-active');
      t.querySelector('button')?.setAttribute('aria-selected', 'false');
    });
    li.classList.add('ac-tab-active');
    btn.setAttribute('aria-selected', 'true');
    panels.querySelectorAll('.ac-panel').forEach((p) => p.classList.add('ac-panel-hidden'));
    panel.classList.remove('ac-panel-hidden');
  });
}

function buildTabs() {
  const tabs = document.createElement('div');
  tabs.className = 'ac-tabs';
  const menu = document.createElement('ul');
  menu.className = 'ac-tab-menu';
  menu.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'ac-panels';
  tabs.append(menu, panels);
  return tabs;
}

function mountPanel(block, variant, label, panelParts) {
  const slug = topicSlug(label);
  const host = tabHostOf(block, variant);
  if (host) {
    // a sibling instance already built the tab UI — this whole BLOCK becomes
    // the panel and moves into the group (the element survives, so the
    // runtime's block lifecycle and the round-trip tags stay intact); the
    // emptied wrapper is retired.
    const wrapper = block.parentElement?.classList.contains('article-cards-wrapper')
      ? block.parentElement : null;
    block.classList.add('ac-panel', `cat-${slug}`);
    block.replaceChildren(...panelParts);
    registerTab(host, label, slug, block);
    if (wrapper && !wrapper.children.length) wrapper.remove();
    return;
  }
  // first instance: build the tab UI; own content rides an inner panel div
  const panel = document.createElement('div');
  panel.className = `ac-panel cat-${slug}`;
  panel.append(...panelParts);
  const tabs = buildTabs();
  block.replaceChildren(tabs);
  registerTab(tabs, label, slug, panel);
}

function absorbRailHead(block, container) {
  // reabsorb the "More stories from Cancerwise" head (D1: authored as the
  // trailing h2 of the preceding default-content prose wrapper) so the
  // decorated DOM matches the replica's .at-article-list (h2 inside)
  const prev = block.parentElement?.previousElementSibling;
  if (prev?.classList?.contains('default-content-wrapper')
    && prev.lastElementChild?.tagName === 'H2') {
    const head = prev.lastElementChild;
    head.classList.add('ac-head');
    container.prepend(head);
  }
}

function appendToggle(block, cards, variant) {
  // grid/news carry the replica's View more / View less toggle
  const hidden = cards.slice(SHOW_DEFAULT);
  hidden.forEach((c) => c.classList.add('ac-hidden'));
  const bar = document.createElement('div');
  bar.className = 'ac-toggle';
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'ac-more';
  more.textContent = 'View more';
  const less = document.createElement('button');
  less.type = 'button';
  less.className = 'ac-less';
  less.textContent = 'View less';
  // replica parity: grid hides "View less" until expanded; news (no hidden
  // cards) captured both buttons visible — keep the captured state
  if (variant === 'grid') less.style.display = 'none';
  more.addEventListener('click', () => {
    hidden.forEach((c) => c.classList.remove('ac-hidden'));
    more.style.display = 'none';
    less.style.display = '';
  });
  less.addEventListener('click', () => {
    hidden.forEach((c) => c.classList.add('ac-hidden'));
    less.style.display = 'none';
    more.style.display = '';
  });
  bar.append(more, less);
  block.append(bar);
}

/* ── index mode (dynamic-blocks-map §1 production path) ──────────────────── */

const DEFAULT_SOURCE = '/cancerwise/query-index.json';
const DEFAULT_LIMIT = 8;

/* closed-set panel order for `topic index` (map §1) */
const TOPIC_ORDER = ['diagnosis-treatment', 'patients-caregivers', 'healthy-living',
  'research', 'expert-insights', 'philanthropy'];

/* slug → display label, derived from TOPIC_SLUGS (first label per slug) */
const TOPIC_LABELS = Object.entries(TOPIC_SLUGS).reduce((labels, [label, slug]) => {
  if (!labels[slug]) {
    labels[slug] = label.replace(/(^|\s)[a-z]/g, (c) => c.toUpperCase());
  }
  return labels;
}, {});

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/* ISO yyyy-mm-dd → "Month DD, YYYY" (map §1: rendered "August 19, 2026") */
function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '';
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

/* index titles carry the site suffix ("… | UT MD Anderson") — cards don't */
function cleanTitle(title) {
  return (title || '').replace(/\s*\|\s*(UT\s+)?MD Anderson.*$/i, '').trim();
}

/* index rows may carry absolute DA content URLs (auth-gated) — serve the
   media path same-origin so createOptimizedPicture hits the delivery host */
function localImagePath(src) {
  const m = /^https:\/\/content\.da\.live\/[^/]+\/[^/]+(\/.+)$/.exec(src || '');
  return m ? m[1] : (src || '');
}

/* build the SAME authored-row shape the static decode reads, then reuse
   cardFrom so index cards and static cards share one DOM */
function rowFromEntry(entry, variant) {
  const row = document.createElement('div');
  const mediaCell = document.createElement('div');
  const src = localImagePath(entry.image);
  if (src && src !== '0') {
    mediaCell.append(createOptimizedPicture(src, cleanTitle(entry.title), false, [{ width: '750' }]));
  }
  const body = document.createElement('div');
  if (variant === 'rail-tab' && entry.category) {
    const cat = document.createElement('p');
    cat.textContent = TOPIC_LABELS[entry.category] || entry.category;
    body.append(cat);
  }
  const h3 = document.createElement('h3');
  const titleA = document.createElement('a');
  titleA.href = entry.path;
  titleA.textContent = cleanTitle(entry.title);
  h3.append(titleA);
  body.append(h3);
  if ((variant === 'experts' || variant === 'featured') && entry.description) {
    const summary = document.createElement('p');
    summary.textContent = entry.description;
    body.append(summary);
  }
  if (variant === 'topic') {
    const date = formatDate(entry.publishdate);
    if (date) {
      const dateP = document.createElement('p');
      dateP.textContent = date;
      body.append(dateP);
    }
  }
  if (variant === 'experts' || variant === 'featured') {
    const ctaP = document.createElement('p');
    const cta = document.createElement('a');
    cta.href = entry.path;
    cta.textContent = variant === 'featured' ? 'Keep reading' : 'Read more';
    ctaP.append(cta);
    body.append(ctaP);
  }
  row.append(mediaCell, body);
  return row;
}

async function decorateIndex(block, variant) {
  // in index mode the authored rows are CONFIG (key | value), not cards
  const config = {};
  [...block.children].forEach((row) => {
    const [key, value] = [...row.children].map((c) => c.textContent.trim());
    if (key && value !== undefined) config[key.toLowerCase()] = value;
  });
  const source = config.source || DEFAULT_SOURCE;
  const parsedLimit = Number.parseInt(config.limit, 10);
  const limit = parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT;
  const sortSpec = /^(.+)-(asc|desc)$/.exec(config.sort || '') || [null, 'publishdate', 'desc'];
  const [, sortField, sortDir] = sortSpec;

  let entries;
  try {
    const resp = await fetch(source);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    entries = (await resp.json()).data || [];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`article-cards index: fetch failed for ${source}`, e);
    block.replaceChildren();
    return;
  }
  if (config.category) {
    const want = topicSlug(config.category);
    entries = entries.filter((entry) => topicSlug(entry.category) === want);
  }
  entries.sort((x, y) => {
    const a = String(x[sortField] ?? '');
    const b = String(y[sortField] ?? '');
    return sortDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
  });
  if (!entries.length) {
    // eslint-disable-next-line no-console
    console.warn(`article-cards index: no entries from ${source}`);
    block.replaceChildren();
    return;
  }

  if (variant === 'topic') {
    // one fetch, grouped by category over the closed topic set (map §1)
    const groups = TOPIC_ORDER
      .map((slug) => [slug, entries.filter((entry) => topicSlug(entry.category) === slug)])
      .filter(([, group]) => group.length);
    if (!groups.length) {
      // eslint-disable-next-line no-console
      console.warn(`article-cards index: no closed-set categories in ${source}`);
      block.replaceChildren();
      return;
    }
    const tabs = buildTabs();
    block.replaceChildren(tabs);
    groups.forEach(([slug, group]) => {
      const container = document.createElement('div');
      container.className = 'ac-container';
      group.slice(0, limit)
        .forEach((entry) => container.append(cardFrom(rowFromEntry(entry, variant), variant)));
      const panel = document.createElement('div');
      panel.className = `ac-panel cat-${slug}`;
      panel.append(container);
      registerTab(tabs, TOPIC_LABELS[slug] || slug, slug, panel);
    });
    return;
  }

  const container = document.createElement('div');
  container.className = 'ac-container';
  const cards = entries.slice(0, limit)
    .map((entry) => cardFrom(rowFromEntry(entry, variant), variant));
  cards.forEach((c) => container.append(c));

  if (variant === 'rail-tab') {
    // joins a sibling editorial rail-tab's tab UI (e.g. index "Latest" +
    // curated "Top Stories"), or builds the tab UI itself
    mountPanel(block, variant, config.label || 'Latest', [container]);
    return;
  }
  if (variant === 'rail') absorbRailHead(block, container);
  block.replaceChildren(container);
  if (variant === 'grid' || variant === 'news') appendToggle(block, cards, variant);
}

export default async function decorate(block) {
  const variant = ['news', 'experts', 'featured', 'rail-tab', 'topic', 'rail']
    .find((v) => block.classList.contains(v)) || 'grid';

  if (block.classList.contains('index')) {
    await decorateIndex(block, variant);
    return;
  }

  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'ac-container';

  // grouped variants: a link row WITHOUT a heading is a panel CTA button
  // (topic "Read more … / Subscribe …"), not a card
  const grouped = variant === 'rail-tab' || variant === 'topic';
  const cardRows = rows.filter((row) => row.querySelector('a')
    && (!grouped || row.querySelector('h1,h2,h3,h4,h5,h6')));
  const ctaRows = grouped
    ? rows.filter((row) => row.querySelector('a') && !cardRows.includes(row))
    : [];

  const cards = cardRows.map((row) => cardFrom(row, variant));
  cards.forEach((c) => container.append(c));
  const panelCtas = ctaRows.map((row) => {
    const div = document.createElement('div');
    div.className = 'ac-panel-cta';
    div.append(row.querySelector('a').cloneNode(true));
    return div;
  });

  if (variant === 'rail-tab' || variant === 'topic') {
    const textRows = rows.filter((r) => !r.querySelector('a') && r.textContent.trim());
    const label = textRows[0]?.textContent.trim() || '';
    const panelParts = [];
    if (variant === 'topic' && textRows[1]) {
      const headline = document.createElement('p');
      headline.className = 'ac-headline';
      headline.textContent = textRows[1].textContent.trim();
      panelParts.push(headline);
    }
    panelParts.push(container, ...panelCtas);
    mountPanel(block, variant, label, panelParts);
    return;
  }

  if (variant === 'rail') absorbRailHead(block, container);

  block.replaceChildren(container);

  if (variant === 'grid' || variant === 'news') appendToggle(block, cards, variant);
}
