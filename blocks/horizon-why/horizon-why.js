/*
 * horizon-why — chapter 02: credential interlude on ink (horizon demo).
 * Decode tier: TEMPLATE-SLOTTED (#95).
 * Rows: 1 h2 · 2 stats (ul: "#1|in the nation for cancer care",
 * "15|years — Best Hospitals in Cancer Care, U.S. News & World Report") ·
 * 3 body p + link · 4 photo.
 */
import { el, tlink, rows, railHTML } from '../../scripts/horizon-ui.js';

export default function decorate(block) {
  const r = rows(block);
  const h2Src = r[0]?.[0]?.querySelector('h1, h2, h3');
  const statItems = [...(r[1]?.[0]?.querySelectorAll('li') || [])];
  const bodyCell = r[2]?.[0];
  const photo = r[3]?.[0]?.querySelector('picture, img');

  block.textContent = '';
  const grid = el('div', 'hz-wrap chap-grid');
  grid.insertAdjacentHTML('beforeend', railHTML('02'));

  const cols = el('div', 'why-cols');
  const left = el('div');
  const headWrap = el('div', 'chap-head');
  headWrap.setAttribute('data-anim', '');
  headWrap.insertAdjacentHTML('beforeend', '<span class="chap-no num" aria-hidden="true">02</span>');
  left.append(headWrap);
  headWrap.append(el('h2', 'chap-h2', h2Src?.innerHTML || 'Why Choose UT MD Anderson'));

  const stats = el('div', 'why-stats');
  statItems.forEach((li, i) => {
    const [num, ...rest] = li.textContent.split('|');
    const stat = el('div', 'stat');
    stat.setAttribute('data-anim', '');
    const b = el('b', `num${i === 0 ? ' red' : ''}`, num.trim());
    if (/^\d+$/.test(num.trim())) b.setAttribute('data-countup', num.trim());
    stat.append(b, el('span', '', rest.join('|').trim()));
    stats.append(stat);
  });
  left.append(stats);

  if (bodyCell) {
    const p = [...bodyCell.querySelectorAll('p')].find((x) => !x.querySelector('a'));
    const a = bodyCell.querySelector('a');
    if (p) {
      const body = el('p', 'body', p.innerHTML);
      body.setAttribute('data-anim', '');
      left.append(body);
    }
    if (a) left.append(tlink(a.cloneNode(true)));
  }
  cols.append(left);

  if (photo) {
    const fig = el('figure', 'why-photo strike-cut');
    fig.setAttribute('data-anim', '');
    fig.append(photo.cloneNode(true));
    cols.append(fig);
  }
  grid.append(cols);
  block.append(grid);
  block.closest('.section')?.setAttribute('id', 'why');
  block.closest('.section')?.classList.add('on-ink');
}
