/*
 * horizon-footer — ink footer with strike wordmark + mission (horizon demo).
 * Decode tier: TEMPLATE-SLOTTED (#95). The standard footer chrome is hidden
 * under body.horizon (styles.css); this in-main block carries the horizon
 * footer per the demo's namespaced design.
 * Rows: 1 brand text + mission p · 2–4 link columns (h3-ish title + ul) ·
 * 5 legal links ul + copyright p.
 */
import { el, rows } from '../../scripts/horizon-ui.js';

export default function decorate(block) {
  const r = rows(block);
  const brandCell = r[0]?.[0];
  const cols = [r[1]?.[0], r[2]?.[0], r[3]?.[0]];
  const legalCell = r[4]?.[0];

  block.textContent = '';
  const wrap = el('div', 'hz-wrap');
  const top = el('div', 'foot-top');

  const brand = el('div', 'foot-brand');
  const brandText = brandCell?.querySelector('h1, h2, h3, strong')?.textContent.trim() || 'MD Anderson Cancer Center';
  brand.insertAdjacentHTML('beforeend',
    `<span class="brand site-footer__wordmark">${brandText.replace(/Cancer/, '<span class="strike">Cancer</span>')}</span>`);
  const mission = brandCell?.querySelector('p');
  if (mission) brand.append(el('p', 'foot-mission', mission.innerHTML));
  top.append(brand);

  cols.forEach((c) => {
    if (!c) return;
    const nav = el('nav', 'foot-col');
    const title = c.querySelector('h3, h4, strong');
    if (title) {
      nav.setAttribute('aria-label', title.textContent.trim());
      nav.append(el('h3', '', title.innerHTML));
    }
    const ul = c.querySelector('ul');
    if (ul) nav.append(ul.cloneNode(true));
    top.append(nav);
  });
  wrap.append(top);

  const legal = el('div', 'foot-legal');
  if (legalCell) {
    [...(legalCell.querySelector('ul')?.querySelectorAll('a') || [])].forEach((a) => legal.append(a.cloneNode(true)));
    const copy = [...legalCell.querySelectorAll('p')].find((p) => /©/.test(p.textContent));
    if (copy) legal.append(el('span', 'copy', copy.innerHTML));
  }
  wrap.append(legal);
  block.append(wrap);
}
