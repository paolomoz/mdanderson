/*
 * horizon-act — chapter 04: Help #EndCancer red band (horizon demo).
 * Decode tier: TEMPLATE-SLOTTED (#95).
 * Rows: 1 background image · 2 h2 · 3–5 tiles (h3 + p + link).
 * Tile icons keyed by title (drop / heart / bag).
 */
import { el, icon, tlink, rows, railHTML } from '../../scripts/horizon-ui.js';

const TILE_ICONS = [['blood', 'drop'], ['give', 'heart'], ['shop', 'bag']];

export default function decorate(block) {
  const r = rows(block);
  const bg = r[0]?.[0]?.querySelector('picture, img');
  const h2Src = r[1]?.[0]?.querySelector('h1, h2, h3');
  const tiles = r.slice(2, 5).map((row) => row[0]);

  block.textContent = '';

  if (bg) {
    const media = el('div', 'act-media');
    media.setAttribute('aria-hidden', 'true');
    media.append(bg.cloneNode(true));
    block.append(media);
  }

  const grid = el('div', 'hz-wrap chap-grid');
  grid.insertAdjacentHTML('beforeend', railHTML('04'));
  const col = el('div');
  const headWrap = el('div', 'chap-head');
  headWrap.setAttribute('data-anim', '');
  headWrap.insertAdjacentHTML('beforeend', '<span class="chap-no num" aria-hidden="true">04</span>');
  headWrap.append(el('h2', '', h2Src?.innerHTML || 'Help #EndCancer'));
  col.append(headWrap);

  const tilesWrap = el('div', 'act-tiles');
  tiles.forEach((t) => {
    if (!t) return;
    const tile = el('article', 'act-tile');
    tile.setAttribute('data-anim', '');
    const h3 = t.querySelector('h3, h4, strong');
    const p = [...t.querySelectorAll('p')].find((x) => !x.querySelector('a'));
    const a = t.querySelector('a');
    const key = (TILE_ICONS.find(([k]) => (h3?.textContent || '').toLowerCase().includes(k)) || [])[1] || 'heart';
    tile.insertAdjacentHTML('beforeend', `<span class="ic-badge">${icon(key)}</span>`);
    if (h3) tile.append(el('h3', '', h3.innerHTML));
    if (p) tile.append(el('p', '', p.innerHTML));
    if (a) tile.append(tlink(a.cloneNode(true)));
    tilesWrap.append(tile);
  });
  col.append(tilesWrap);
  grid.append(col);
  block.append(grid);
  block.closest('.section')?.setAttribute('id', 'take-action');
  block.closest('.section')?.classList.add('on-red');
}
