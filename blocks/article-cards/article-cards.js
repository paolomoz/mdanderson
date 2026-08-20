/**
 * article-cards — editorial story-card listings (invented listing family).
 * Converts on cancer-types/breast-cancer as `grid` (8 story cards, 2 shown +
 * View more); reused on clinical-trials as `news` (2-col) and `experts`
 * (2-up large with summary + Read more). The cancerwise cluster adds
 * `featured` / `rail-tab` / `topic` / `rail` variants on the same decode.
 * Schema: stardust/eds-schema/cancer-types-breast-cancer-html.json
 * (A.blog-summary x8) and …-clinical-trials-html.json.
 *
 * Authoring rows: ONE row per card —
 *   cell 1: <picture>/<img> (optional)
 *   cell 2: <h3><a href="story">Title</a></h3> [+ <p>summary</p>]
 *           [+ <p><a>Read more</a></p>] (experts)
 * Section head ("Featured Articles", "In the News", …) is DEFAULT CONTENT in
 * the same section, styled in place (D1) — never a block row.
 * Decode is cell-cascade + classifier-based (#48/#53/#62/#72/#104).
 */

const SHOW_DEFAULT = 2;

function mediaOf(nodes) {
  for (const el of nodes) {
    if (el.matches?.('picture, img')) return el;
    const m = el.querySelector?.('picture, img');
    if (m) return m;
  }
  return null;
}

function cardFrom(row, variant) {
  const cells = [...row.children];
  const nodes = cells.flatMap((c) => (c.children.length ? [...c.children] : [c]));
  const media = mediaOf(nodes);
  const titleEl = row.querySelector('h1,h2,h3,h4,h5,h6');
  const titleLink = titleEl?.querySelector('a') || row.querySelector('a');
  const href = titleLink?.getAttribute('href') || '#';
  const titleText = (titleEl || titleLink)?.textContent.trim() || '';
  const paragraphs = [...row.querySelectorAll('p')].filter((p) => {
    const a = p.querySelector('a');
    if (!a) return !!p.textContent.trim() && !p.querySelector('picture, img');
    return false;
  });
  const ctaLink = [...row.querySelectorAll('p a')].find((a) => a !== titleLink && a.textContent.trim());

  const mediaDiv = document.createElement('div');
  mediaDiv.className = 'ac-media';
  if (media) mediaDiv.append(media.cloneNode(true));

  const titleWrap = document.createElement('div');
  titleWrap.className = 'ac-title';
  const h = document.createElement('h3');
  h.textContent = titleText;
  titleWrap.append(h);

  if (variant === 'experts') {
    const card = document.createElement('div');
    card.className = 'ac-card';
    const a = document.createElement('a');
    a.className = 'ac-card-link';
    a.href = href;
    a.append(mediaDiv, titleWrap);
    card.append(a);
    const text = document.createElement('div');
    text.className = 'ac-text';
    paragraphs.forEach((p) => {
      const s = document.createElement('div');
      s.className = 'ac-summary';
      s.append(...[...p.childNodes].map((n) => n.cloneNode(true)));
      text.append(s);
    });
    if (ctaLink) {
      const ctaP = document.createElement('p');
      ctaP.className = 'ac-cta';
      const cta = ctaLink.cloneNode(true);
      cta.innerHTML = `${cta.textContent}<i class="ac-arrow" aria-hidden="true"></i>`;
      ctaP.append(cta);
      text.append(ctaP);
    }
    card.append(text);
    return card;
  }

  const a = document.createElement('a');
  a.className = 'ac-card';
  a.href = href;
  a.append(mediaDiv, titleWrap);
  return a;
}

export default async function decorate(block) {
  const variant = ['news', 'experts', 'featured', 'rail-tab', 'topic', 'rail']
    .find((v) => block.classList.contains(v)) || 'grid';
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'ac-container';

  const cards = rows
    .filter((row) => row.querySelector('a'))
    .map((row) => cardFrom(row, variant));
  cards.forEach((c) => container.append(c));

  block.replaceChildren(container);

  // grid/news carry the replica's View more / View less toggle
  if (variant === 'grid' || variant === 'news') {
    const hidden = cards.slice(SHOW_DEFAULT);
    hidden.forEach((c) => c.classList.add('ac-hidden'));
    const bar = document.createElement('div');
    bar.className = 'ac-toggle';
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'ac-more';
    more.textContent = 'View more';
    const less = document.createElement('button');
    less.type = 'button';
    less.className = 'ac-less';
    less.textContent = 'View less';
    // replica parity: grid hides "View less" until expanded; news (no hidden
    // cards) captured both buttons visible — keep the captured state
    if (variant === 'grid') less.style.display = 'none';
    more.addEventListener('click', () => {
      hidden.forEach((c) => c.classList.remove('ac-hidden'));
      more.style.display = 'none';
      less.style.display = '';
    });
    less.addEventListener('click', () => {
      hidden.forEach((c) => c.classList.add('ac-hidden'));
      less.style.display = 'none';
      more.style.display = '';
    });
    bar.append(more, less);
    block.append(bar);
  }
}
