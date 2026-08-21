/**
 * cards — promo / icon card bands (Block Collection name, D11).
 * Decode tier: reconstructive (eds-conversion-log §5). Converts on index
 * (support-duo `promo duo support`, icon-trio `icon trio`, EndCancer
 * `promo closing`); reused by every page.
 * Schemas: stardust/eds-schema/index.json (support-duo, icon-trio,
 * highlight/endcancer), prevention-screening-html.json (icon-duo,
 * highlight), research-html.json (pre-footer-trio), patients-family-html.json.
 *
 * Authoring: one row per card, one cell, elements in order:
 *   optional <p>:icon-name:</p> — icon-circle glyph
 *   <h3>Card title</h3> (icon-trio: <h3><a href>Title</a></h3> — whole card links)
 *   optional <p> body
 *   optional CTA: <p><em><a>bordered CTA</a></em></p> (promo panels) or
 *   <p><a>arrow CTA</a></p> (`arrow` variant text links)
 *
 * Variants (block classes):
 *   kind: `promo` (colored panels) / `icon` (white, icon circle, whole-card link)
 *   layout: `duo` / `trio` (default) / `closing` (EndCancer pre-footer)
 *   palette (closed set, nth-child cycles — D6, log §7): `support` (red/purple),
 *   `screen` (purple/red), `closing` (red/black/blue), `prefooter`
 *   (blue/black/purple); icon trio circles cycle red/lightblue/green.
 *   `arrow`: CTAs render as arrow text links (external → linkout glyph).
 *   EDITORIAL-cluster additions (wave 2): `ribbon` (cancerwise blue link
 *   ribbon — one row per CTA: icon token + link; whole unit is the link),
 *   `story` (article rail promo palette green/blue/purple).
 *   `stacked-pair` (live for-physicians grid): author FIVE rows — 1-3 become
 *   white icon-kind cards stacked in a left column, 4-5 blue/purple promo
 *   panels stacked right (two independent 576px columns, 144px gutter).
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

function isExternal(a) {
  try {
    const u = new URL(a.getAttribute('href'), 'https://www.mdanderson.org/');
    return u.hostname !== 'www.mdanderson.org';
  } catch { return false; }
}

const NOWRAP_RE = /UT MD Anderson/;

function wrapNowrap(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) {
    if (NOWRAP_RE.test(walker.currentNode.textContent)) hits.push(walker.currentNode);
  }
  hits.forEach((node) => {
    const m = node.textContent.match(NOWRAP_RE);
    if (!m) return;
    const rest = node.splitText(m.index);
    rest.splitText(m[0].length);
    const span = document.createElement('span');
    span.className = 'nowrap';
    span.textContent = m[0];
    rest.replaceWith(span);
  });
}

/** icon name from a node: span.icon class OR a literal :icon-x: text token */
function iconTokenOf(node) {
  const m = (node.textContent || '').trim().match(/^:icon-([a-z0-9_-]+):$/i);
  return m ? m[1] : null;
}

function collectCard(row) {
  const iconSpan = row.querySelector('span.icon');
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const headingA = heading ? heading.querySelector('a') : null;
  // wave-2 STATIC/LISTING/FUNNEL addition: a CTA is an anchor ALONE in its
  // paragraph (em/strong wrappers tolerated) — body paragraphs may carry
  // INLINE links (our-locations Directions app-store links) and are kept
  // as body copy instead of being mistaken for the CTA / dropped.
  const ctaP = [...row.querySelectorAll('p')].find((p) => {
    const a = p.querySelector('a');
    return a && !(heading && heading.contains(a))
      && p.textContent.trim() === a.textContent.trim();
  });
  const cta = ctaP ? ctaP.querySelector('a') : null;
  const bodyPs = [...row.querySelectorAll('p')]
    .filter((p) => p.textContent.trim() && p !== ctaP
      && !p.querySelector('span.icon, picture, img') && !iconTokenOf(p));
  let icon = iconSpan
    ? ([...iconSpan.classList].find((c) => c.startsWith('icon-') && c !== 'icon') || '').replace('icon-', '')
    : null;
  if (!icon) {
    icon = [...row.querySelectorAll('p')].map(iconTokenOf).find(Boolean) || null;
  }
  // program-cluster addition: an authored card image (breast-cancer about
  // rail, `rail` variant — eds-conversion-log §6.5). Icon-span imgs are NOT
  // media: authored `:icon-x:` tokens pipeline-convert to span.icon > img,
  // and once the icon SVGs resolved they rendered as spurious 300px
  // card-media above every story promo (2026-08-21 gate finding).
  const media = [...row.querySelectorAll('picture, img')]
    .find((m) => !m.closest('span.icon')) || null;
  return { icon, heading, headingA, cta, bodyPs, media };
}

/** body paragraphs + CTA into a promo-text div (shared by both card kinds) */
function fillPromoText(text, card, arrow) {
  if (card.bodyPs.length) {
    // whitespace separator keeps whole-card anchor text word-separated
    // (wave-2: title/body/CTA boundaries — invisible in rendering)
    text.append(document.createTextNode(' '));
    const body = el('div', 'body promo-text-normal', text);
    card.bodyPs.forEach((p) => {
      const copy = p.cloneNode(true);
      wrapNowrap(copy);
      body.append(copy);
      body.append(document.createTextNode(' '));
    });
  }
  if (card.cta) {
    const wrapCls = arrow ? 'cta-wrapper cta-right-arrow-wrapper' : 'cta-wrapper cta-block-wrapper';
    const ctaWrap = el('div', wrapCls, text);
    const a = card.cta.cloneNode(true);
    a.className = arrow ? 'cta cta-right-arrow' : 'cta cta-block';
    if (isExternal(a)) {
      a.append(document.createTextNode(' '));
      a.append(linkoutSpan());
    } else if (arrow) {
      const i = el('i', 'mdicon-arrow', a);
      i.setAttribute('aria-hidden', 'true');
    }
    ctaWrap.append(a);
  }
}

function iconCircle(name) {
  const wrap = el('div', 'promo-icon icon-circle');
  const stack = el('span', 'fa-stack fa-3x', wrap);
  const i = el('i', `fa card-icon cicon-${name} mda-stack-1x`, stack);
  i.setAttribute('aria-hidden', 'true');
  return wrap;
}

function linkoutSpan() {
  const s = el('span', 'mda-icon-linkout');
  return s;
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'cards') return;
  const isIcon = block.classList.contains('icon');
  // stacked-pair (live for-physicians grid, 2026-08-21): five authored rows —
  // 1-3 render as icon-kind white cards stacked LEFT, 4-5 as promo panels
  // stacked RIGHT. Live is two INDEPENDENT 576px columns (144px gutter);
  // shared grid rows can't reproduce the left column's 240px pitch, so the
  // cols are wrapped into .stack-col.left/.stack-col.right below.
  const stackedPair = block.classList.contains('stacked-pair');
  const arrow = block.classList.contains('arrow');
  const cards = [...block.children].map(collectCard).filter((c) => c.heading || c.cta);
  if (!cards.length) return;

  // EDITORIAL-cluster addition: `ribbon` — blue band of icon CTA buttons
  // (cancerwise link-ribbon). One authored row per CTA: :icon-x: + <a>.
  if (block.classList.contains('ribbon')) {
    const ribbon = el('div', 'link-ribbon');
    cards.forEach((card, i) => {
      if (!card.cta) return;
      const blockDiv = el('div', `button-block btn-link-${i + 1}`, ribbon);
      const a = document.createElement('a');
      a.href = card.cta.getAttribute('href');
      a.className = 'link-ribbon-cta';
      const inner = el('div', 'cta-inner', a);
      if (card.icon) {
        const iconWrap = el('div', 'promo-icon icon-circle', inner);
        const span = el('span', 'fa-lg', iconWrap);
        el('i', `fa card-icon cicon-${card.icon}`, span).setAttribute('aria-hidden', 'true');
      }
      const text = el('div', 'text', inner);
      text.textContent = card.cta.textContent.trim();
      blockDiv.append(a);
    });
    block.replaceChildren(ribbon);
    return;
  }

  const table = el('div', 'table cards-table');

  cards.forEach((card, idx) => {
    const iconCard = stackedPair ? idx < 3 : isIcon;
    const col = el('div', 'card-col', table);
    const module = el('div', 'module m-bleed', col);

    // program-cluster addition: authored card image renders above the panel
    if (card.media) {
      const mediaDiv = el('div', 'card-media', module);
      mediaDiv.append((card.media.closest && card.media.closest('picture')) || card.media);
    }

    if (iconCard) {
      // white icon card — whole card is the link ONLY when there is no
      // separate CTA (nested anchors are invalid); interior trios carry
      // body + CTA (eds-conversion-log §6.5/§6.7)
      let host;
      if (card.headingA && !card.cta) {
        host = document.createElement('a');
        host.href = card.headingA.getAttribute('href');
        module.append(host);
      } else {
        host = module;
      }
      const promo = el('div', 'promo promo-simple', host);
      const headWrap = el('div', 'promo-icon-header-wrapper', promo);
      if (card.icon) headWrap.append(iconCircle(card.icon));
      const header = el('div', 'promo-header', headWrap);
      const h = el('h3', 'title minion-heading heading-center', header);
      h.textContent = card.heading ? card.heading.textContent.trim() : '';
      promo.append(document.createTextNode(' '));
      const text = el('div', 'promo-text', promo);
      fillPromoText(text, card, arrow);
      return;
    }

    // promo panel (colored background)
    const promo = el('div', `promo promo-with-background${card.icon ? '' : ' promo-no-icon'}`, module);
    const headWrap = el('div', 'promo-icon-header-wrapper', promo);
    if (card.icon) headWrap.append(iconCircle(card.icon));
    const header = el('div', 'promo-header', headWrap);
    const h = el('h3', 'title minion-heading heading-center', header);
    if (card.heading) [...card.heading.childNodes].forEach((n) => h.append(n.cloneNode(true)));
    const text = el('div', 'promo-text', promo);
    fillPromoText(text, card, arrow);
  });

  if (stackedPair) {
    const cols = [...table.children];
    const left = el('div', 'stack-col left');
    const right = el('div', 'stack-col right');
    cols.forEach((c, i) => (i < 3 ? left : right).append(c));
    table.append(left, right);
  }

  block.replaceChildren(table);
}
