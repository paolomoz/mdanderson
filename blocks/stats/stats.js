/**
 * stats — "Research by the Numbers" stat trio (invented name,
 * eds-conversion-log §5). Decode tier: reconstructive.
 * Converts on research. Numeral colors cycle blue/purple/blue via
 * nth-child (fingerprint-locked, log §7 — never flatten to one color).
 * Schema: stardust/eds-schema/research-html.json (stats).
 *
 * Authoring: head (h2) = default content BEFORE the block; one row per stat:
 * value cell | description cell; trailing default content AFTER the block =
 * body paragraph + plain text CTA. The replica renders head, stats, and the
 * bordered body INSIDE one .statistics composition, so decorate() reabsorbs
 * the section's leading and trailing default-content wrappers (deploy skill
 * § Section heads — zero pixel change; authoring stays default content).
 * External CTAs get the linkout glyph + hidden "Opens a new window".
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

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'stats') return;
  const rows = [...block.children];
  const stats = rows.map((row) => {
    const cells = [...row.children];
    const value = cells[0] ? cells[0].textContent.trim() : '';
    const desc = cells[1] ? cells[1].textContent.trim() : '';
    return { value, desc };
  }).filter((s) => s.value);

  const shell = el('div', 'col-single');
  const composition = el('div', 'statistics triple', shell);

  // reabsorb the section head (default content before the block)
  const wrapper = block.parentElement;
  const headWrap = wrapper && wrapper.previousElementSibling;
  if (headWrap && headWrap.classList.contains('default-content-wrapper')) {
    const heading = headWrap.querySelector('h1, h2, h3');
    if (heading) {
      const h2 = el('h2', 'title', composition);
      h2.textContent = heading.textContent.trim();
      headWrap.remove();
    }
  }

  const items = el('div', 'stat-items', composition);
  stats.forEach((s) => {
    const item = el('div', 'stat-item', items);
    const v = el('p', 'statistic', item);
    v.textContent = s.value;
    const d = el('p', 'description', item);
    d.textContent = s.desc;
  });

  // reabsorb the trailing body + CTA (default content after the block)
  const tailWrap = wrapper && wrapper.nextElementSibling;
  if (tailWrap && tailWrap.classList.contains('default-content-wrapper')) {
    const body = el('div', 'body-text', composition);
    [...tailWrap.querySelectorAll('p')].forEach((p) => {
      const a = p.querySelector('a');
      if (a && p.textContent.trim() === a.textContent.trim()) {
        const cta = a.cloneNode(true);
        cta.className = 'cta';
        if (isExternal(cta)) {
          cta.append(document.createTextNode(' '));
          const out = el('span', 'mda-icon-linkout', cta);
          const hidden = el('span', 'visuallyhidden', out);
          hidden.textContent = 'Opens a new window';
        }
        body.append(cta);
      } else {
        body.append(p.cloneNode(true));
      }
    });
    tailWrap.remove();
  }

  block.replaceChildren(shell);
}
