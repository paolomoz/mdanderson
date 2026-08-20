/**
 * newsletter — Cancerwise signup band (invented name, eds-conversion-log §5).
 * Decode tier: template-slotted; the form is rendered in block JS (#20, D15 —
 * interactive machinery is never authored). Converts on index; reused by
 * every page (`cancerwise` dark band); the article page adds `focused`.
 * Schema: the subscribe band inside each page schema's global-footer section.
 *
 * Authoring: one row, one cell: <p>Band title</p>
 * (fields First/Last/Email + "Get started" are fixed in the template).
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

let uid = 0;

export default async function decorate(block) {
  // guard: variant classes of OTHER blocks may match this class token in
  // class-selector harnesses; only decorate our own block element
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'newsletter') return;
  const title = (block.textContent || '').trim() || 'Subscribe to our Cancerwise newsletter';
  uid += 1;

  const band = el('div', 'subscribe-to');
  const inner = el('div', 'col-single inner', band);

  const circle = el('div', 'icon-circle', inner);
  const stack = el('span', 'fa-stack fa-2x', circle);
  el('i', 'fa fa-circle fa-stack-2x', stack).setAttribute('aria-hidden', 'true');
  el('i', 'fa nl-icon-email mda-stack-1x', stack).setAttribute('aria-hidden', 'true');

  const titleDiv = el('div', 'subscribeTitle', inner);
  titleDiv.textContent = title;

  const form = el('form', '', inner);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.classList.add('submitted');
  });
  const fields = el('div', 'fieldContainer', form);
  [['First Name *', 'text'], ['Last Name *', 'text'], ['Email Address *', 'email']].forEach(([ph, type], i) => {
    const holder = el('div', '', fields);
    const wrap = el('div', 'inputWrapper', holder);
    const input = el('input', '', wrap);
    input.type = type;
    input.placeholder = ph;
    input.id = `newsletter-${uid}-f${i}`;
    input.setAttribute('aria-label', ph.replace(' *', ''));
  });
  const ctaWrap = el('div', 'footer-cta-wrapper', fields);
  const cta = el('div', 'footer-cta', ctaWrap);
  const submit = el('input', 'ftrSubGo', cta);
  submit.type = 'submit';
  submit.value = 'Get started';
  const ctaMobile = el('div', 'footer-cta-mobile', ctaWrap);
  const submitM = el('input', 'ftrSubGo', ctaMobile);
  submitM.type = 'submit';
  submitM.value = 'Get started';

  block.replaceChildren(band);
}
