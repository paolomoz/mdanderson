/*
 * uplift-hero — cinematic hero (uplift-c demo, branch uplift-c only).
 * Decode tier: TEMPLATE-SLOTTED (#95) — the prototype section DOM
 * (stardust/prototypes/uplift-c.html §.hero) is emitted verbatim; authored
 * values (background image, h1, CTA) are slotted by role.
 * Owns the motion boot: dynamically imports scripts/uplift-motion.js
 * (module import — CSP strict-dynamic trusted; no content <script>).
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const media = cell.querySelector('picture') || cell.querySelector('img');
  const heading = cell.querySelector('h1, h2, h3');
  const cta = [...cell.querySelectorAll('a')].find((a) => !a.querySelector('img, picture'));

  // ── template (prototype DOM verbatim) ──
  const marquee = document.createElement('div');
  marquee.className = 'hero-marquee';

  if (media) {
    const mediaEl = media.cloneNode(true);
    const img = mediaEl.tagName === 'IMG' ? mediaEl : mediaEl.querySelector('img');
    if (img) {
      img.classList.add('hero-bg');
      // LCP: the metadata section empties the first section, so the runtime
      // eager-izes nothing — force it here (#100)
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
    }
    if (mediaEl.tagName === 'PICTURE') mediaEl.classList.add('hero-bg-picture');
    marquee.append(mediaEl);
  }

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const copy = document.createElement('div');
  copy.className = 'hero-copy';
  if (heading) {
    const h1 = document.createElement('h1');
    h1.innerHTML = heading.innerHTML;
    copy.append(h1);
  }
  if (cta) {
    const a = document.createElement('a');
    a.className = 'btn btn--white';
    a.href = cta.href;
    a.textContent = cta.textContent.trim();
    copy.append(a);
  }
  wrap.append(copy);
  marquee.append(wrap);

  block.textContent = '';
  block.append(marquee);

  // ── motion boot (once per page) ──
  if (!window.__upliftMotionBooted) {
    window.__upliftMotionBooted = true;
    import('../../scripts/uplift-motion.js')
      .then((m) => m.default())
      // eslint-disable-next-line no-console
      .catch((e) => console.warn('uplift-motion failed to boot (static render stands)', e));
  }
}
