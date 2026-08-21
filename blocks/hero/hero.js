/**
 * hero — full-bleed hero carousel (mdanderson.org replica).
 * Decode tier: template-slotted (eds-conversion-log §5, #95) — the block holds
 * the replica's carousel-hero DOM and slots authored values by role.
 * Schema: stardust/eds-schema/index.json (hero), research-html.json (hero, 4 slides),
 * prevention-screening-html.json (hero).
 *
 * Authoring rows (one row per slide, single cell, elements in order):
 *   - <p><img desktop 1400x450></p>  (optional <p><img mobile 360x290></p> second)
 *   - <h1> (first slide of the page) / <h2> (other slides) — slide title;
 *     an authored <br> inside the title is kept (editorial break)
 *   - <p> plain text — optional kicker/subtitle (carousel-body-text)
 *   - <p><em><a>CTA</a></em></p> — optional; an authored <br> inside the CTA is
 *     rendered as a SPACE on desktop and kept on mobile (replica parity)
 *
 * Variants (block classes): carousel (default), static, left / right (text
 * alignment; default centered), scroll-cue (Scroll Ahead chevron), overlay
 * (30% dark scrim), compact (thin interior title band), dots (forced dots),
 * department (lab-small-hero — see below).
 * The desktop + mobile duplicate render is emitted by the block — copy is
 * authored once (log §7: migration artifact, not a variant).
 *
 * `department` variant (research department pages, e.g. abdominal-imaging):
 * the replica's `lab-small-hero dark` — 284px black band with backdrop image
 * and a table layout info overlay (66% title cell + 33% chair-contact cell,
 * white 1px divider). Authoring rows:
 *   - image row: <p><picture 1400x284 backdrop></p>
 *   - content row: <h1>Department Name</h1> + <p>Chair name</p> + <p>Title</p>
 *     (each remaining plain <p> is one contact line)
 * Rows/cells may be merged — decode collects by role, not by position.
 */

function el(tag, className, parent) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (parent) parent.append(e);
  return e;
}

/** the CTA anchor of a paragraph, unwrapping em/strong/button decoration */
function ctaOf(node) {
  const a = node.matches?.('a') ? node : node.querySelector?.('a');
  return a || null;
}

function cloneTitle(heading) {
  const frag = document.createDocumentFragment();
  [...heading.childNodes].forEach((n) => frag.append(n.cloneNode(true)));
  return frag;
}

/** clone anchor content; brs become spaces when `brToSpace` */
function cloneCta(a, brToSpace) {
  const copy = a.cloneNode(true);
  copy.removeAttribute('class');
  copy.className = 'cta-block';
  if (brToSpace) {
    copy.querySelectorAll('br').forEach((br) => br.replaceWith(document.createTextNode(' ')));
  }
  return copy;
}

function collectSlide(row) {
  const cell = row.querySelector(':scope > div') || row;
  // ctas: [desktop, mobile?] — a second CTA paragraph authors the mobile
  // rendering when the replica's mobile copy genuinely differs (research)
  const out = {
    imgs: [], heading: null, kicker: null, ctas: [],
  };
  out.imgs = [...cell.querySelectorAll('picture, img')]
    .filter((m) => !m.closest('picture') || m.tagName === 'PICTURE');
  out.heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  [...cell.querySelectorAll('p')].forEach((p) => {
    if (p.querySelector('picture, img')) return;
    const a = ctaOf(p);
    if (a) out.ctas.push(a);
    else if (p.textContent.trim() && !out.kicker) out.kicker = p;
  });
  // bare anchor fallback (flattened cell)
  if (!out.ctas.length) {
    const a = cell.querySelector('a:not(:has(img))');
    if (a) out.ctas.push(a);
  }
  return out;
}

function buildBody(slide, {
  mobile, isFirst, align, arrowCta,
}) {
  const body = el('div', `carousel-body${mobile ? ' mobile' : ''}`);
  const inner = el('div', `carousel-body-inner${mobile ? ' mobile' : ''}`, body);
  const content = el('div', `carousel-body-content${mobile ? ' mobile' : ''}`, inner);
  if (slide.heading) {
    const title = (!mobile && isFirst)
      ? el('h1', 'carousel-body-title', content)
      : el('div', 'carousel-body-title', content);
    title.append(cloneTitle(slide.heading));
  }
  if (slide.kicker) {
    const kick = el('div', 'carousel-body-text cta', content);
    kick.textContent = slide.kicker.textContent.trim();
  }
  const cta = mobile ? (slide.ctas[1] || slide.ctas[0]) : slide.ctas[0];
  if (cta) {
    let wrapCls = 'default-cta cta';
    if (align === 'right') wrapCls = 'right-aligned-cta cta';
    else if (align === 'left') wrapCls = 'left-aligned-cta cta';
    const ctaWrap = el('div', wrapCls, content);
    const a = cloneCta(cta, !mobile);
    if (arrowCta && !a.querySelector('i.mdicon-arrow')) {
      a.append(document.createTextNode(' '));
      el('i', 'mdicon-arrow', a).setAttribute('aria-hidden', 'true');
    }
    ctaWrap.append(a);
  }
  return body;
}

/**
 * department variant — replica lab-small-hero (dark): backdrop image band +
 * lab-hero-info overlay (h1 title cell + department chair contact cell).
 * Live class names carry underscores (lab_hero_info, contact_info); they are
 * kebab-cased here (lab-hero-info, contact-info) — values are lifted 1:1.
 */
function decorateDepartment(block) {
  const hero = el('div', 'lab-small-hero dark');
  const bg = el('div', 'background-image mda-media-brightness', hero);
  const media = block.querySelector('picture, img');
  if (media) {
    const node = media.closest('picture') || media;
    const copy = node.cloneNode(true);
    const img = copy.tagName === 'IMG' ? copy : copy.querySelector('img');
    if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
    bg.append(copy);
  }
  const info = el('div', 'lab-hero-info', hero);
  const titleWrap = el('div', 'title-container', info);
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const h1 = el('h1', '', titleWrap);
    h1.append(cloneTitle(heading));
  }
  // remaining plain paragraphs are the chair-contact lines
  const lines = [...block.querySelectorAll('p')]
    .filter((p) => !p.querySelector('picture, img') && p.textContent.trim());
  if (lines.length) {
    const contactInfo = el('div', 'contact-info', info);
    const container = el('div', 'info-container', contactInfo);
    const contact = el('div', 'contact', container);
    lines.forEach((p) => contact.append(p.cloneNode(true)));
  }
  block.replaceChildren(hero);
}

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'hero') return;
  const rows = [...block.children];
  if (!rows.length) return;
  if (block.classList.contains('department')) {
    decorateDepartment(block);
    return;
  }
  let align = 'center';
  if (block.classList.contains('right')) align = 'right';
  else if (block.classList.contains('left')) align = 'left';
  // left-aligned heros (research) use the inline arrow CTA treatment
  const arrowCta = align === 'left';
  const slides = rows.map(collectSlide).filter((s) => s.heading || s.imgs.length || s.ctas.length);

  const heroWrap = el('div', 'carousel-hero');
  const group = el('div', 'carousel-group carousel-config-hero slick-initialized', heroWrap);
  const list = el('div', 'slick-list draggable', group);
  const track = el('div', 'slick-track', list);
  const multi = slides.length > 1;

  slides.forEach((slide, i) => {
    let alignCls = '';
    if (align === 'right') alignCls = ' right-aligned';
    else if (align === 'left') alignCls = ' left-aligned';
    const currentCls = multi && i === 0 ? ' slick-current' : '';
    const item = el('div', `carousel-item medium-hero${alignCls} slide-${i + 1}${currentCls}`, track);
    const mediaWrap = el('div', '', item);
    el('div', '', mediaWrap); el('div', '', mediaWrap); el('div', '', mediaWrap);
    const media = el('div', `carousel-image media-image mda-media-brightness${block.classList.contains('overlay') ? ' medium-overlay' : ''}`, mediaWrap);
    slide.imgs.forEach((m, mi) => {
      const node = m.cloneNode(true);
      const img = node.tagName === 'IMG' ? node : node.querySelector('img');
      if (img) {
        img.classList.add(mi === 0 ? 'hero-bg-desktop' : 'hero-bg-mobile');
        if (i === 0 && mi === 0) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); } else img.loading = 'lazy';
      }
      if (node.tagName === 'PICTURE') node.className = mi === 0 ? 'hero-bg-pic-desktop' : 'hero-bg-pic-mobile';
      media.append(node);
    });
    item.append(buildBody(slide, {
      mobile: false, isFirst: i === 0, align, arrowCta,
    }));
    item.append(buildBody(slide, {
      mobile: true, isFirst: i === 0, align, arrowCta,
    }));
  });

  if (multi) {
    const prev = el('button', 'slick-prev', group); prev.type = 'button'; prev.textContent = 'Previous';
    group.insertBefore(prev, list.nextSibling);
    const next = el('button', 'slick-next', group); next.type = 'button'; next.textContent = 'Next';
    const dots = el('ul', 'slick-dots', group);
    const items = [...track.children];
    let current = 0;
    const show = (i) => {
      current = (i + items.length) % items.length;
      items.forEach((it, j) => it.classList.toggle('slick-current', j === current));
      [...dots.children].forEach((li, j) => li.classList.toggle('slick-active', j === current));
    };
    slides.forEach((s, i) => {
      const li = el('li', i === 0 ? 'slick-active' : '', dots);
      const b = el('button', '', li); b.type = 'button'; b.textContent = String(i + 1);
      b.addEventListener('click', () => show(i));
    });
    prev.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.classList.add('fade-anim');
    }
  }

  if (block.classList.contains('scroll-cue')) {
    const cue = el('a', 'scroll-down', heroWrap);
    cue.href = '#';
    const t = el('p', 'text', cue); t.textContent = 'Scroll Ahead';
    el('i', 'fa fa-chevron-down', cue).setAttribute('aria-hidden', 'true');
    cue.addEventListener('click', (e) => {
      e.preventDefault();
      const sec = block.closest('.section');
      if (sec && sec.nextElementSibling) sec.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
    });
  }

  block.replaceChildren(heroWrap);
}
