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
  const cta = [...row.querySelectorAll('a')].find((a) => !heading || !heading.contains(a));
  const bodyPs = [...row.querySelectorAll('p')]
    .filter((p) => p.textContent.trim() && !p.querySelector('a, span.icon, picture, img') && !iconTokenOf(p));
  let icon = iconSpan
    ? ([...iconSpan.classList].find((c) => c.startsWith('icon-') && c !== 'icon') || '').replace('icon-', '')
    : null;
  if (!icon) {
    icon = [...row.querySelectorAll('p')].map(iconTokenOf).find(Boolean) || null;
  }
  // program-cluster addition: an authored card image (breast-cancer about
  // rail, `rail` variant — eds-conversion-log §6.5)
  const media = row.querySelector('picture, img');
  return { icon, heading, headingA, cta, bodyPs, media };
}

/** body paragraphs + CTA into a promo-text div (shared by both card kinds) */
function fillPromoText(text, card, arrow) {
  if (card.bodyPs.length) {
    const body = el('div', 'body promo-text-normal', text);
    card.bodyPs.forEach((p) => {
      const copy = p.cloneNode(true);
      wrapNowrap(copy);
      body.append(copy);
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
  const arrow = block.classList.contains('arrow');
  const cards = [...block.children].map(collectCard).filter((c) => c.heading || c.cta);
  if (!cards.length) return;

  const table = el('div', 'table cards-table');

  cards.forEach((card) => {
    const col = el('div', 'card-col', table);
    const module = el('div', 'module m-bleed', col);

    // program-cluster addition: authored card image renders above the panel
    if (card.media) {
      const mediaDiv = el('div', 'card-media', module);
      mediaDiv.append((card.media.closest && card.media.closest('picture')) || card.media);
    }

    if (isIcon) {
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

  block.replaceChildren(table);
}
