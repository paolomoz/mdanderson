/*
 * uplift-endcancer — Help #EndCancer conversion trio (uplift-c demo).
 * Decode tier: TEMPLATE-SLOTTED per card (#95) — prototype §.endcancer DOM
 * verbatim; one authored row per card (h3 + p + CTA [+ note]). Card ground
 * color by position (red / black / blue — the prototype's composition).
 * The section head ("Help #EndCancer") is default content styled in place.
 */

const CARD_COLORS = ['red', 'black', 'blue'];

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'ec-grid';

  [...block.children].forEach((row, i) => {
    const cell = row.querySelector(':scope > div') || row;
    const heading = cell.querySelector('h2, h3');
    const cta = cell.querySelector('a');
    const paragraphs = [...cell.querySelectorAll('p')]
      .filter((p) => !p.querySelector('a') && p.textContent.trim());
    const body = paragraphs[0];
    const note = paragraphs[1];

    const card = document.createElement('div');
    card.className = `ec-card ${CARD_COLORS[i % CARD_COLORS.length]}`;
    card.setAttribute('data-anim', '');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      card.append(h3);
    }
    if (body) {
      const p = document.createElement('p');
      p.textContent = body.textContent.trim();
      card.append(p);
    }
    if (cta) {
      const a = document.createElement('a');
      a.className = 'btn btn--white';
      a.href = cta.href;
      a.textContent = cta.textContent.trim();
      if (/mdandersonbloodbank/.test(cta.href)) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      card.append(a);
    }
    if (note) {
      const span = document.createElement('span');
      span.className = 'ec-note';
      span.textContent = note.textContent.trim();
      card.append(span);
    }
    grid.append(card);
  });

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(grid);
  block.textContent = '';
  block.append(wrap);
}
