/**
 * promo-band — headline-with-image split band (invented name,
 * eds-conversion-log §5). Decode tier: template-slotted (#95).
 * Converts on prevention-screening (`orange right`); donors reuses `left`.
 * Schema: stardust/eds-schema/prevention-screening-html.json
 * (prevention-center-promo).
 *
 * Authoring: one row, two cells.
 *   image cell: <p><img 700x355></p>
 *   info cell: optional <h2>kicker</h2>, <p>display line</p> (description),
 *     <p><a>arrow CTA</a></p>
 * Variants: `left` / `right` = which side the INFO panel sits on;
 * panel color `orange` (default = brand blue).
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'promo-band') return;
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cells = [...row.children];
  const imgCell = cells.find((c) => c.querySelector('picture, img'));
  const infoCell = cells.find((c) => c !== imgCell) || cells[cells.length - 1];
  const infoRight = !block.classList.contains('left');

  const band = el('div', 'headline-with-image');

  const imgC = el('div', `image-container ${infoRight ? 'left' : 'right'}`);
  if (imgCell) {
    const inner = el('div', '', imgC);
    const media = imgCell.querySelector('picture, img');
    if (media) inner.append(media.closest('picture') || media);
  }

  const panelColor = ['orange', 'red'].find((c) => block.classList.contains(c));
  const infoC = el('div', `info-container${panelColor ? ` ${panelColor}` : ''}`);
  const info = el('div', 'info', infoC);
  const kicker = infoCell ? infoCell.querySelector('h1, h2, h3') : null;
  const heading = el('h2', 'heading', info);
  if (kicker) heading.textContent = kicker.textContent.trim();
  if (infoCell) {
    const desc = [...infoCell.querySelectorAll('p')]
      .find((p) => p.textContent.trim() && !p.querySelector('a, picture, img'));
    if (desc) {
      const p = el('p', 'description', info);
      p.textContent = desc.textContent.trim();
    }
    const link = infoCell.querySelector('a');
    if (link) {
      const a = link.cloneNode(true);
      a.className = 'cta';
      a.append(document.createTextNode(''));
      // wave-2 addition: external CTAs get the linkout glyph (donors
      // campaign-band); internal keep the arrow (prevention unchanged)
      let external = false;
      try {
        external = new URL(a.getAttribute('href'), 'https://www.mdanderson.org/').hostname !== 'www.mdanderson.org';
      } catch { external = false; }
      if (external) {
        const s = el('span', 'mda-icon-linkout', a);
        const hidden = el('span', 'visuallyhidden', s);
        hidden.textContent = ' Opens a new window';
      } else {
        const i = el('i', 'teaser-more mdicon-arrow', a);
        i.setAttribute('aria-hidden', 'true');
      }
      info.append(a);
    }
  }

  if (infoRight) band.append(imgC, infoC);
  else band.append(infoC, imgC);
  block.replaceChildren(band);
}
