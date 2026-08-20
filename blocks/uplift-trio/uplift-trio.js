/*
 * uplift-trio — wayfinding icon trio (uplift-c demo).
 * Decode tier: TEMPLATE-SLOTTED per item (#95) — prototype §.trio DOM
 * verbatim; one authored row per item (linked h3). Disc icon + color are
 * fixed presentation by position (location red / blog blue / question
 * purple — the prototype's composition, recorded decision).
 */

const ICONS = [
  { cls: 'disc--red', svg: '<svg width="30" height="30" viewBox="0 0 30 30"><path d="M15 2a9.5 9.5 0 00-9.5 9.5C5.5 18.5 15 28 15 28s9.5-9.5 9.5-16.5A9.5 9.5 0 0015 2zm0 13a4 4 0 114-4 4 4 0 01-4 4z" fill="#fff"/></svg>' },
  { cls: 'disc--blue', svg: '<svg width="30" height="30" viewBox="0 0 30 30"><path d="M4 5h9a3 3 0 013 3v17a3 3 0 00-3-3H4zm22 0h-9a3 3 0 00-3 3v17a3 3 0 013-3h9z" fill="#fff"/></svg>' },
  { cls: 'disc--purple', svg: '<svg width="30" height="30" viewBox="0 0 30 30"><path d="M15 3a8 8 0 018 8c0 4-3 5.5-5 7-1.2.9-1.5 1.6-1.5 3h-3c0-2.4.8-3.8 2.6-5.2 1.7-1.3 3.9-2.3 3.9-4.8a5 5 0 00-10 0H7a8 8 0 018-8zm-1.5 21h3v3h-3z" fill="#fff"/></svg>' },
];

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'trio-grid';

  [...block.children].forEach((row, i) => {
    const link = row.querySelector('a');
    const label = row.textContent.trim();
    const icon = ICONS[i % ICONS.length];

    const item = document.createElement('a');
    item.className = 'trio-item';
    item.setAttribute('data-anim', '');
    if (link) item.href = link.href;
    const disc = document.createElement('span');
    disc.className = `disc ${icon.cls}`;
    disc.setAttribute('aria-hidden', 'true');
    disc.innerHTML = icon.svg;
    const h3 = document.createElement('h3');
    h3.textContent = link ? link.textContent.trim() : label;
    item.append(disc, h3);
    grid.append(item);
  });

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(grid);
  block.textContent = '';
  block.append(wrap);
}
