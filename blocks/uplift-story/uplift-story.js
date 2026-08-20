/*
 * uplift-story — full-bleed survivor-story band with play affordance
 * (uplift-c demo). Decode tier: TEMPLATE-SLOTTED (#95) — prototype §.story
 * DOM verbatim; authored image / title / watch-link slotted by role.
 */

const PLAY_SVG = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="#fff"/></svg>';

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const media = cell.querySelector('picture') || cell.querySelector('img');
  const heading = cell.querySelector('h2, h3');
  const link = [...cell.querySelectorAll('a')].find((a) => !a.querySelector('img, picture'));

  const frag = document.createDocumentFragment();
  if (media) {
    const mediaEl = media.cloneNode(true);
    const img = mediaEl.tagName === 'IMG' ? mediaEl : mediaEl.querySelector('img');
    if (img) img.classList.add('story-bg');
    frag.append(mediaEl);
  }

  const overlay = document.createElement('div');
  overlay.className = 'story-overlay';
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const title = heading ? heading.textContent.trim() : '';
  if (heading) {
    const h3 = document.createElement('h3');
    h3.setAttribute('data-anim', '');
    h3.textContent = title;
    wrap.append(h3);
  }
  if (link) {
    const a = document.createElement('a');
    a.className = 'play';
    a.href = link.href;
    a.setAttribute('aria-label', `Watch: ${title}`);
    a.innerHTML = PLAY_SVG;
    wrap.append(a);
  }
  overlay.append(wrap);
  frag.append(overlay);

  block.textContent = '';
  block.append(frag);
}
