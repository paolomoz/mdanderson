/*
 * horizon-stories — chapter 03: filmstrip (horizon demo).
 * Decode tier: TEMPLATE-SLOTTED (#95).
 * Rows: 1 head (h2 + lead) · then one row per film:
 * [media cell (image or thumb or empty)] [content cell (kicker p ·
 * h3 · dek p · link)]. First film row = lead video film.
 * Typographic film = media image width attr < 400 (captured thumbs) or none.
 */
import { el, icon, tlink, rows, railHTML } from '../../scripts/horizon-ui.js';

export default function decorate(block) {
  const r = rows(block);
  const head = r[0]?.[0];
  const films = r.slice(1);

  block.textContent = '';

  const grid = el('div', 'hz-wrap chap-grid');
  grid.insertAdjacentHTML('beforeend', railHTML('03'));
  const col = el('div');
  const headWrap = el('div', 'chap-head');
  headWrap.setAttribute('data-anim', '');
  headWrap.insertAdjacentHTML('beforeend', '<span class="chap-no num" aria-hidden="true">03</span>');
  headWrap.append(el('h2', 'chap-h2', head?.querySelector('h1, h2, h3')?.innerHTML || 'UT MD Anderson Highlights'));
  col.append(headWrap);
  const leadP = head?.querySelector('p');
  if (leadP) {
    const lead = el('p', 'chap-lead', leadP.innerHTML);
    lead.setAttribute('data-anim', '');
    col.append(lead);
  }
  grid.append(col);

  const strip = el('div', 'films');
  strip.tabIndex = 0;
  strip.setAttribute('role', 'region');
  strip.setAttribute('aria-label', 'Highlights — scroll horizontally');

  films.forEach(([mediaCell, contentCell], i) => {
    if (!contentCell) return;
    const img = mediaCell?.querySelector('img');
    const pic = mediaCell?.querySelector('picture') || img;
    const kicker = contentCell.querySelector('p');
    const h3 = contentCell.querySelector('h3, h4, strong');
    const dek = [...contentCell.querySelectorAll('p')].find((p) => p !== kicker && !p.querySelector('a'));
    const a = contentCell.querySelector('a');
    const isLead = i === 0;
    const isPhoto = img && (parseInt(img.getAttribute('width') || '0', 10) >= 400);

    if (isPhoto) {
      const film = el('a', `film${isLead ? ' film--lead' : ''}`);
      film.setAttribute('data-anim', '');
      film.href = a?.href || '#';
      const media = el('span', 'film-img');
      media.append(pic.cloneNode(true));
      const txt = el('span', 'film-txt');
      if (isLead && a) txt.insertAdjacentHTML('beforeend', `<span class="play-pill">${icon('play')} ${a.textContent.trim()}</span>`);
      if (kicker) txt.insertAdjacentHTML('beforeend', `<span class="cat">${kicker.textContent.trim()}</span>`);
      if (h3) txt.append(el('h3', '', h3.innerHTML));
      if (dek) txt.append(el('p', '', dek.innerHTML));
      film.append(media, txt);
      strip.append(film);
    } else {
      const film = el('span', `film film--type${i % 2 === 0 ? ' paper' : ''}`);
      film.setAttribute('data-anim', '');
      film.setAttribute('role', 'listitem');
      if (kicker) film.insertAdjacentHTML('beforeend', `<span class="cat">${kicker.textContent.trim()}</span>`);
      const isRank = h3 && /#1|top ranking/i.test(contentCell.textContent);
      if (isRank) film.insertAdjacentHTML('beforeend', '<span class="big-rank num" aria-hidden="true">#1</span>');
      if (h3) film.append(el('h3', '', h3.innerHTML));
      if (dek) film.append(el('p', '', dek.innerHTML));
      if (pic && !isRank) {
        const thumb = el('span', 'thumb');
        thumb.append(pic.cloneNode(true));
        film.append(thumb);
      }
      if (a) film.append(tlink(a.cloneNode(true)));
      strip.append(film);
    }
  });
  block.append(grid, strip);

  const hint = el('div', 'hz-wrap');
  hint.insertAdjacentHTML('beforeend', `<p class="films-hint">${icon('arrow')} DRAG OR SCROLL</p>`);
  block.append(hint);
  block.closest('.section')?.setAttribute('id', 'stories');
}
