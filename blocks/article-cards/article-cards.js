/**
 * article-cards — editorial story-card listings (invented listing family).
 * Converts on cancer-types/breast-cancer as `grid` (8 story cards, 2 shown +
 * View more); reused on clinical-trials as `news` (2-col) and `experts`
 * (2-up large with summary + Read more). The EDITORIAL (cancerwise) cluster
 * adds `featured` (single large card w/ summary + Keep reading CTA),
 * `rail-tab` (Latest/Top tab lists w/ colored category tag), `topic`
 * (6 tab-grouped topic panels w/ date line) and `rail` (thumb rows) on the
 * same decode. Consecutive `rail-tab`/`topic` instances in one section are
 * grouped into a tab UI client-side (D2-safe; first instance = active tab).
 * Schemas: stardust/eds-schema/cancer-types-breast-cancer-html.json
 * (A.blog-summary x8), …-clinical-trials-html.json, cancerwise-html.json
 * (featured split + topic tabs), …insomnia…-html.json (more-stories rail).
 *
 * Authoring rows: ONE row per card —
 *   cell 1: <picture>/<img> (optional)
 *   cell 2: [<p>Category</p> (rail-tab)] + <h3><a href="story">Title</a></h3>
 *           [+ <p>summary</p> …] [+ <p><a>Read more/Keep reading</a></p>]
 *           [+ <p>Month DD, YYYY</p> (topic — the author-date line)]
 * Grouped variants (`rail-tab`, `topic`) lead with label rows (no links):
 *   row 1: tab label ("Top Stories" / "Diagnosis & Treatment")
 *   row 2 (topic only): the panel headline sentence
 * Section head ("Featured Articles", "Find stories by topic", …) is DEFAULT
 * CONTENT in the same section, styled in place (D1) — never a block row.
 * Decode is cell-cascade + classifier-based (#48/#53/#62/#72/#104).
 */

const SHOW_DEFAULT = 2;

/* closed topic set (log §7/§9): CSS class + index category = slugified topic */
const TOPIC_SLUGS = {
  'diagnosis & treatment': 'diagnosis-treatment',
  'patients & caregivers': 'patients-caregivers',
  'patient & caregiver stories': 'patients-caregivers',
  'healthy living': 'healthy-living',
  research: 'research',
  'expert insights': 'expert-insights',
  philanthropy: 'philanthropy',
};

function topicSlug(text) {
  const t = (text || '').trim().toLowerCase();
  return TOPIC_SLUGS[t]
    || t.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

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
  // the CTA is an anchor ALONE in its paragraph ("Keep reading" / "Read
  // more") — summary paragraphs may carry INLINE links (featured) and must
  // not be mistaken for the CTA
  const ctaLink = [...row.querySelectorAll('p')].filter((p) => {
    const a = p.querySelector('a');
    return a && a !== titleLink && p.textContent.trim() === a.textContent.trim();
  }).map((p) => p.querySelector('a')).pop() || null;

  const mediaDiv = document.createElement('div');
  mediaDiv.className = 'ac-media';
  if (media) mediaDiv.append(media.cloneNode(true));

  const titleWrap = document.createElement('div');
  titleWrap.className = 'ac-title';
  const h = document.createElement('h3');
  h.textContent = titleText;
  titleWrap.append(h);

  if (variant === 'experts' || variant === 'featured') {
    // large editorial card: linked media+title, then summary text + CTA.
    // `featured` keeps link-bearing summary paragraphs (inline story links).
    const card = document.createElement('div');
    card.className = 'ac-card';
    const a = document.createElement('a');
    a.className = 'ac-card-link';
    a.href = href;
    a.append(mediaDiv, titleWrap);
    card.append(a);
    const text = document.createElement('div');
    text.className = 'ac-text';
    const summaryPs = variant === 'featured'
      ? [...row.querySelectorAll('p')].filter((p) => {
        if (p.querySelector('picture, img')) return false;
        if (!p.textContent.trim()) return false;
        const link = p.querySelector('a');
        // a paragraph that IS just a link is the CTA, not summary
        if (link && link.textContent.trim() === p.textContent.trim()) return false;
        return true;
      })
      : paragraphs;
    summaryPs.forEach((p) => {
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

  if (variant === 'rail-tab' || variant === 'topic') {
    // story list card mirroring the replica DOM: separate image link,
    // [category tag (rail-tab)], linked title (h3 > a), [date line (topic)].
    const card = document.createElement('div');
    card.className = 'ac-card';
    if (media) {
      const mediaLink = document.createElement('a');
      mediaLink.className = 'ac-media-link';
      mediaLink.href = href;
      mediaLink.setAttribute('aria-hidden', 'true');
      mediaLink.tabIndex = -1;
      mediaLink.append(mediaDiv);
      card.append(mediaLink);
    }
    const body = document.createElement('div');
    body.className = 'ac-card-body';
    if (variant === 'rail-tab' && paragraphs[0]) {
      const catText = paragraphs[0].textContent.trim();
      const cat = document.createElement('div');
      cat.className = `ac-cat cat-${topicSlug(catText)}`;
      cat.textContent = catText;
      body.append(cat);
    }
    const h3 = document.createElement('h3');
    const titleA = document.createElement('a');
    titleA.href = href;
    titleA.textContent = titleText;
    h3.append(titleA);
    titleWrap.replaceChildren(h3);
    body.append(titleWrap);
    if (variant === 'topic') {
      const dateP = paragraphs.find((p) => /\d{4}/.test(p.textContent));
      if (dateP) {
        const d = document.createElement('p');
        d.className = 'ac-date';
        d.textContent = dateP.textContent.trim();
        body.append(d);
      }
    }
    card.append(body);
    return card;
  }

  const a = document.createElement('a');
  a.className = 'ac-card';
  a.href = href;
  a.append(mediaDiv, titleWrap);
  return a;
}

/* ── tab grouping (rail-tab / topic): consecutive instances in one section
      merge into the FIRST instance's tab UI; first tab = active (§7) ─────── */

let acTabUid = 0;

function tabHostOf(block, variant) {
  const section = block.closest('.section') || block.parentElement;
  if (!section) return null;
  const host = [...section.querySelectorAll(`.article-cards.${variant} .ac-tabs`)]
    .find((t) => !block.contains(t));
  return host || null;
}

function registerTab(host, label, slug, panel) {
  const menu = host.querySelector('.ac-tab-menu');
  const panels = host.querySelector('.ac-panels');
  const first = !menu.children.length;
  acTabUid += 1;
  const id = `ac-panel-${acTabUid}`;
  panel.id = id;
  panel.setAttribute('role', 'tabpanel');
  const li = document.createElement('li');
  li.className = `ac-tab cat-${slug}${first ? ' ac-tab-active' : ''}`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-controls', id);
  btn.setAttribute('aria-selected', String(first));
  btn.textContent = label;
  li.append(btn);
  menu.append(li);
  if (!first) panel.classList.add('ac-panel-hidden');
  panels.append(panel);
  btn.addEventListener('click', () => {
    menu.querySelectorAll('.ac-tab').forEach((t) => {
      t.classList.remove('ac-tab-active');
      t.querySelector('button')?.setAttribute('aria-selected', 'false');
    });
    li.classList.add('ac-tab-active');
    btn.setAttribute('aria-selected', 'true');
    panels.querySelectorAll('.ac-panel').forEach((p) => p.classList.add('ac-panel-hidden'));
    panel.classList.remove('ac-panel-hidden');
  });
}

export default async function decorate(block) {
  const variant = ['news', 'experts', 'featured', 'rail-tab', 'topic', 'rail']
    .find((v) => block.classList.contains(v)) || 'grid';
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'ac-container';

  // grouped variants: a link row WITHOUT a heading is a panel CTA button
  // (topic "Read more … / Subscribe …"), not a card
  const grouped = variant === 'rail-tab' || variant === 'topic';
  const cardRows = rows.filter((row) => row.querySelector('a')
    && (!grouped || row.querySelector('h1,h2,h3,h4,h5,h6')));
  const ctaRows = grouped
    ? rows.filter((row) => row.querySelector('a') && !cardRows.includes(row))
    : [];

  const cards = cardRows.map((row) => cardFrom(row, variant));
  cards.forEach((c) => container.append(c));
  const panelCtas = ctaRows.map((row) => {
    const div = document.createElement('div');
    div.className = 'ac-panel-cta';
    div.append(row.querySelector('a').cloneNode(true));
    return div;
  });

  if (variant === 'rail-tab' || variant === 'topic') {
    const textRows = rows.filter((r) => !r.querySelector('a') && r.textContent.trim());
    const label = textRows[0]?.textContent.trim() || '';
    const slug = topicSlug(label);
    const panelParts = [];
    if (variant === 'topic' && textRows[1]) {
      const headline = document.createElement('p');
      headline.className = 'ac-headline';
      headline.textContent = textRows[1].textContent.trim();
      panelParts.push(headline);
    }
    panelParts.push(container, ...panelCtas);
    const host = tabHostOf(block, variant);
    if (host) {
      // a sibling instance already built the tab UI — this whole BLOCK becomes
      // the panel and moves into the group (the element survives, so the
      // runtime's block lifecycle and the round-trip tags stay intact); the
      // emptied wrapper is retired.
      const wrapper = block.parentElement?.classList.contains('article-cards-wrapper')
        ? block.parentElement : null;
      block.classList.add('ac-panel', `cat-${slug}`);
      block.replaceChildren(...panelParts);
      registerTab(host, label, slug, block);
      if (wrapper && !wrapper.children.length) wrapper.remove();
      return;
    }
    // first instance: build the tab UI; own content rides an inner panel div
    const panel = document.createElement('div');
    panel.className = `ac-panel cat-${slug}`;
    panel.append(...panelParts);
    const tabs = document.createElement('div');
    tabs.className = 'ac-tabs';
    const menu = document.createElement('ul');
    menu.className = 'ac-tab-menu';
    menu.setAttribute('role', 'tablist');
    const panels = document.createElement('div');
    panels.className = 'ac-panels';
    tabs.append(menu, panels);
    block.replaceChildren(tabs);
    registerTab(tabs, label, slug, panel);
    return;
  }

  if (variant === 'rail') {
    // reabsorb the "More stories from Cancerwise" head (D1: authored as the
    // trailing h2 of the preceding default-content prose wrapper) so the
    // decorated DOM matches the replica's .at-article-list (h2 inside)
    const prev = block.parentElement?.previousElementSibling;
    if (prev?.classList?.contains('default-content-wrapper')
      && prev.lastElementChild?.tagName === 'H2') {
      const head = prev.lastElementChild;
      head.classList.add('ac-head');
      container.prepend(head);
    }
  }

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
