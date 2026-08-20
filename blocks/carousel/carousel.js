/**
 * carousel — editorial highlights carousel (Block Collection name, D11).
 * Decode tier: reconstructive (eds-conversion-log §5). Converts on index
 * (highlights); reused by patients-family + research (highlights) and
 * clinical-trials (`videos` variant, added by that page's cluster).
 * Schema: stardust/eds-schema/index.json (highlights-carousel, 12 rendered
 * items = 8 authored + 4 slick clones), research-html.json.
 *
 * Section head ("UT MD Anderson Highlights") is DEFAULT CONTENT in the same
 * section, styled in place via .carousel-container .default-content-wrapper.
 *
 * Authoring: one row per card, two cells:
 *   cell 1: <p><img 251x141></p>
 *   cell 2: <h3><a href="…">Card title</a></h3> + <p>body line</p>
 * The block reproduces the replica's slick DOM at t=0: clones of the last two
 * cards prepended and of the first two appended, prev/next arrows, dot rail.
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

function collectCard(row) {
  const cells = [...row.children];
  const media = row.querySelector('picture, img');
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const link = (heading && heading.querySelector('a')) || row.querySelector('a');
  const body = [...row.querySelectorAll('p')]
    .find((p) => p.textContent.trim() && !p.querySelector('picture, img, a'));
  return { cells, media, heading, link, body };
}

function buildItem(card, cls, cloned) {
  const item = el('div', cls);
  if (cloned) item.setAttribute('aria-hidden', 'true');
  const a = el('a', cloned ? 'carousel-item-link' : '', item);
  if (card.link) a.href = card.link.getAttribute('href');
  const imgWrap = el('div', 'carousel-image', a);
  if (card.media) {
    const m = (card.media.closest && card.media.closest('picture')) || card.media;
    const copy = m.cloneNode(true);
    const img = copy.tagName === 'IMG' ? copy : copy.querySelector('img');
    if (img) img.loading = 'lazy';
    imgWrap.append(copy);
  }
  const bodyWrap = el('div', 'carousel-body', a);
  const h = el('h3', 'body-title', bodyWrap);
  if (card.heading) {
    const inner = card.heading.querySelector('a') || card.heading;
    [...inner.childNodes].forEach((n) => h.append(n.cloneNode(true)));
  }
  if (card.body) {
    const text = el('div', 'body-text', item);
    text.textContent = card.body.textContent.trim();
  }
  return item;
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'carousel') return;
  const cards = [...block.children].map(collectCard).filter((c) => c.heading || c.media);
  if (!cards.length) return;

  const shell = el('div', 'carousel-shell');
  const group = el('div', 'carousel-group default carousel-config-standard', shell);
  const prev = el('button', 'slick-prev hl-prev', group);
  prev.type = 'button';
  prev.textContent = 'Previous';
  const list = el('div', 'slick-list draggable', group);
  const track = el('div', 'slick-track', list);

  const n = cards.length;
  const perPage = 4;
  // replica t=0 DOM: clones of the last two cards lead, first two trail
  if (n > perPage) {
    [n - 2, n - 1].forEach((i) => track.append(buildItem(cards[i], 'carousel-item slick-slide slick-cloned', true)));
  }
  cards.forEach((card, i) => {
    track.append(buildItem(card, `carousel-item slick-slide${i < perPage ? ' slick-active' : ''}`, false));
  });
  if (n > perPage) {
    [0, 1].forEach((i) => track.append(buildItem(cards[i], 'carousel-item slick-slide slick-cloned', true)));
  }

  const next = el('button', 'slick-next hl-next', group);
  next.type = 'button';
  next.textContent = 'Next';
  const dots = el('ul', 'slick-dots', group);

  let current = 0;
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const goTo = (i) => {
    current = ((i % n) + n) % n;
    const item = [...track.children].find((it) => !it.classList.contains('slick-cloned'));
    const step = item ? item.getBoundingClientRect().width + 18 : 331;
    list.scrollTo({ left: step * current, behavior: smooth ? 'smooth' : 'auto' });
    [...dots.children].forEach((li, j) => li.classList.toggle('slick-active', j === current));
  };
  cards.forEach((c, i) => {
    const li = el('li', i === 0 ? 'slick-active' : '', dots);
    const b = el('button', '', li);
    b.type = 'button';
    b.textContent = String(i + 1);
    b.addEventListener('click', () => goTo(i));
  });
  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  block.replaceChildren(shell);

  // program-cluster addition — `videos` variant (clinical-trials video
  // gallery, log §6.7): 2-up static video cards; the replica's mobile
  // More/Less expander is BLOCK-OWNED UI (desktop hides it), reproduced so
  // the mobile progressive disclosure and content parity are kept.
  if (block.classList.contains('videos')) {
    const more = el('div', 'videos-toggle more');
    const moreA = el('a', '', more);
    moreA.href = '#';
    moreA.textContent = 'More';
    const less = el('div', 'videos-toggle less');
    const lessA = el('a', '', less);
    lessA.href = '#';
    lessA.textContent = 'Less';
    moreA.addEventListener('click', (e) => { e.preventDefault(); shell.classList.add('videos-expanded'); });
    lessA.addEventListener('click', (e) => { e.preventDefault(); shell.classList.remove('videos-expanded'); });
    shell.append(more, less);
  }
}
