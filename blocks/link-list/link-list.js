/**
 * link-list — arrow link rails / outline card grids (invented name,
 * eds-conversion-log §5). Decode tier: reconstructive.
 * Converts on prevention-screening (manage-your-risk `columns`); research
 * reuses `columns` (areas-resources, per-column heading + subtext) and adds
 * `boxed` (departments-labs-institutes outline cards).
 * Schemas: stardust/eds-schema/prevention-screening-html.json
 * (manage-your-risk), research-html.json (departments…, areas-resources).
 *
 * Authoring (one row per item, single cell):
 *   column-head row (columns variant): <h3>Column title</h3> + <p>subtext</p>
 *   link row: <p><a href>Link title</a></p> + optional <p>description</p>
 *     (+ optional <p><img></p> row thumbnail — our-locations partner rows,
 *     donors `thumbs` — wave-2 STATIC/LISTING/FUNNEL cluster addition)
 *   boxed row: <h3><a href>Card title</a></h3> + <p>description</p>
 * `columns` with no authored column heads auto-splits links into two columns
 * (replica 4+3). External links render the linkout glyph instead of the
 * arrow (replica parity).
 *
 * wave-2 addition — `thumbs` variant (donors gifts-at-work; single column,
 * schema: stardust/eds-schema/donors-volunteers-html.json give-columns):
 *   head row: <p>:icon-name:</p> + <h3>List title</h3> + optional <p>subtext</p>
 *   link rows: <p><img></p> + <p><a href>Title</a></p> + <p>description</p>
 *   trailing CTA row: <p><a href>List CTA</a></p> (bare link, no image/desc)
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

function isExternal(a) {
  try {
    const u = new URL(a.getAttribute('href'), 'https://www.mdanderson.org/');
    return u.hostname !== 'www.mdanderson.org';
  } catch { return false; }
}

function buildLinkLi(item, first) {
  const li = el('li', `link${first ? ' top-border' : ''}`);
  const a = item.a.cloneNode(true);
  a.className = isExternal(a) ? 'mda-icon-linkout' : 'mdicon-linklist';
  const title = a.textContent.trim();
  a.textContent = '';
  // wave-2 addition: row thumbnail (our-locations partners, donors thumbs)
  if (item.media) {
    const span = el('span', 'mda-hide-sm', a);
    span.append((item.media.closest && item.media.closest('picture')) || item.media);
    a.append(document.createTextNode(' '));
  }
  const h4 = el('h4', 'link-title', a);
  h4.textContent = title;
  if (item.desc) {
    a.append(document.createTextNode(' '));
    const p = el('p', 'link-body mda-hide-sm', a);
    p.textContent = item.desc;
  }
  li.append(a);
  return li;
}

/** icon name from a node: span.icon class OR a literal :icon-x: text token */
function iconNameOf(row) {
  const iconSpan = row.querySelector('span.icon');
  if (iconSpan) {
    return ([...iconSpan.classList].find((c) => c.startsWith('icon-') && c !== 'icon') || '')
      .replace('icon-', '') || null;
  }
  const hit = [...row.querySelectorAll('p')]
    .map((p) => (p.textContent || '').trim().match(/^:icon-([a-z0-9_-]+):$/i))
    .find(Boolean);
  return hit ? hit[1] : null;
}

/** wave-2 — `thumbs` variant (donors gifts-at-work rail) */
function decorateThumbs(block) {
  const rows = [...block.children];
  let head = null;
  const items = [];
  let listCta = null;
  rows.forEach((row) => {
    const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
    const media = row.querySelector('picture, img');
    const link = row.querySelector('a');
    if (heading && !media) {
      const subtext = [...row.querySelectorAll('p')].find((p) => p.textContent.trim()
        && !p.querySelector('a, span.icon') && !/^:icon-[a-z0-9_-]+:$/i.test(p.textContent.trim()));
      head = { heading, icon: iconNameOf(row), subtext };
      return;
    }
    if (!link) return;
    const desc = [...row.querySelectorAll('p')]
      .find((p) => p.textContent.trim() && !p.querySelector('a, picture, img'));
    if (!media && !desc) { listCta = link; return; }
    items.push({ a: link, media, desc: desc ? desc.textContent.trim() : '' });
  });

  const ll = el('div', 'll-thumbs');
  if (head) {
    const posts = el('div', 'related-posts', ll);
    const hWrap = el('div', 'link-list-heading icon-heading', posts);
    if (head.icon) {
      const circle = el('div', 'icon-circle', hWrap);
      const stack = el('span', 'fa-stack fa-3x', circle);
      const i = el('i', `fa llicon-${head.icon} mda-stack-1x mda-inverse`, stack);
      i.setAttribute('aria-hidden', 'true');
    }
    const h = el('h3', 'icon-heading', hWrap);
    h.textContent = head.heading.textContent.trim();
    if (head.subtext) {
      const p = el('p', 'subtext', ll);
      p.textContent = head.subtext.textContent.trim();
    }
  }
  const body = el('div', 'link-list-body', ll);
  const ul = el('ul', '', body);
  items.forEach((item, i) => ul.append(buildLinkLi(item, i === 0)));
  if (listCta) {
    const ctaWrap = el('div', 'link-list-cta', body);
    const cta = el('div', 'cta', ctaWrap);
    const a = listCta.cloneNode(true);
    a.removeAttribute('class');
    a.append(document.createTextNode(' '));
    el('i', 'fa mdicon-arrow', a).setAttribute('aria-hidden', 'true');
    cta.append(a);
  }
  block.replaceChildren(ll);
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'link-list') return;
  if (block.classList.contains('thumbs')) { decorateThumbs(block); return; }
  const boxed = block.classList.contains('boxed');
  const rows = [...block.children];

  if (boxed) {
    const container = el('div', 'text-border-container');
    rows.forEach((row) => {
      const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
      const link = row.querySelector('a');
      const desc = [...row.querySelectorAll('p')].find((p) => p.textContent.trim() && !p.querySelector('a'));
      if (!link) return;
      const wrap = el('div', 'border-item-wrapper', container);
      const a = el('a', 'text-border', wrap);
      a.href = link.getAttribute('href');
      const h = el('h3', 'title', a);
      h.textContent = (heading || link).textContent.trim();
      if (desc) {
        a.append(document.createTextNode(' '));
        const p = el('p', 'description', a);
        p.textContent = desc.textContent.trim();
      }
      el('i', 'teaser-more mdicon-arrow', a).setAttribute('aria-hidden', 'true');
    });
    block.replaceChildren(container);
    return;
  }

  // columns — segment rows into columns on heading rows (#52); no heading
  // rows → auto-split the link run (replica: 4 + 3)
  const columns = [];
  rows.forEach((row) => {
    const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
    const link = row.querySelector('a');
    if (heading && !heading.querySelector('a') && !link) {
      const subtext = [...row.querySelectorAll('p')].find((p) => p.textContent.trim());
      columns.push({ heading, subtext, links: [] });
      return;
    }
    if (!link) return;
    if (!columns.length) columns.push({ heading: null, subtext: null, links: [] });
    const desc = [...row.querySelectorAll('p')]
      .find((p) => p.textContent.trim() && !p.querySelector('a, picture, img'));
    // wave-2 addition: optional row thumbnail (our-locations partner rows)
    const media = row.querySelector('picture, img');
    columns[columns.length - 1].links.push({
      a: link, desc: desc ? desc.textContent.trim() : '', media,
    });
  });

  let cols = columns;
  if (columns.length === 1 && !columns[0].heading) {
    const all = columns[0].links;
    const half = Math.ceil(all.length / 2);
    cols = [
      { heading: null, subtext: null, links: all.slice(0, half) },
      { heading: null, subtext: null, links: all.slice(half) },
    ];
  }

  const table = el('div', 'table ll-table');
  cols.forEach((col, ci) => {
    const colDiv = el('div', `col-double${ci === cols.length - 1 ? ' last' : ''} cell-m`, table);
    const module = el('div', 'module', colDiv);
    const ll = el('div', 'link-list', module);
    if (col.heading) {
      const head = el('div', 'link-list-heading', ll);
      const h = el('h3', '', head);
      h.textContent = col.heading.textContent.trim();
    }
    if (col.subtext) {
      const p = el('p', 'subtext', ll);
      p.textContent = col.subtext.textContent.trim();
    }
    const body = el('div', 'link-list-body', ll);
    const ul = el('ul', '', body);
    col.links.forEach((item, i) => ul.append(buildLinkLi(item, i === 0)));
  });

  block.replaceChildren(table);
}
