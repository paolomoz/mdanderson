/**
 * newsletter — Cancerwise signup band (invented name, eds-conversion-log §5).
 * Decode tier: template-slotted; the form is rendered in block JS (#20, D15 —
 * interactive machinery is never authored). Converts on index; reused by
 * every page (`cancerwise` dark band); the article page adds `focused`.
 * Schema: the subscribe band inside each page schema's global-footer section.
 *
 * Authoring: one row, one cell: <p>Band title</p>
 * (fields First/Last/Email + "Get started" are fixed in the template).
 *
 * EDITORIAL-cluster addition (wave 2): `focused` — the article rail's green
 * "Subscribe to Focused on Health" card. Authoring rows: title + intro copy;
 * fields Email/First/Last + Submit are fixed in the template.
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
  uid += 1;

  // EDITORIAL-cluster addition: `focused` — green rail card (article page)
  if (block.classList.contains('focused')) {
    const cells = [...block.querySelectorAll(':scope > div > div')]
      .map((c) => c.textContent.trim()).filter(Boolean);
    const [fTitle = 'Subscribe to Focused on Health', intro = ''] = cells;
    const card = el('div', 'focused-card');
    const circle = el('div', 'focused-icon', card);
    const stack = el('span', 'fa-stack fa-3x', circle);
    el('i', 'fa nl-icon-email mda-stack-1x', stack).setAttribute('aria-hidden', 'true');
    const h3 = el('h3', 'focused-title', card);
    h3.textContent = fTitle;
    const form = el('form', 'focused-form', card);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.classList.add('submitted');
    });
    if (intro) {
      const introDiv = el('div', 'focused-intro', form);
      introDiv.textContent = intro;
    }
    [['Email', 'email'], ['First Name', 'text'], ['Last Name', 'text']].forEach(([lbl, type], i) => {
      const field = el('div', 'focused-field', form);
      const labelEl = el('label', '', field);
      const id = `newsletter-${uid}-ff${i}`;
      labelEl.setAttribute('for', id);
      labelEl.textContent = `${lbl}*`;
      const wrap = el('div', 'focused-input', field);
      const input = el('input', '', wrap);
      input.type = type;
      input.id = id;
      input.required = true;
    });
    const actions = el('div', 'focused-actions', form);
    const submit = el('input', '', actions);
    submit.type = 'submit';
    submit.value = 'Submit';
    block.replaceChildren(card);
    return;
  }

  const title = (block.textContent || '').trim() || 'Subscribe to our Cancerwise newsletter';

  const band = el('div', 'subscribe-to');
  const inner = el('div', 'col-single inner', band);

  const circle = el('div', 'icon-circle', inner);
  const stack = el('span', 'fa-stack fa-2x', circle);
  el('i', 'fa fa-circle fa-stack-2x', stack).setAttribute('aria-hidden', 'true');
  el('i', 'fa nl-icon-email mda-stack-1x', stack).setAttribute('aria-hidden', 'true');

  const titleDiv = el('div', 'subscribeTitle', inner);
  titleDiv.textContent = title;

  // live parity (footer form, captured 2026-08-21): FormAssembly field names
  // tfa_23/38/20 + hidden tfa_61, GET to /publications.html — REAL submission,
  // same as the live site's no-JS path. Do not fake-submit.
  const form = el('form', 'footersfmcform', inner);
  form.action = 'https://www.mdanderson.org/publications.html';
  const flag = el('input', '', form);
  flag.type = 'hidden';
  flag.name = 'tfa_61';
  flag.value = '1';
  const fields = el('div', 'fieldContainer', form);
  [['First Name *', 'text', 'tfa_23', 'given-name'],
    ['Last Name *', 'text', 'tfa_38', 'family-name'],
    ['Email Address *', 'email', 'tfa_20', 'email']].forEach(([ph, type, name, ac], i) => {
    const holder = el('div', '', fields);
    const wrap = el('div', 'inputWrapper', holder);
    const input = el('input', '', wrap);
    input.type = type;
    input.name = name;
    input.required = true;
    input.autocomplete = ac;
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
