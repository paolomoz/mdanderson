/*
 * horizon-ui.js — tiny shared helpers for the horizon-* blocks
 * (branch horizon only). Cross-block imports ride /scripts/ per AGENTS.md.
 */

/** create an element with class and optional html */
export function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

/** authored stroke icon set (one consistent 1.75 stroke grammar) */
const ICONS = {
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4.2-4.2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20c1.6-3.4 4.3-5 7.5-5s5.9 1.6 7.5 5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  steth: '<path d="M8 3v5a4 4 0 0 0 8 0V3"/><path d="M12 12v3a5 5 0 0 0 5 5h0a5 5 0 0 0 2-9.6"/><circle cx="20" cy="13" r="1.6"/>',
  drop: '<path d="M12 3.5c3.2 4.2 6 7.2 6 10.4a6 6 0 0 1-12 0c0-3.2 2.8-6.2 6-10.4Z"/>',
  heart: '<path d="M12 20.5s-7.5-4.6-9.3-9A5.2 5.2 0 0 1 12 6.6a5.2 5.2 0 0 1 9.3 4.9c-1.8 4.4-9.3 9-9.3 9Z"/>',
  bag: '<path d="M5 8h14l-1.2 12a1.8 1.8 0 0 1-1.8 1.5H8a1.8 1.8 0 0 1-1.8-1.5L5 8Z"/><path d="M8.5 10V6.8a3.5 3.5 0 0 1 7 0V10"/>',
  people: '<path d="M8 10.5a4 4 0 1 1 4 4"/><path d="M3.5 20c1.3-2.8 3.6-4.2 6.5-4.2"/><circle cx="17" cy="15.5" r="3.2"/><path d="M13.6 21.5c.8-1.8 2-2.6 3.4-2.6s2.6.8 3.4 2.6"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17H6.5A2.5 2.5 0 0 1 4 14.5v-8Z"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-10.4a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.4" r="2.3"/>',
  pen: '<path d="M15.5 4.5 19.5 8.5 8.5 19.5H4.5v-4Z"/><path d="m13 7 4 4"/>',
  q: '<path d="M9 9.2A3.2 3.2 0 1 1 12 13v1.6"/><circle cx="12" cy="18.6" r=".4"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
};

export function icon(name, cls = 'ic') {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/** turn a plain <a> into the horizon text-link with arrow */
export function tlink(a) {
  a.className = 'tlink';
  a.insertAdjacentHTML('beforeend', ` ${icon('arrow')}`);
  return a;
}

/** rows of a block table as [cells[]] */
export function rows(block) {
  return [...block.querySelectorAll(':scope > div')].map((r) => [...r.children]);
}

/** the shared 01–04 chapter rail (template constant) */
export function railHTML(active) {
  const items = [
    ['#your-care', '01', 'Your care'],
    ['#why', '02', 'Why MD Anderson'],
    ['#stories', '03', 'Stories'],
    ['#take-action', '04', 'Take action'],
  ];
  const lis = items.map(([href, n, label]) => `<li><a href="${href}"${n === active ? ' aria-current="true"' : ''}${active !== '01' ? ' tabindex="-1"' : ''}><span class="n">${n}</span> ${label}</a></li>`).join('');
  return `<aside class="rail"${active === '01' ? ' aria-label="Page chapters"' : ' aria-hidden="true"'}><ol>${lis}</ol></aside>`;
}
