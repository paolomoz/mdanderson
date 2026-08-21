/*
 * horizon-finder — care-finder panel breaking the hero edge (horizon demo).
 * Decode tier: TEMPLATE-SLOTTED (#95). The search form is interactive
 * chrome rendered in block JS (D15 — never authored).
 * Rows: 1 search action link (href = search page; text = placeholder) ·
 * 2 most-searched links ul · 3 here-for-you sentence (verbatim).
 */
import { el, icon, tlink, rows } from '../../scripts/horizon-ui.js';

export default function decorate(block) {
  const r = rows(block);
  const searchA = r[0]?.[0]?.querySelector('a');
  const indexLinks = [...(r[1]?.[0]?.querySelectorAll('a') || [])];
  const foot = r[2]?.[0];

  block.textContent = '';
  const panel = el('div', 'finder-panel');

  const form = el('form', 'finder-form');
  form.action = searchA?.href || 'https://www.mdanderson.org/search.html';
  form.method = 'get';
  form.setAttribute('role', 'search');
  const label = el('label', 'finder-input',
    `${icon('search')}<span class="hz-sr">Search cancer types, clinical trials or doctors</span>`);
  const input = el('input');
  input.type = 'search'; input.name = 'q';
  input.placeholder = searchA?.textContent.trim() || 'Search cancer types, clinical trials or doctors…';
  label.append(input);
  const submit = el('button', '', 'Search');
  submit.type = 'submit';
  form.append(label, submit);

  const index = el('div', 'finder-index', '<span class="fi-label">Most searched</span>');
  indexLinks.forEach((a) => {
    const link = el('a', '', `<span class="w">${a.textContent.trim()}</span>`);
    link.href = a.href;
    index.append(link);
  });

  const footRow = el('div', 'finder-foot');
  if (foot) {
    footRow.innerHTML = foot.innerHTML;
    const strong = footRow.querySelector('strong');
    if (strong) strong.classList.add('lead');
    const apptA = [...footRow.querySelectorAll('a')].find((a) => !a.href.startsWith('tel:'));
    if (apptA) tlink(apptA);
    footRow.querySelectorAll('a[href^="tel:"]').forEach((a) => a.classList.add('tel', 'num'));
    footRow.querySelectorAll('p').forEach((p) => { p.replaceWith(...p.childNodes); });
  }

  panel.append(form, index, footRow);
  block.append(panel);
}
