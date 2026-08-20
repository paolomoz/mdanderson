/*
 * uplift-highlights — 8-story editorial grid with cascade entrances
 * (uplift-c demo). Decode tier: TEMPLATE-SLOTTED per card (#95) — one
 * authored row per story (image p + linked h3 + description p) slotted
 * into the prototype §.highlights card template. The section head
 * ("UT MD Anderson Highlights") is default content styled in place
 * (.uplift-highlights-container .default-content-wrapper).
 */

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'hl-grid';

  [...block.children].forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    const media = cell.querySelector('picture') || cell.querySelector('img');
    const heading = cell.querySelector('h2, h3, h4');
    const link = cell.querySelector('a');
    const desc = [...cell.querySelectorAll('p')]
      .find((p) => !p.querySelector('img, picture, a') && p.textContent.trim());

    const card = document.createElement('a');
    card.className = 'hl-card';
    card.setAttribute('data-anim', '');
    if (link) card.href = link.href;
    if (media) card.append(media.cloneNode(true));
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      card.append(h3);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      card.append(p);
    }
    grid.append(card);
  });

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(grid);
  block.textContent = '';
  block.append(wrap);
}
