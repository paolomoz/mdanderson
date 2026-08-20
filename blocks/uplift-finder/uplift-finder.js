/*
 * uplift-finder — care-finder band: two search wells + plan-your-care index
 * (uplift-c demo). Decode tier: TEMPLATE-SLOTTED (#95) — prototype §.finder
 * DOM verbatim per card; authored rows (title / placeholder-or-list / link)
 * slotted by role. Row cell 2 containing a <ul> selects the plan-list card
 * template; otherwise the search-well template (form action = the row's
 * browse link, placeholder = the authored text).
 */

const SEARCH_SVG = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="7.4" cy="7.4" r="6" fill="none" stroke="#fff" stroke-width="2"/><line x1="12" y1="12" x2="17" y2="17" stroke="#fff" stroke-width="2"/></svg>';

function searchCard(title, placeholder, link) {
  const card = document.createElement('div');
  card.className = 'finder-card';
  card.setAttribute('data-anim', '');
  const h3 = document.createElement('h3');
  h3.textContent = title;
  const rule = document.createElement('span');
  rule.className = 'rule';
  const form = document.createElement('form');
  form.className = 'search-form';
  form.method = 'get';
  if (link) form.action = link.href;
  form.innerHTML = `
    <input type="search" name="q">
    <button class="search-btn" type="submit">${SEARCH_SVG}</button>`;
  const input = form.querySelector('input');
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  form.querySelector('button').setAttribute('aria-label', title);
  card.append(h3, rule, form);
  if (link) {
    const a = document.createElement('a');
    a.className = 'link-red';
    a.href = link.href;
    a.innerHTML = `${link.textContent.trim()} <span class="arr">→</span>`;
    card.append(a);
  }
  return card;
}

function planCard(title, list, link) {
  const card = document.createElement('div');
  card.className = 'finder-card';
  card.setAttribute('data-anim', '');
  const h3 = document.createElement('h3');
  h3.textContent = title;
  const rule = document.createElement('span');
  rule.className = 'rule';
  const ul = document.createElement('ul');
  ul.className = 'plan-list';
  [...list.querySelectorAll(':scope > li')].forEach((li) => {
    const itemLink = li.querySelector('a');
    if (!itemLink) return;
    const desc = li.textContent.replace(itemLink.textContent, '').trim();
    const item = document.createElement('li');
    const a = document.createElement('a');
    a.href = itemLink.href;
    const h4 = document.createElement('h4');
    h4.textContent = itemLink.textContent.trim();
    const p = document.createElement('p');
    p.textContent = desc;
    a.append(h4, p);
    item.append(a);
    ul.append(item);
  });
  card.append(h3, rule, ul);
  if (link) {
    const a = document.createElement('a');
    a.className = 'link-red';
    a.href = link.href;
    a.innerHTML = `${link.textContent.trim()} <span class="arr">→</span>`;
    card.append(a);
  }
  return card;
}

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'finder-grid';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const title = cells[0] ? cells[0].textContent.trim() : '';
    const body = cells[1];
    const linkCell = cells[2] || cells[1];
    const link = linkCell ? linkCell.querySelector('a') : null;
    const list = body ? body.querySelector('ul') : null;
    if (list) {
      grid.append(planCard(title, list, link));
    } else {
      const placeholder = body ? body.textContent.trim() : '';
      grid.append(searchCard(title, placeholder, link));
    }
  });

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(grid);
  block.textContent = '';
  block.append(wrap);
}
