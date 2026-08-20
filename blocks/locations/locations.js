/**
 * locations — Houston-area location listing (invented name,
 * eds-conversion-log §5). Decode tier: reconstructive.
 * Converts on about-md-anderson/our-locations (houston-locations).
 * Schema: stardust/eds-schema/about-md-anderson-our-locations-html.json
 * (houston-locations: featured campus card + sub-location cards; the
 * fingerprint lock tolerates an image-less/empty sub-item — log §7).
 *
 * Authoring (one row per unit):
 *   location card row — 3 cells:
 *     <p><img></p> | <p><a href="location page">Name</a></p> |
 *     <p><a href="maps url">Street<br>City, State ZIP</a></p>
 *     (first location row = the featured campus card; the image cell may be
 *     empty — the card still renders, log §7 tolerance)
 *   campus-building row — 2 cells (rendered inside the featured card's
 *     MORE/LESS dropdown, wired in block JS):
 *     <p>BUILDING NAME</p> | <p><a href="maps url">Street address</a></p>
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

function cloneInto(target, node) {
  if (!node) return;
  [...node.childNodes].forEach((n) => target.append(n.cloneNode(true)));
}

function buildAddress(container, loc) {
  const wrap = el('div', 'maddress-container', container);
  const addr = el('div', 'maddress', wrap);
  if (loc.nameA) {
    const a = el('a', '', addr);
    a.href = loc.nameA.getAttribute('href');
    const title = el('p', 'mtitle', a);
    cloneInto(title, loc.nameA);
    title.append(document.createTextNode('  '));
    el('i', 'teaser-more mdicon-arrow arrowStyle', title).setAttribute('aria-hidden', 'true');
  } else if (loc.nameCell && loc.nameCell.textContent.trim()) {
    const title = el('p', 'mtitle', addr);
    title.textContent = loc.nameCell.textContent.trim();
  }
  addr.append(document.createElement('br'));
  if (loc.addrA) {
    const span = el('span', '', addr);
    const a = el('a', 'mtext', span);
    a.href = loc.addrA.getAttribute('href');
    cloneInto(a, loc.addrA);
  }
}

function buildImage(container, loc) {
  const img = el('div', 'mimage', container);
  if (!loc.media) return;
  const media = (loc.media.closest && loc.media.closest('picture')) || loc.media;
  if (loc.nameA) {
    const a = el('a', '', img);
    a.href = loc.nameA.getAttribute('href');
    a.setAttribute('aria-hidden', 'true');
    a.tabIndex = -1;
    a.append(media);
  } else {
    img.append(media);
  }
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'locations') return;
  const locations = [];
  const buildings = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length || !row.textContent.trim()) return;
    const media = row.querySelector('picture, img');
    const nonImgCells = cells.filter((c) => !c.querySelector('picture, img'));
    const nameCell = nonImgCells[0] || null;
    const addrCell = nonImgCells[1] || null;
    const nameA = nameCell ? nameCell.querySelector('a') : null;
    const addrA = addrCell ? addrCell.querySelector('a') : null;
    if (media || nameA) {
      // location card (image-less card tolerated — log §7 fingerprint)
      locations.push({ media, nameCell, nameA, addrCell, addrA });
    } else if (nameCell) {
      // campus building (featured card's MORE/LESS dropdown)
      buildings.push({ name: nameCell.textContent.trim(), addrA, addrCell });
    }
  });

  if (!locations.length) return;
  const listing = el('div', 'locations-listing');

  // featured campus card
  const featured = locations[0];
  const menu = el('div', 'menu-container', listing);
  buildImage(menu, featured);
  buildAddress(menu, featured);
  let dropdown = null;
  if (buildings.length) {
    const moreless = el('div', 'moreless', menu);
    const toggle = el('a', 'more-less-link', moreless);
    toggle.href = '#';
    toggle.textContent = 'MORE +';
    toggle.setAttribute('aria-expanded', 'false');

    dropdown = el('div', 'drop-down', listing);
    const infoC = el('div', 'minfo-container', dropdown);
    const info = el('div', 'minfo', infoC);
    buildings.forEach((b) => {
      const item = el('div', 'mitem', info);
      const title = el('span', 'minfo-title', item);
      title.textContent = b.name;
      item.append(document.createElement('br'));
      const span = el('span', '', item);
      if (b.addrA) {
        const a = el('a', 'minfo-addr', span);
        a.href = b.addrA.getAttribute('href');
        a.textContent = b.addrA.textContent.trim();
      } else if (b.addrCell) {
        span.textContent = b.addrCell.textContent.trim();
      }
      el('span', 'mseparator', item);
    });

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const open = dropdown.classList.toggle('open');
      toggle.textContent = open ? 'LESS –' : 'MORE +';
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // sub-location cards + trailing empty spacer (replica grid parity, log §7)
  const subs = el('div', 'sub-container-main', listing);
  locations.slice(1).forEach((loc) => {
    const item = el('div', 'sub-item', subs);
    buildImage(item, loc);
    buildAddress(item, loc);
  });
  el('div', 'sub-item', subs).setAttribute('aria-hidden', 'true');

  block.replaceChildren(listing);
}
