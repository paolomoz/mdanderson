/*
 * horizon-support — support programs + Cancerwise newsletter panel
 * (horizon demo). Decode tier: TEMPLATE-SLOTTED (#95). The subscribe form
 * is interactive chrome rendered in block JS (D15).
 * Rows: 1 head (h2 + intro p) · 2–3 support cards (h3 + p + link) ·
 * 4 quick links ul · 5 newsletter (h2 + p + action link + note p).
 */
import { el, icon, tlink, rows } from '../../scripts/horizon-ui.js';

const CARD_ICONS = [['connection', 'people'], ['counseling', 'chat']];
const QUICK_ICONS = [['location', 'pin'], ['blog', 'pen'], ['question', 'q']];

export default function decorate(block) {
  const r = rows(block);
  const head = r[0]?.[0];
  const cards = [r[1]?.[0], r[2]?.[0]];
  const quick = [...(r[3]?.[0]?.querySelectorAll('a') || [])];
  const nl = r[4]?.[0];

  block.textContent = '';
  const grid = el('div', 'hz-wrap support-grid');

  const left = el('div');
  if (head) {
    const h2 = el('h2', '', head.querySelector('h1, h2, h3')?.innerHTML || '');
    h2.setAttribute('data-anim', '');
    left.append(h2);
    const introP = head.querySelector('p');
    if (introP) left.append(el('p', 'intro', introP.innerHTML));
  }
  cards.forEach((c) => {
    if (!c) return;
    const card = el('article', 'sup-card');
    card.setAttribute('data-anim', '');
    const h3 = c.querySelector('h3, h4, strong');
    const key = (CARD_ICONS.find(([k]) => (h3?.textContent || '').toLowerCase().includes(k)) || [])[1] || 'people';
    card.insertAdjacentHTML('beforeend', `<span class="ic-badge">${icon(key)}</span>`);
    const body = el('div');
    const p = [...c.querySelectorAll('p')].find((x) => !x.querySelector('a'));
    const a = c.querySelector('a');
    if (h3) body.append(el('h3', '', h3.innerHTML));
    if (p) body.append(el('p', '', p.innerHTML));
    if (a) body.append(tlink(a.cloneNode(true)));
    card.append(body);
    left.append(card);
  });
  const pills = el('div', 'quick-pills');
  pills.setAttribute('data-anim', '');
  quick.forEach((a) => {
    const key = (QUICK_ICONS.find(([k]) => a.textContent.toLowerCase().includes(k)) || [])[1] || 'pin';
    const link = el('a', '', `${icon(key)} ${a.textContent.trim()}`);
    link.href = a.href;
    pills.append(link);
  });
  left.append(pills);
  grid.append(left);

  if (nl) {
    const panel = el('aside', 'nl-panel strike-cut');
    panel.setAttribute('data-anim', '');
    const h2 = nl.querySelector('h1, h2, h3');
    const ps = [...nl.querySelectorAll('p')].filter((p) => !p.querySelector('a'));
    const a = nl.querySelector('a');
    panel.insertAdjacentHTML('beforeend', '<span class="kicker">Cancerwise</span>');
    if (h2) panel.append(el('h2', '', h2.innerHTML));
    if (ps[0]) panel.append(el('p', '', ps[0].innerHTML));
    const form = el('form', 'nl-form');
    form.action = a?.href || 'https://www.mdanderson.org/cancerwise.html';
    form.method = 'get';
    const label = el('label', 'hz-sr', 'Email address');
    label.setAttribute('for', 'hz-nl-email');
    const input = el('input');
    input.id = 'hz-nl-email'; input.type = 'email'; input.name = 'email';
    input.placeholder = 'Email address'; input.autocomplete = 'email';
    const btn = el('button', '', a?.textContent.trim() || 'Subscribe');
    btn.type = 'submit';
    form.append(label, input, btn);
    panel.append(form);
    if (ps[1]) panel.append(el('p', 'nl-note', ps[1].innerHTML));
    grid.append(panel);
  }
  block.append(grid);
}
