/**
 * section-nav — interior sidebar mini-TOC (+ optional promo box footer card).
 * Schema: stardust/eds-schema/cancer-types-breast-cancer-html.json (page-body →
 * sidebar unit). Converts on cancer-types/breast-cancer (eds-conversion-log §5).
 *
 * Authoring rows (classified by content, not index — #48):
 *   - a row whose cell holds ONLY plain text            → jump-menu label
 *   - a row whose cell holds a single link (no <ul>)    → "Back" link (href = parent)
 *   - a row whose cell holds a nested <ul>              → the nav tree
 *                                                          (parent li > child ul)
 *   - a trailing row with paragraph(s) + a CTA link     → promo box (footer card)
 *
 * The block also owns the `interior` template layout (eds-conversion-log §4):
 * two-column grid keyed off the runtime's .section-nav-container class —
 * see section-nav.css.
 */

function collectRows(block) {
  return [...block.children].map((row) => {
    const cell = row.firstElementChild || row;
    return cell;
  });
}

export default async function decorate(block) {
  const cells = collectRows(block);
  let label = '';
  let back = null;
  let tree = null;
  const promoParts = [];

  cells.forEach((cell) => {
    const ul = cell.querySelector('ul');
    if (ul) { tree = ul; return; }
    const links = cell.querySelectorAll('a');
    const text = cell.textContent.trim();
    if (links.length === 1 && links[0].textContent.trim() === text) {
      back = links[0];
      return;
    }
    if (links.length || cell.querySelector('.icon, picture, img')) {
      promoParts.push(...cell.children.length ? cell.children : [cell]);
      return;
    }
    if (text) label = text;
  });

  const nav = document.createElement('nav');
  nav.className = 'section-nav-inner';
  nav.setAttribute('aria-label', 'Section');

  // jump-menu label bar (visible on mobile; toggle opens the tree)
  const labelBar = document.createElement('div');
  labelBar.className = 'jump-menu-label';
  const labelText = document.createElement('span');
  labelText.className = 'jump-menu-label-text';
  labelText.textContent = label || 'Jump To:';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'jump-menu-toggle';
  toggle.setAttribute('aria-label', 'Open jump menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<i class="section-nav-burger" aria-hidden="true"></i>';
  labelBar.append(labelText, toggle);
  nav.append(labelBar);

  if (back) {
    const backLink = back.cloneNode(true);
    backLink.className = 'sidebar-back';
    backLink.innerHTML = `<i class="section-nav-angle-left" aria-hidden="true"></i>${backLink.textContent}`;
    nav.append(backLink);
  }

  if (tree) {
    const parentUl = document.createElement('ul');
    parentUl.className = 'parent-level';
    [...tree.children].forEach((li) => {
      const pLi = document.createElement('li');
      pLi.className = 'parent-link';
      const pLink = li.querySelector(':scope > a, :scope > p > a');
      if (pLink) pLi.append(pLink.cloneNode(true));
      const childUl = li.querySelector(':scope > ul');
      if (childUl) {
        const cUl = document.createElement('ul');
        cUl.className = 'child-level';
        [...childUl.querySelectorAll(':scope > li')].forEach((cLi) => {
          const a = cLi.querySelector('a');
          if (!a || !a.textContent.trim()) return; // tolerate the replica's empty first item
          const nLi = document.createElement('li');
          // current-page bold: the hlx pipeline hoists an authored
          // <a><strong>…</strong></a> to <strong><a>…</a></strong> — keep the
          // wrapper so the live font-weight:700 current item survives
          const wrap = a.closest('strong, em');
          nLi.append((wrap && cLi.contains(wrap) ? wrap : a).cloneNode(true));
          cUl.append(nLi);
        });
        pLi.append(cUl);
      }
      parentUl.append(pLi);
    });
    nav.append(parentUl);
  }

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // EDITORIAL-cluster addition (wave 2): `topics` — the article page's
  // category/topic filter tree renders parent rows as collapsed accordions
  // (replica data-interactive="accordion-collapsed"); a plus glyph marks
  // each parent and click toggles the child list.
  if (block.classList.contains('topics')) {
    nav.classList.add('topics');
    nav.querySelectorAll('ul.parent-level > li.parent-link > a').forEach((a) => {
      const plus = document.createElement('i');
      plus.className = 'sn-plus';
      plus.setAttribute('aria-hidden', 'true');
      a.append(plus);
      a.setAttribute('aria-expanded', 'false');
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const li = a.closest('li');
        const open = li.classList.toggle('open');
        a.setAttribute('aria-expanded', String(open));
      });
    });
  }

  block.replaceChildren(nav);

  if (promoParts.length) {
    const box = document.createElement('div');
    box.className = 'left-nav-box';
    const glyph = document.createElement('i');
    glyph.className = 'left-nav-box-icon';
    glyph.setAttribute('aria-hidden', 'true');
    box.append(glyph);
    promoParts.forEach((el) => {
      // strip any authored icon span (the box renders its own glyph)
      const clone = el.cloneNode(true);
      clone.querySelectorAll('span.icon').forEach((s) => s.remove());
      if (clone.textContent.trim() || clone.querySelector('a')) box.append(clone);
    });
    const cta = box.querySelector('a');
    if (cta) {
      cta.classList.add('left-nav-cta');
      cta.innerHTML = `${cta.textContent}<i class="left-nav-arrow" aria-hidden="true"></i>`;
    }
    block.append(box);
  }
}
