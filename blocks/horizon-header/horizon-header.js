/*
 * horizon-header — Lilly-model pill header + canopy mega-menu (horizon demo,
 * branch horizon only). Decode tier: TEMPLATE-SLOTTED (#95) — the prototype
 * header DOM (stardust/prototypes/horizon-proposed.html) is emitted verbatim;
 * authored values (brand, nav links, utility links, canopy statement +
 * feature) are slotted by row.
 * Rows: 1 brand text · 2 nav links ul · 3 physicians link · 4 utility links
 * (search, MyChart, CTA) · 5 canopy statement (h2-ish text + p) · 6 feature
 * (image + title + link).
 */
import { el, icon, rows } from '../../scripts/horizon-ui.js';

function brandHTML(text) {
  return text.replace(/Cancer/, '<span class="strike">Cancer</span>');
}

export default function decorate(block) {
  const r = rows(block);
  const brandText = r[0]?.[0]?.textContent.trim() || 'MD Anderson Cancer Center';
  const navLinks = [...(r[1]?.[0]?.querySelectorAll('a') || [])];
  const proLink = r[2]?.[0]?.querySelector('a');
  const utilLinks = [...(r[3]?.[0]?.querySelectorAll('a') || [])];
  const stmt = r[4]?.[0];
  const feature = r[5]?.[0];

  block.textContent = '';

  // ── collapsed pills ──
  const bar = el('div', 'hz-nav-bar');
  const left = el('div', 'npill');
  const brand = el('a', 'brand', brandHTML(brandText));
  brand.href = navLinks[0]?.href || '/';
  const burger = el('button', 'burger', '<i></i><i></i><i></i>');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'hz-canopy');
  burger.setAttribute('aria-label', 'Open menu');
  left.append(brand, burger);

  const right = el('div', 'npill npill-utility');
  const [searchA, mychartA, ctaA] = utilLinks;
  if (searchA) {
    const a = el('a', 'util', icon('search'));
    a.href = searchA.href; a.setAttribute('aria-label', 'Search');
    right.append(a);
  }
  if (mychartA) {
    const a = el('a', 'util', `${icon('user')}<span class="lbl">${mychartA.textContent.trim()}</span>`);
    a.href = mychartA.href;
    right.append(a);
  }
  if (ctaA) {
    const a = el('a', 'hz-pill hz-pill-red', ctaA.textContent.trim());
    a.href = ctaA.href;
    right.append(a);
  }
  bar.append(left, right);

  // ── canopy ──
  const scrim = el('div', 'canopy-scrim');
  const canopy = el('nav', 'canopy');
  canopy.id = 'hz-canopy';
  canopy.setAttribute('aria-label', 'Site menu');

  const top = el('div', 'canopy-top');
  top.append(el('span', 'brand', brandHTML(brandText)));
  const close = el('button', 'canopy-close', icon('close'));
  close.setAttribute('aria-label', 'Close menu');
  top.append(close);

  const navRow = el('div', 'canopy-nav');
  navLinks.forEach((a, i) => {
    const link = el('a', '', a.textContent.trim());
    link.href = a.href;
    if (i === 0) link.setAttribute('aria-current', 'page');
    navRow.append(link);
  });
  navRow.append(el('span', 'spacer'));
  if (proLink) {
    const a = el('a', 'pro', `${icon('steth')} ${proLink.textContent.trim()}`);
    a.href = proLink.href;
    navRow.append(a);
  }

  const body = el('div', 'canopy-body');
  const stmtWrap = el('div');
  if (stmt) {
    const h = stmt.querySelector('h1, h2, h3, strong');
    const p = stmt.querySelector('p:last-of-type');
    stmtWrap.append(el('p', 'canopy-title', (h?.innerHTML || 'Making Cancer History®').replace(/History(<sup>)?®?(<\/sup>)?/, 'History<sup>®</sup>').replace(/Cancer History/, 'Cancer <em>History</em>')));
    if (p && p !== h) stmtWrap.append(el('p', 'canopy-sub', p.innerHTML));
  }
  body.append(stmtWrap);
  if (feature) {
    const img = feature.querySelector('picture') || feature.querySelector('img');
    const title = feature.querySelector('h1, h2, h3, strong');
    const link = feature.querySelector('a');
    const card = el('a', 'canopy-feature');
    card.href = link?.href || '#';
    if (img) card.append(img.cloneNode(true));
    card.insertAdjacentHTML('beforeend', `<figcaption><strong>${title?.textContent.trim() || ''}</strong><span>${link?.textContent.trim() || ''}</span></figcaption>${icon('arrow', 'ic ic-arrow')}`);
    body.append(card);
  }
  canopy.append(top, navRow, body);
  block.append(bar, scrim, canopy);

  const setOpen = (o) => {
    canopy.classList.toggle('open', o);
    scrim.classList.toggle('open', o);
    burger.setAttribute('aria-expanded', String(o));
    document.documentElement.classList.toggle('hz-canopy-lock', o);
    (o ? canopy.querySelector('a, button') : burger).focus();
  };
  burger.addEventListener('click', () => setOpen(!canopy.classList.contains('open')));
  scrim.addEventListener('click', () => setOpen(false));
  close.addEventListener('click', () => setOpen(false));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && canopy.classList.contains('open')) setOpen(false);
  });
}
