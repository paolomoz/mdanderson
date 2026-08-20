/**
 * columns — two-column split bands (Block Collection name, D11).
 * Decode tier: reconstructive (eds-conversion-log §5).
 * Converts on index (award-why-choose, variant `badge`); reused with
 * `image-left` / `image-right` / `contact` variants by other pages.
 * Schema: stardust/eds-schema/index.json (award-why-choose),
 * patients-family-html.json (award-why-choose).
 *
 * Authoring: one row, two cells.
 *   badge variant, cell 1 (the award badge composite):
 *     <p><img badge></p>, <p>15</p> (count), <p>Years</p> (label),
 *     <p>Best Hospitals…</p> (heading), <p>U.S. News…</p> (subhead)
 *   cell 2 (prose): <h2>, <p> body…, <p><a>text CTA</a></p>
 *   image-left / image-right: cell = <p><img></p>, other cell = prose.
 *
 * "UT MD Anderson" is re-wrapped in span.nowrap (presentational, #39).
 */

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

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

function buildBadgeCell(cell) {
  const col = el('div', 'col-double cell-f middle');
  const module = el('div', 'module', col);
  const badge = el('div', 'badge scroll-trans', module);
  const imgWrap = el('div', 'badge-img-container', badge);
  const media = cell.querySelector('picture, img');
  if (media) imgWrap.append(media.closest('picture') || media);
  const texts = [...cell.querySelectorAll('p')]
    .filter((p) => p.textContent.trim() && !p.querySelector('picture, img'));
  const [count, label, heading, subhead] = texts;
  const overlay = el('div', 'badge-text', imgWrap);
  if (count) { const p = el('p', 'badge-countup', overlay); p.textContent = count.textContent.trim(); }
  if (label) { const p = el('p', 'countup-label', overlay); p.textContent = label.textContent.trim(); }
  const below = el('div', '', badge);
  if (heading) { const p = el('p', 'badge-heading', below); p.textContent = heading.textContent.trim(); }
  if (subhead) { const p = el('p', 'badge-subhead', below); p.textContent = subhead.textContent.trim(); }
  return col;
}

function buildProseCell(cell, last) {
  const col = el('div', `col-double${last ? ' last' : ''} cell-m`);
  const rte = el('div', 'rte-container basic-content', col);
  [...cell.children].forEach((node) => {
    const copy = node.cloneNode(true);
    const a = copy.querySelector?.('a');
    if (copy.tagName === 'P' && a && copy.textContent.trim() === a.textContent.trim()) {
      // text CTA — replica renders it inside span.cta (red underline link)
      const span = el('span', 'cta');
      a.removeAttribute('class');
      wrapNowrap(a);
      span.append(a);
      copy.textContent = '';
      copy.append(span);
    } else {
      wrapNowrap(copy);
    }
    rte.append(copy);
  });
  return col;
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'columns') return;
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cells = [...row.children];
  const table = el('div', 'table award-table');

  if (block.classList.contains('badge')) {
    const badgeIdx = cells.findIndex((c) => c.querySelector('picture, img'));
    const proseIdx = badgeIdx === 0 ? 1 : 0;
    if (cells[badgeIdx]) table.append(buildBadgeCell(cells[badgeIdx]));
    if (cells[proseIdx]) table.append(buildProseCell(cells[proseIdx], true));
  } else {
    // generic image/prose split (image-left / image-right reusers)
    cells.forEach((cell, i) => {
      const col = el('div', `col-double${i === cells.length - 1 ? ' last' : ''} cell-m`, table);
      if (cell.querySelector('picture, img')) {
        const media = el('div', 'module col-media', col);
        media.append(...cell.childNodes);
      } else {
        col.append(buildProseCell(cell, false).firstElementChild);
      }
    });
  }

  block.replaceChildren(table);
}
