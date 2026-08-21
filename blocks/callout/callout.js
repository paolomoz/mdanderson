/**
 * callout — highlighted fact card (invented; reconstructive tier).
 * Converts on patients-family/diagnosis-treatment/clinical-trials as `purple`
 * ("Did You Know?" rail card); the article cluster reuses it as `boxed`
 * (key-takeaways: title + bullet list).
 * Schema: stardust/eds-schema/patients-family-diagnosis-treatment-clinical-trials-html.json
 * (about-trials → did-you-know unit).
 *
 * Authoring: one row/cell — <h3>title</h3> + body (paragraphs or a <ul>).
 * Decode is classifier-based: heading → title slot, everything else → body.
 *
 * `contact-card` variant (newsroom media-contact sidebar — replica
 * `.article-sidebar` on `.publication-sidebar.alternate-sidebar`): gray box
 * with heading + contact paragraphs. Authoring: <h3>Media Specialist Contact
 * </h3> + plain paragraphs (name, email/phone links, @MDAndersonNews link).
 * Links to x.com/twitter.com get the live X-square icon + "opens a new
 * window" linkout affordance emitted by the block.
 *
 * `clinical-trials` variant (left-nav clinical-trials box — replica
 * `.left-nav-box` under the cancer-type left nav): red-bordered box with the
 * clinical-trials icon (emitted by the block), a serif paragraph, and a red
 * sans CTA link with trailing MDIcons arrow. Authoring: <p>body copy</p> +
 * <p><a>View Clinical Trials</a></p> (last link becomes the CTA).
 */

/** contact-card: social link gets the live X icon + linkout affordance */
function decorateContactCard(body) {
  body.querySelectorAll('a[href]').forEach((a) => {
    let host = '';
    try { host = new URL(a.href, window.location.href).hostname; } catch { return; }
    if (!/(^|\.)(x|twitter)\.com$/.test(host)) return;
    a.target = '_blank';
    const icon = document.createElement('i');
    icon.className = 'fa fa-x-twitter-square fa-1x';
    icon.setAttribute('aria-hidden', 'true');
    a.before(icon, ' ');
    const out = document.createElement('span');
    out.className = 'mda-icon-linkout';
    const sr = document.createElement('span');
    sr.className = 'visuallyhidden';
    sr.textContent = ' Opens a new window';
    out.append(sr);
    a.append(' ', out);
  });
}

/** clinical-trials: block-emitted icon; last link becomes the arrow CTA.
 *  Live icon class carries underscores (mda-icon-clinical_trials_new);
 *  kebab-cased here — the glyph/codepoint (\e649, mda-icons) is the live one. */
function decorateClinicalTrials(inner, body) {
  const icon = document.createElement('i');
  icon.className = 'mda-stack-1x mda-icon-clinical-trials-new';
  icon.setAttribute('aria-hidden', 'true');
  inner.prepend(icon);
  const a = [...body.querySelectorAll('a[href]')].pop();
  if (a && !a.querySelector('i.mdicon-arrow')) {
    a.classList.add('cta');
    a.append(' ');
    const arrow = document.createElement('i');
    arrow.className = 'teaser-more mdicon-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    a.append(arrow);
  }
}

export default async function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'callout-inner';

  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  if (heading) {
    const h = document.createElement('h3');
    h.className = 'callout-title';
    h.append(...[...heading.childNodes].map((n) => n.cloneNode(true)));
    inner.append(h);
  }

  const body = document.createElement('div');
  body.className = 'callout-body';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((el) => {
      if (el.matches('h1,h2,h3,h4,h5,h6') || el.querySelector('h1,h2,h3,h4,h5,h6')) return;
      body.append(el.cloneNode(true));
    });
    if (!cell.children.length && cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      body.append(p);
    }
  });
  if (body.children.length) inner.append(body);

  if (block.classList.contains('contact-card')) decorateContactCard(body);
  if (block.classList.contains('clinical-trials')) decorateClinicalTrials(inner, body);

  block.replaceChildren(inner);
}
