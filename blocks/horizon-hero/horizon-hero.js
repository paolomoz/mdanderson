/*
 * horizon-hero — 100svh cinematic hero (horizon demo, branch horizon only).
 * Decode tier: TEMPLATE-SLOTTED (#95) — prototype DOM emitted verbatim;
 * authored values (photo, h1 with <em>cancer</em> highlight, credit line,
 * ranking link) slotted by role. Owns the motion boot: dynamically imports
 * scripts/horizon-motion.js (module import — CSP strict-dynamic trusted).
 */
import { el } from '../../scripts/horizon-ui.js';

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const media = cell.querySelector('picture') || cell.querySelector('img');
  const heading = cell.querySelector('h1, h2, h3');
  const paras = [...cell.querySelectorAll('p')].filter((p) => !p.querySelector('img, picture'));
  const credit = paras.find((p) => !p.querySelector('a') && p.textContent.trim());
  const link = cell.querySelector('a');

  block.textContent = '';

  const mediaWrap = el('div', 'hero-media');
  if (media) {
    const m = media.cloneNode(true);
    const img = m.tagName === 'IMG' ? m : m.querySelector('img');
    if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
    mediaWrap.append(m);
  }

  const content = el('div', 'hero-content hz-wrap');
  if (heading) {
    // authored: "#1 in the nation for *cancer* care" — em carries the red
    // block highlight; leading #1 gets the rank tint.
    const h1 = el('h1', '', heading.innerHTML
      .replace(/<em>(.*?)<\/em>/, '<span class="hl">$1</span>')
      .replace(/^#1/, '<span class="rank num">#1</span>'));
    content.append(h1);
  }
  const creditRow = el('div', 'hero-credit');
  creditRow.append(el('span', 'rule'));
  if (credit) creditRow.append(el('p', '', credit.innerHTML));
  if (link) {
    const a = el('a', '', link.textContent.trim());
    a.href = link.href;
    creditRow.append(a);
  }
  content.append(creditRow);

  const cue = el('div', 'scroll-cue', 'SCROLL');
  cue.setAttribute('aria-hidden', 'true');

  block.append(mediaWrap, content, cue);

  import('../../scripts/horizon-motion.js').then((m) => m.default()).catch(() => {});
}
