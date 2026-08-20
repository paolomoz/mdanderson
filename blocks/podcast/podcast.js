/**
 * podcast — Cancerwise featured-podcast card (template-slotted, #95).
 * Converts on cancer-types/breast-cancer as `rail` (2 stacked episodes);
 * reused by clinical-trials as `wide` (single episode).
 * Schema: stardust/eds-schema/cancer-types-breast-cancer-html.json (page-body
 * → podcast headings/CTAs).
 *
 * Authoring rows (classified, not indexed):
 *   - leading link-free row → kicker text ("Featured Podcast:")
 *   - each following row    → one episode: title (h3 or text) + episode-page
 *     link + transcript link (classified by href: doctorpodcasting → transcript,
 *     otherwise first link = episode page)
 * The Cancerwise podcast artwork is FIXED brand imagery — shipped root-relative
 * from /img/podcast/ (never authored; #44/#67).
 */

function episodeFrom(cell, kicker) {
  const ep = document.createElement('div');
  ep.className = 'podcast-episode';
  if (kicker) {
    const k = document.createElement('h3');
    k.className = 'podcast-kicker';
    k.textContent = kicker;
    ep.append(k);
  }
  const titleEl = cell.querySelector('h1,h2,h3,h4,h5,h6');
  const title = document.createElement('h3');
  title.className = 'podcast-title';
  title.textContent = titleEl
    ? titleEl.textContent.trim()
    : [...cell.querySelectorAll('p')].map((p) => (p.querySelector('a') ? '' : p.textContent.trim())).filter(Boolean)[0] || '';
  ep.append(title);

  const links = [...cell.querySelectorAll('a')];
  const transcript = links.find((a) => /doctorpodcasting|transcript/i.test(a.href) || /transcript/i.test(a.textContent));
  const episode = links.find((a) => a !== transcript);
  if (episode) {
    const p = document.createElement('p');
    p.className = 'podcast-cta';
    const a = episode.cloneNode(true);
    a.innerHTML = `<i class="podcast-icon-mic" aria-hidden="true"></i>${a.textContent}`;
    p.append(a);
    ep.append(p);
  }
  if (transcript) {
    const p = document.createElement('p');
    p.className = 'podcast-cta podcast-transcript';
    const a = transcript.cloneNode(true);
    a.innerHTML = `<i class="podcast-icon-doc" aria-hidden="true"></i>${a.textContent}`;
    p.append(a);
    ep.append(p);
  }
  return ep;
}

export default async function decorate(block) {
  const cells = [...block.children].map((row) => row.firstElementChild || row);
  let kicker = '';
  const episodes = [];
  cells.forEach((cell) => {
    if (!cell.querySelector('a')) {
      const t = cell.textContent.trim();
      if (t) kicker = t;
      return;
    }
    episodes.push(cell);
  });

  const wide = block.classList.contains('wide');
  const art = document.createElement('div');
  art.className = 'podcast-art';
  art.innerHTML = wide
    ? '<img src="/img/podcast/cw-wave.jpg" alt="Cancerwise Podcast">'
    : '<img class="podcast-art-combo" src="/img/podcast/cw-combo.png" alt="Cancerwise Podcast">'
      + '<img class="podcast-art-wave" src="/img/podcast/cw-wave.jpg" alt="Cancerwise Podcast">';

  const items = document.createElement('div');
  items.className = 'podcast-items';
  episodes.forEach((cell, i) => {
    if (i > 0) {
      const hr = document.createElement('span');
      hr.className = 'podcast-spacer';
      items.append(hr);
    }
    items.append(episodeFrom(cell, i === 0 ? kicker : ''));
  });

  const container = document.createElement('div');
  container.className = 'podcast-card';
  container.append(art, items);
  block.replaceChildren(container);
}
