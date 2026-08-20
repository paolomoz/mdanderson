/**
 * quote — person spotlight / pull quote (Block Collection name, D11).
 * Decode tier: template-slotted (eds-conversion-log §5, #95).
 * Converts on research (pull-quote, variant `spotlight`); `rail` variant is
 * added by the interior pages that reuse it.
 * Schema: stardust/eds-schema/research-html.json (pull-quote).
 *
 * Authoring: one row, two cells.
 *   cell 1 (person): <h2>kicker</h2>, <p><img headshot 132x132></p>,
 *     <h3>Name</h3>, <p>role line 1</p>, <p>role line 2</p>
 *   cell 2 (quote): <p>quote text</p>
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'quote') return;
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cells = [...row.children];
  const personCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
  const quoteCell = cells.find((c) => c !== personCell) || cells[1];

  const wrap = el('div', 'spotlight-quote spotlight-quote-alt');

  const info = el('div', 'info');
  const kicker = personCell.querySelector('h1, h2');
  if (kicker) {
    const h2 = el('h2', '', info);
    h2.textContent = kicker.textContent.trim();
  }
  const media = personCell.querySelector('picture, img');
  if (media) {
    const imgWrap = el('div', 'image-container', info);
    imgWrap.append(media.closest('picture') || media);
  }
  const name = personCell.querySelector('h3, h4');
  if (name) {
    const h3 = el('h3', '', info);
    h3.textContent = name.textContent.trim();
  }
  const roles = [...personCell.querySelectorAll('p')]
    .filter((p) => p.textContent.trim() && !p.querySelector('picture, img'));
  if (roles[0]) { const p = el('p', 'secondary-info', info); p.textContent = roles[0].textContent.trim(); }
  if (roles[1]) { const p = el('p', 'other-info', info); p.textContent = roles[1].textContent.trim(); }

  const quote = el('div', 'quote');
  const qi = el('div', 'quote-icon', quote);
  el('i', 'fa mda-icon-leftquote mda-2x', qi).setAttribute('aria-hidden', 'true');
  if (quoteCell) {
    [...quoteCell.querySelectorAll('p')].forEach((p) => {
      if (p.textContent.trim()) quote.append(p.cloneNode(true));
    });
    if (!quote.querySelector('p') && quoteCell.textContent.trim()) {
      const p = el('p', '', quote);
      p.textContent = quoteCell.textContent.trim();
    }
  }

  wrap.append(info, quote);
  block.replaceChildren(wrap);
}
