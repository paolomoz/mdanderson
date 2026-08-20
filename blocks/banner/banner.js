/**
 * banner — horizontal text bar (icon | title + description | bordered CTA).
 * Decode tier: template-slotted (eds-conversion-log §5, #95).
 * Schema: stardust/eds-schema/index.json (alert-band),
 * research-html.json (why-research-band `blue`, astro-band `purple`,
 * investigators-band `blue`).
 *
 * Authoring rows (one row, one cell, elements in order):
 *   - <p>:icon-name:</p>       — band icon (drop, powerinnumbers, user, counseling)
 *   - <h2>Band title</h2>
 *   - <p> description (one or more)
 *   - <p><em><a>CTA</a></em></p>
 *
 * Variants (block classes): red (index alert band), blue, purple.
 * External CTAs get the replica's linkout glyph + visually-hidden
 * "Opens a new window" (presentational — block-owned, never authored).
 */

const NOWRAP_RE = /UT MD Anderson|UT MD Anderson/;

function wrapNowrap(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) {
    if (NOWRAP_RE.test(walker.currentNode.textContent) && !walker.currentNode.parentElement.closest('.nowrap')) {
      hits.push(walker.currentNode);
    }
  }
  hits.forEach((node) => {
    const m = node.textContent.match(NOWRAP_RE);
    if (!m) return;
    const rest = node.splitText(m.index);
    rest.splitText(m[0].length);
    const span = document.createElement('span');
    span.className = 'nowrap';
    span.textContent = m[0];
    rest.replaceWith(span);
  });
}

function isExternal(a) {
  // replica parity: mdanderson.org subdomains (faculty., www3.) do NOT get
  // the banner's "Opens a new window" linkout; true third-party hosts do
  try {
    const u = new URL(a.getAttribute('href'), 'https://www.mdanderson.org/');
    return u.hostname !== 'www.mdanderson.org' && !u.hostname.endsWith('.mdanderson.org');
  } catch { return false; }
}

/** icon name from a node: span.icon class OR a literal :icon-x: text token */
function iconNameOf(node) {
  const span = node.matches?.('span.icon') ? node : node.querySelector?.('span.icon');
  if (span) {
    const cls = [...span.classList].find((c) => c.startsWith('icon-') && c !== 'icon');
    if (cls) return cls.replace('icon-', '');
  }
  const m = (node.textContent || '').trim().match(/^:icon-([a-z0-9_-]+):$/i);
  return m ? m[1] : null;
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'banner') return;
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => nodes.push(...cell.children));
  const iconName = nodes.map((n) => iconNameOf(n)).find(Boolean);
  const heading = nodes.map((n) => (/^H[1-6]$/.test(n.tagName) ? n : n.querySelector('h1,h2,h3,h4,h5,h6'))).find(Boolean);
  const ctaA = nodes.map((n) => {
    const a = n.matches('a') ? n : n.querySelector('a');
    return a || null;
  }).find(Boolean);
  const paras = nodes.filter((n) => n.tagName === 'P' && !n.querySelector('a, span.icon')
    && n.textContent.trim() && !iconNameOf(n));

  const bar = document.createElement('div');
  bar.className = 'horizontal-text-bar';
  ['red', 'blue', 'purple'].forEach((c) => { if (block.classList.contains(c)) bar.classList.add(c); });

  if (iconName) {
    const i = document.createElement('i');
    i.className = `band-icon mda-stack-1x mda-inverse bicon-${iconName}`;
    i.setAttribute('aria-hidden', 'true');
    bar.append(i);
  }

  const textC = document.createElement('div');
  textC.className = 'text-container';
  if (heading) {
    const h = document.createElement('h3');
    h.className = 'title';
    [...heading.childNodes].forEach((n) => h.append(n.cloneNode(true)));
    textC.append(h);
  }
  if (paras.length) {
    const desc = document.createElement('div');
    desc.className = 'description';
    paras.forEach((p) => {
      const copy = p.cloneNode(true);
      wrapNowrap(copy);
      desc.append(copy);
    });
    textC.append(desc);
  }
  bar.append(textC);

  if (ctaA) {
    const ctaC = document.createElement('div');
    ctaC.className = 'cta-container';
    const cta = document.createElement('div');
    cta.className = 'cta';
    const a = ctaA.cloneNode(true);
    a.className = 'cta-block';
    if (isExternal(a)) {
      a.append(document.createTextNode(' '));
      const out = document.createElement('span');
      out.className = 'mda-icon-linkout';
      const hidden = document.createElement('span');
      hidden.className = 'visuallyhidden';
      hidden.textContent = 'Opens a new window';
      out.append(hidden);
      a.append(out);
    }
    cta.append(a);
    ctaC.append(cta);
    bar.append(ctaC);
  }

  block.replaceChildren(bar);
}
