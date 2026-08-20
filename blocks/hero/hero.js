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
 * (30% dark scrim), compact (thin interior title band), dots (forced dots).
 * The desktop + mobile duplicate render is emitted by the block — copy is
 * authored once (log §7: migration artifact, not a variant).
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
  const out = { imgs: [], heading: null, kicker: null, ctas: [] };
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

function buildBody(slide, { mobile, isFirst, align, arrowCta }) {
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
    const wrapCls = align === 'right' ? 'right-aligned-cta cta'
      : align === 'left' ? 'left-aligned-cta cta' : 'default-cta cta';
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

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'hero') return;
  const rows = [...block.children];
  if (!rows.length) return;
  const align = block.classList.contains('right') ? 'right'
    : block.classList.contains('left') ? 'left' : 'center';
  // left-aligned heros (research) use the inline arrow CTA treatment
  const arrowCta = align === 'left';
  const slides = rows.map(collectSlide).filter((s) => s.heading || s.imgs.length || s.ctas.length);

  const heroWrap = el('div', 'carousel-hero');
  const group = el('div', 'carousel-group carousel-config-hero slick-initialized', heroWrap);
  const list = el('div', 'slick-list draggable', group);
  const track = el('div', 'slick-track', list);
  const multi = slides.length > 1;

  slides.forEach((slide, i) => {
    const alignCls = align === 'right' ? ' right-aligned' : align === 'left' ? ' left-aligned' : '';
    const item = el('div', `carousel-item medium-hero${alignCls} slide-${i + 1}${multi ? (i === 0 ? ' slick-current' : '') : ''}`, track);
    const mediaWrap = el('div', '', item);
    el('div', '', mediaWrap); el('div', '', mediaWrap); el('div', '', mediaWrap);
    const media = el('div', `carousel-image media-image mda-media-brightness${block.classList.contains('overlay') ? ' medium-overlay' : ''}`, mediaWrap);
    slide.imgs.forEach((m, mi) => {
      const node = m.cloneNode(true);
      const img = node.tagName === 'IMG' ? node : node.querySelector('img');
      if (img) {
        img.classList.add(mi === 0 ? 'hero-bg-desktop' : 'hero-bg-mobile');
        if (i === 0 && mi === 0) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
        else img.loading = 'lazy';
      }
      if (node.tagName === 'PICTURE') node.className = mi === 0 ? 'hero-bg-pic-desktop' : 'hero-bg-pic-mobile';
      media.append(node);
    });
    item.append(buildBody(slide, { mobile: false, isFirst: i === 0, align, arrowCta }));
    item.append(buildBody(slide, { mobile: true, isFirst: i === 0, align, arrowCta }));
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
