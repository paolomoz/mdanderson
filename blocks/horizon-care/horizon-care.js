/*
 * horizon-care — chapter 01: plan your care (horizon demo).
 * Decode tier: TEMPLATE-SLOTTED (#95).
 * Rows: 1 head (h2 + lead p) · 2 photo · 3–5 cards (h3 + p + link) ·
 * 6 planning-resources CTA link.
 */
import { el, tlink, rows, railHTML } from '../../scripts/horizon-ui.js';

export default function decorate(block) {
  const r = rows(block);
  const head = r[0]?.[0];
  const photo = r[1]?.[0]?.querySelector('picture, img');
  const cards = r.slice(2, 5).map((row) => row[0]);
  const cta = r[5]?.[0]?.querySelector('a');

  block.textContent = '';
  const grid = el('div', 'hz-wrap chap-grid');
  grid.insertAdjacentHTML('beforeend', railHTML('01'));

  const col = el('div');
  const headWrap = el('div', 'chap-head');
  headWrap.setAttribute('data-anim', '');
  headWrap.insertAdjacentHTML('beforeend', '<span class="chap-no num" aria-hidden="true">01</span>');
  const h2 = el('h2', 'chap-h2', head?.querySelector('h1, h2, h3')?.innerHTML || '');
  headWrap.append(h2);
  col.append(headWrap);
  const leadP = head?.querySelector('p');
  if (leadP) {
    const lead = el('p', 'chap-lead', leadP.innerHTML);
    lead.setAttribute('data-anim', '');
    col.append(lead);
  }

  const band = el('div', 'care-band');
  if (photo) {
    const fig = el('figure', 'care-photo');
    fig.setAttribute('data-anim', '');
    fig.append(photo.cloneNode(true));
    band.append(fig);
  }
  const cardsWrap = el('div', 'care-cards');
  cards.forEach((c) => {
    if (!c) return;
    const card = el('article', 'care-card');
    card.setAttribute('data-anim', '');
    const h3 = c.querySelector('h3, h4, strong');
    const p = [...c.querySelectorAll('p')].find((x) => !x.querySelector('a'));
    const a = c.querySelector('a');
    if (h3) card.append(el('h3', '', h3.innerHTML));
    if (p) card.append(el('p', '', p.innerHTML));
    if (a) card.append(tlink(a.cloneNode(true)));
    cardsWrap.append(card);
  });
  band.append(cardsWrap);
  col.append(band);

  if (cta) {
    const more = el('p', 'care-more');
    const a = el('a', 'hz-ghost', cta.textContent.trim());
    a.href = cta.href;
    more.append(a);
    col.append(more);
  }
  grid.append(col);
  block.append(grid);
  block.closest('.section')?.setAttribute('id', 'your-care');
}
