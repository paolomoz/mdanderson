/**
 * video — composed poster + overlay video bands (Block Collection name, D11).
 * Decode tier: template-slotted (eds-conversion-log §5, #95).
 * Variants: `feature` (index full-bleed poster + scrim + title + play),
 * `teaser` (research/breast-center rail card), `panorama` (breast-center).
 * Schema: stardust/eds-schema/index.json (video-feature),
 * research-html.json (mission-prose rail).
 *
 * Authoring: one row, one cell:
 *   <p><img poster></p>, <h3>title</h3> (authored <br> kept),
 *   optional <p> body line(s), optional <p><a href="youtube…">Watch</a></p>
 *   (the link rides WITH the other content so it is not a bare authored
 *   embed — the block consumes it and wires the play button).
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

function youtubeId(href) {
  try {
    const u = new URL(href);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    return m ? m[1] : null;
  } catch { return null; }
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'video') return;
  const cell = block.querySelector(':scope > div > div') || block;
  const media = cell.querySelector('picture, img');
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  const videoA = [...cell.querySelectorAll('a')].find((a) => youtubeId(a.href || a.getAttribute('href') || ''));
  const bodyPs = [...cell.querySelectorAll('p')]
    .filter((p) => p.textContent.trim() && !p.querySelector('picture, img, a'));

  const teaser = block.classList.contains('teaser');
  const vid = videoA ? youtubeId(videoA.href || videoA.getAttribute('href')) : null;

  const wrapper = el('div', 'basic-content-media-wrapper');
  if (!teaser) wrapper.classList.add('video-scrim');

  const mediaWrap = el('div', 'media-image', wrapper);
  if (media) {
    const m = (media.closest && media.closest('picture')) || media;
    const img = m.tagName === 'IMG' ? m : m.querySelector('img');
    if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
    mediaWrap.append(m);
  }

  const inner = el('div', teaser ? 'media-inner-teaser' : 'media-inner', wrapper);
  const videoContainer = el('div', '', inner);
  videoContainer.id = 'basic-video-container';
  const body = el('div', 'media-body', inner);
  const text = el('div', 'media-body-text', body);
  if (heading) {
    const h = el('h3', '', text);
    [...heading.childNodes].forEach((n) => h.append(n.cloneNode(true)));
  }
  bodyPs.forEach((p) => {
    const line = el('div', 'carousel-body-text', text);
    const copy = p.cloneNode(true);
    line.append(copy);
  });

  const playHost = teaser ? body : text;
  const play = el('button', 'video-play-button', playHost);
  play.type = 'button';
  play.setAttribute('aria-label', heading ? `Play video: ${heading.textContent.trim()}` : 'Play video');
  el('span', 'mdicon-videoplay md-2x', play).setAttribute('aria-hidden', 'true');

  if (vid) {
    play.addEventListener('click', () => {
      const iframe = el('iframe', 'video-embed');
      iframe.src = `https://www.youtube.com/embed/${vid}?autoplay=1`;
      iframe.title = heading ? heading.textContent.trim() : 'Video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      wrapper.append(iframe);
      wrapper.classList.add('playing');
    });
  } else {
    play.disabled = true;
  }

  const host = el('div', 'video-band');
  host.append(wrapper);
  if (teaser) {
    const module = el('div', 'module m-bleed');
    const player = el('div', 'media-player media-single-small', module);
    player.append(wrapper);
    block.replaceChildren(module);
  } else {
    block.replaceChildren(host);
  }

  // program-cluster addition — `panorama` variant (breast-center, log §6.6):
  // static 360-poster band; Pannellum is NOT shipped (#102, noted trade) but
  // the replica's hidden viewer credit link is reproduced for content parity.
  if (block.classList.contains('panorama')) {
    const credit = el('div', 'panorama-credit');
    const a = el('a', '', credit);
    a.href = 'https://pannellum.org/';
    a.textContent = 'Pannellum';
    block.append(credit);
  }
}
