/**
 * icon-wells — bespoke landing composition: two search wells + a link column
 * (eds-conversion-log §5). Decode tier: template-slotted (#95); the search
 * form is interactive machinery rendered in block JS (never authored, D15).
 * Schema: stardust/eds-schema/index.json (icon-wells),
 * patients-family-html.json (icon-wells).
 *
 * Authoring rows (classified by shape — leading icon token, #53):
 *   - search well row (4 cells): :icon-x: | <h3>title</h3> | placeholder text | <p><a>browse CTA</a></p>
 *   - link-column header row (2 cells): :icon-x: | <h3>column title</h3>
 *   - link row (2 cells): <p><a href>link title</a></p> | description text
 *   - column CTA row (1 cell): <p><a href>View …</a></p>
 *
 * Well/icon colors ride position (first well purple, second lightblue,
 * link-column header red) — the replica's closed palette, never authored.
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

function iconNameOf(cell) {
  const span = cell.querySelector('span.icon');
  if (span) {
    const cls = [...span.classList].find((c) => c.startsWith('icon-') && c !== 'icon');
    if (cls) return cls.replace('icon-', '');
  }
  // literal :icon-x: token (pre-pipeline shape — the harness, raw authored HTML)
  const m = (cell.textContent || '').trim().match(/^:icon-([a-z0-9_-]+):$/i);
  return m ? m[1] : null;
}

function iconCircle(name, color) {
  const wrap = el('div', 'icon-circle');
  const stack = el('span', `fa-stack fa-3x ${color}`, wrap);
  const i = el('i', `well-icon wicon-${name} mda-stack-1x`, stack);
  i.setAttribute('aria-hidden', 'true');
  return wrap;
}

function arrowI(cls) {
  const i = el('i', cls);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

let uid = 0;

function buildSearchWell({ icon, title, placeholder, cta }, color) {
  uid += 1;
  const wellId = `icon-well-search-${uid}`;
  const wrap = el('div', 'module');
  const wellBlock = el('div', 'search-block', wrap);
  const header = el('div', 'search-block-header', wellBlock);
  header.append(iconCircle(icon, color));
  const h = el('h3', '', header);
  h.textContent = title;
  const searchWrap = el('div', `search-wrapper ${color}`, wellBlock);
  const form = el('form', '', searchWrap);
  form.addEventListener('submit', (e) => e.preventDefault());
  form.append(arrowI('search-icon fa fa-search'));
  const input = el('input', '', form);
  input.id = wellId;
  input.type = 'text';
  input.placeholder = placeholder;
  const label = el('label', 'visuallyhidden', form);
  label.setAttribute('for', wellId);
  label.textContent = placeholder;
  el('ul', 'search-results', searchWrap);
  if (cta) {
    const ctaWrap = el('div', 'search-cta-wrapper', wellBlock);
    const a = cta.cloneNode(true);
    a.className = 'cta';
    a.append(arrowI('teaser-more mdicon-arrow'));
    ctaWrap.append(a);
  }
  return wrap;
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'icon-wells') return;
  const rows = [...block.children].map((row) => [...row.children]);
  const wells = [];
  let column = null;
  rows.forEach((cells) => {
    const icon = iconNameOf(cells[0] || document.createElement('div'));
    if (icon && cells.length >= 4) {
      wells.push({
        icon,
        title: (cells[1].textContent || '').trim(),
        placeholder: (cells[2].textContent || '').trim(),
        cta: cells[3].querySelector('a'),
      });
    } else if (icon && cells.length >= 2) {
      column = { icon, title: (cells[1].textContent || '').trim(), links: [], cta: null };
    } else if (column && cells.length >= 2 && cells[0].querySelector('a')) {
      column.links.push({
        a: cells[0].querySelector('a'),
        desc: (cells[1].textContent || '').trim(),
      });
    } else if (column && cells.length === 1 && cells[0].querySelector('a')) {
      column.cta = cells[0].querySelector('a');
    }
  });

  const table = el('div', 'table well-table');
  const left = el('div', 'col-double cell-m cell-border', table);
  const wellColors = ['purple', 'lightblue'];
  wells.forEach((w, i) => left.append(buildSearchWell(w, wellColors[i % wellColors.length])));

  const right = el('div', 'col-double last cell-m', table);
  if (column) {
    const module = el('div', 'module', right);
    const ll = el('div', 'link-list', module);
    const posts = el('div', 'related-posts', ll);
    const heading = el('div', 'link-list-heading icon-heading', posts);
    heading.append(iconCircle(column.icon, 'icon-red'));
    const h = el('h3', 'icon-heading', heading);
    h.textContent = column.title;
    const body = el('div', 'link-list-body', ll);
    const ul = el('ul', '', body);
    column.links.forEach((lnk, i) => {
      const li = el('li', `link${i === 0 ? ' top-border' : ''}`, ul);
      const a = lnk.a.cloneNode(true);
      a.className = 'mdicon-linklist';
      const title = a.textContent.trim();
      a.textContent = '';
      const h4 = el('h4', 'link-title', a);
      h4.textContent = title;
      if (lnk.desc) {
        a.append(document.createTextNode(' '));
        const p = el('p', 'link-body mda-hide-sm', a);
        p.textContent = lnk.desc;
      }
      li.append(a);
    });
    if (column.cta) {
      const ctaWrap = el('div', 'link-list-cta', body);
      const cta = el('div', 'cta', ctaWrap);
      const a = column.cta.cloneNode(true);
      a.removeAttribute('class');
      a.append(arrowI('fa mdicon-arrow'));
      cta.append(a);
    }
  }

  block.replaceChildren(table);
}
