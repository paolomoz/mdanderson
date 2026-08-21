/**
 * accordion — expandable classification panels (Block Collection model, D11).
 * Schema: stardust/eds-schema/cancer-types-breast-cancer-html.json (page-body →
 * H3.panel-title x3 / DIV.panel-container x3). Converts on
 * cancer-types/breast-cancer (eds-conversion-log §5, reconstructive tier).
 *
 * Authoring rows: ONE row per panel — [title cell | rich content cell].
 * Content cells may carry images: a <picture>/<img> followed by an <em>-only
 * paragraph renders as a right-floated media figure with a caption (the
 * replica's .content-with-image). Everything else is panel prose.
 * First panel opens by default (replica state). The replica's mobile
 * More/Less prose expander is reproduced as BLOCK-OWNED UI (the authored
 * content ships fully expanded — eds-conversion-log §1 locked decision).
 */

function buildMedia(picture, captionP) {
  const media = document.createElement('div');
  media.className = 'panel-media';
  media.append(picture);
  if (captionP) {
    const cap = document.createElement('div');
    cap.className = 'panel-media-caption';
    cap.append(...captionP.childNodes);
    media.append(cap);
  }
  return media;
}

function isCaption(p) {
  if (!p || p.tagName !== 'P') return false;
  const em = p.querySelector('em');
  return !!em && em.textContent.trim() === p.textContent.trim();
}

function buildToggle(body) {
  // mobile progressive disclosure (replica .more/.less cta)
  const kids = [...body.children].filter((el) => !el.classList.contains('panel-media'));
  const extra = kids.slice(3);
  if (!extra.length) return;
  extra.forEach((el) => el.classList.add('panel-extra'));
  const more = document.createElement('div');
  more.className = 'panel-toggle more';
  more.innerHTML = '<a href="#">More</a>';
  const less = document.createElement('div');
  less.className = 'panel-toggle less';
  less.innerHTML = '<a href="#">Less</a>';
  more.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); body.classList.add('expanded'); });
  less.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); body.classList.remove('expanded'); });
  body.append(more, less);
}

export default async function decorate(block) {
  const rows = [...block.children];
  const out = [];

  rows.forEach((row, i) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const titleCell = cells[0];
    const contentCell = cells[1] || document.createElement('div');

    const heading = document.createElement('h3');
    heading.className = 'panel-title';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
    const inner = titleCell.querySelector('h1,h2,h3,h4,h5,h6') || titleCell;
    const title = inner.textContent.trim();
    btn.innerHTML = `<span class="panel-title-text">${title}</span><i class="panel-icon" aria-hidden="true"></i>`;
    heading.append(btn);
    // stable slug id so in-page links (#classifying-by-…) can target panels
    heading.id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const panel = document.createElement('div');
    // first panel opens by default (breast-cancer replica state); live pages
    // with all panels closed (careers FAQ) author the `closed` variant
    const firstOpen = i === 0 && !block.classList.contains('closed');
    panel.className = `panel-container ${firstOpen ? 'open' : 'closed'}`;
    const body = document.createElement('div');
    body.className = 'panel-body';

    const nodes = [...contentCell.children].length ? [...contentCell.children] : [...contentCell.childNodes];
    for (let n = 0; n < nodes.length; n += 1) {
      const el = nodes[n];
      if (el.nodeType !== 1) continue;
      const pic = el.matches('picture, img') ? el : (el.children?.length === 1 && el.querySelector(':scope > picture, :scope > img'));
      if (pic) {
        const next = nodes[n + 1];
        const cap = isCaption(next) ? next : null;
        body.append(buildMedia(el.matches('picture, img') ? el : pic, cap));
        if (cap) n += 1;
      } else {
        body.append(el);
      }
    }
    buildToggle(body);
    panel.append(body);

    btn.addEventListener('click', () => {
      const isOpen = panel.classList.contains('open');
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.classList.toggle('open', !isOpen);
      panel.classList.toggle('closed', isOpen);
    });

    out.push(heading, panel);
  });

  block.replaceChildren(...out);

  // deep-link support: open the panel a location hash targets
  const openHash = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const h = block.querySelector(`h3.panel-title[id="${CSS.escape(id)}"]`);
    if (h) h.querySelector('button')?.dispatchEvent(new Event('click'));
  };
  window.addEventListener('hashchange', openHash);
  openHash();
}
