/**
 * form — contact/question form pages (POC-COMPLETION workstream E).
 * Decode tier: template-slotted; the form machinery is rendered in block JS
 * (same contract as `newsletter`: interactive machinery is never authored).
 * Field `name`s, hidden inputs and `action` are VERBATIM from the live page
 * (captured 2026-08-21). The POC never submits to production: submit is
 * intercepted and, when the fields validate, navigates to the confirmation
 * page — the same redirect the live AJAX handler performs
 * (`data-redirectlocation`).
 *
 * `ask-a-question` variant (live /about-md-anderson/contact-us/askmdanderson/
 * ask-a-question.html — AEM ask-a-question-component posting to
 * /contactdata/ws/AskAQuestion.cfc). Two-column live row: form left,
 * FAQ rail + phone promo right. Authoring rows:
 *   - single cell with <h2> — FAQ rail title
 *   - two cells — one FAQ item: <h3>question</h3> | rich-text answer
 *   - single cell whose first link is tel: — red phone promo
 *     (link text = number, remaining <p>s = body copy)
 * The form itself has no authored rows. Select option lists (role /
 * information / diagnosis / country) are the live lists frozen in
 * aaq-options.json; on live they load from the CFC endpoints — POC residual.
 */

function el(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.append(e);
  return e;
}

/** live hidden inputs, verbatim (AEM forms fallback + CFC payload extras) */
const AAQ_HIDDEN_TOP = [
  [':formid', 'ask-a-question'],
  [':formstart', '/content/mda/en/about-md-anderson/contact-us/askmdanderson/ask-a-question/jcr:content/mainparsys/columns/column1/start_845388282'],
  ['_charset_', 'UTF-8'],
  [':redirect', '/about-md-anderson/contact-us/askmdanderson/ask-a-question/confirmation.html'],
];
const AAQ_HIDDEN_BOTTOM = [
  ['informationOther', 'informationOther', 'informationOther'],
  ['diagnosis', 'diagnosis', 'diagnosis'],
  ['diagnosisOther', 'diagnosisOther', 'diagnosisOther'],
  ['brochure', 'bro', 'brochure'],
  ['zipCode', 'zipCode', 'zipCode'],
];

function hiddenInput(name, value, id, parent) {
  const i = document.createElement('input');
  i.type = 'hidden';
  i.name = name;
  i.value = value;
  if (id) i.id = id;
  if (parent) parent.append(i);
  return i;
}

function fillSelect(select, options) {
  (options || []).forEach((o) => {
    const opt = document.createElement('option');
    if (o.v !== undefined) opt.setAttribute('value', o.v);
    if (o.dv !== undefined) opt.setAttribute('data-value', o.dv);
    opt.textContent = o.t;
    if (o.v === '') {
      opt.setAttribute('selected', '');
      opt.className = 'default text';
    } else opt.className = 'item';
    select.append(opt);
  });
}

function selectGroup(parent, {
  id, name, label, required, disabled, search,
}) {
  const group = el('div', 'form-select-group', parent);
  const lbl = el('label', '', group);
  lbl.setAttribute('for', id);
  lbl.textContent = label;
  const wrap = el('div', 'select-wrapper', group);
  const select = el('select', `ui selection dropdown${search ? ' search' : ''}${required ? ' required' : ''} needsclick`, wrap);
  select.id = id;
  select.name = name;
  select.tabIndex = 0;
  if (disabled) select.disabled = true;
  if (required) select.setAttribute('aria-required', 'true');
  const chev = el('i', 'fa fa-chevron-down needsclick', wrap);
  chev.setAttribute('aria-hidden', 'true');
  return select;
}

function textGroup(parent, {
  id, name, label, required, type = 'text',
}) {
  const group = el('div', 'form-text-group', parent);
  const lbl = el('label', '', group);
  lbl.setAttribute('for', id);
  lbl.textContent = label;
  const input = el('input', required ? 'required' : '', group);
  input.id = id;
  input.name = name;
  input.type = type;
  if (required) input.required = true;
  return input;
}

function textArea(parent, {
  id, name, label, hiddenGroup,
}) {
  const group = el('div', `text-area-container${hiddenGroup ? ' hidden' : ''}`, parent);
  group.dataset.textlimit = '2000';
  const lbl = el('label', '', group);
  lbl.setAttribute('for', id);
  lbl.textContent = label;
  const ta = el('textarea', '', group);
  ta.id = id;
  ta.name = name;
  ta.rows = 10;
  ta.cols = 50;
  ta.dataset.maxlength = '2000';
  const counter = el('span', 'text-area-counter', group);
  counter.textContent = '0 / 2000';
  ta.addEventListener('input', () => {
    if (ta.value.length > 2000) ta.value = ta.value.slice(0, 2000);
    counter.textContent = `${ta.value.length} / 2000`;
  });
  return ta;
}

/** the live ask-a-question form, field names / hidden inputs / action verbatim */
function buildAaqForm(options) {
  const form = document.createElement('form');
  form.id = 'ask-a-question';
  form.setAttribute('action', '/contactdata/ws/AskAQuestion.cfc?method=askAQuestion');
  form.setAttribute('method', 'post');
  form.dataset.redirectlocation = 'https://www.mdanderson.org/about-md-anderson/contact-us/askmdanderson/ask-a-question/confirmation.html';
  AAQ_HIDDEN_TOP.forEach(([n, v]) => hiddenInput(n, v, null, form));

  const title = el('h2', 'form-title', form);
  title.textContent = 'How can we help you?';
  const desc = el('p', 'form-description', form);
  desc.textContent = 'Our knowledgeable staff will provide answers to your questions using the most accurate information and credible resources. You can expect an email response as soon as we can. If you need immediate help, please call us.';
  const req = el('p', 'form-description-required', form);
  req.textContent = 'Fields marked with * are required.';

  const role = selectGroup(form, {
    id: 'patient-role', name: 'role', label: 'I am a:*', required: true,
  });
  fillSelect(role, options.role);
  const info = selectGroup(form, {
    id: 'information', name: 'information', label: 'I would like more information about:*', required: true, disabled: true,
  });
  fillSelect(info, options.information);
  role.addEventListener('change', () => { info.disabled = !role.value && role.selectedIndex === 0; });

  // live: cancer-type + describe sub-groups start hidden, driven by the
  // FAQ-suggestion machinery (not reproduced — POC residual)
  const cancerWrap = el('div', 'cancer-type-dropdown-container hidden', form);
  const diag = selectGroup(cancerWrap, {
    id: 'cancer-type', name: 'diagnosis', label: 'What type of cancer?', required: true, search: true,
  });
  fillSelect(diag, options.diagnosis);
  textArea(cancerWrap, {
    id: 'cancer-type-message', name: 'diagnosisOther', label: 'Please describe:', hiddenGroup: true,
  });
  textArea(form, {
    id: 'topic-message', name: 'informationOther', label: 'Please describe:', hiddenGroup: true,
  });

  textArea(form, {
    id: 'message',
    name: 'message',
    label: 'If you don’t see your question included among the FAQs on this page, enter it in the box below. Please include any details you think would help us answer you as quickly and accurately as possible.',
  });

  const contact = el('h2', '', form);
  contact.textContent = 'Contact information';
  textGroup(form, {
    id: 'firstName', name: 'firstName', label: 'First Name:*', required: true,
  });
  textGroup(form, {
    id: 'lastName', name: 'lastName', label: 'Last Name:*', required: true,
  });
  const country = selectGroup(form, {
    id: 'country', name: 'country', label: 'Country*', required: true, search: true,
  });
  fillSelect(country, options.country);
  textGroup(form, {
    id: 'emailAddress', name: 'emailAddress', label: 'Email:*', required: true, type: 'email',
  });
  textGroup(form, {
    id: 'emailAddressConfirmation', name: 'emailAddressConfirmation', label: 'Confirm Email:*', required: true, type: 'email',
  });

  const buttonDiv = el('div', 'button', form);
  const submit = el('button', '', buttonDiv);
  submit.id = 'submit';
  submit.type = 'submit';
  submit.textContent = 'Submit your question';
  AAQ_HIDDEN_BOTTOM.forEach(([n, v, id]) => hiddenInput(n, v, id, form));

  // POC: never posts to production — validate, then perform the redirect the
  // live AJAX success handler performs (confirmation page, EDS path)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      window.location.href = '/about-md-anderson/contact-us/askmdanderson/ask-a-question/confirmation';
    } else form.reportValidity();
  });
  return form;
}

/** FAQ rail item: collapsed question with +/- toggle (live .faq behavior) */
function faqItem(questionEl, answerCell) {
  const q = el('div', 'question');
  const h3 = el('h3', 'question-title', q);
  h3.tabIndex = 0;
  h3.setAttribute('role', 'button');
  h3.setAttribute('aria-expanded', 'false');
  const span = el('span', '', h3);
  span.append(...questionEl.childNodes);
  const minus = el('i', 'fa fa-minus', h3);
  minus.setAttribute('aria-hidden', 'true');
  const plus = el('i', 'fa fa-plus', h3);
  plus.setAttribute('aria-hidden', 'true');
  const answer = el('div', 'answer', q);
  answer.append(...answerCell.childNodes);
  const toggle = () => {
    const open = q.classList.toggle('open');
    h3.setAttribute('aria-expanded', String(open));
  };
  h3.addEventListener('click', toggle);
  h3.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  return q;
}

/** red phone promo (live flexpromo promo-background-red, call-stroke icon) */
function phonePromo(cell) {
  const a = cell.querySelector('a[href^="tel:"]');
  const card = el('div', 'phone-promo');
  const link = document.createElement('a');
  link.href = a.getAttribute('href');
  card.append(link);
  const iconWrap = el('div', 'promo-icon icon-circle', link);
  const stack = el('span', 'fa-stack fa-3x', iconWrap);
  const glyph = el('i', 'fa mda-icon-call-stroke mda-stack-1x mda-inverse', stack);
  glyph.setAttribute('aria-hidden', 'true');
  const h3 = el('h3', 'phone-promo-title', link);
  h3.textContent = a.textContent.trim();
  const body = el('div', 'phone-promo-body', link);
  [...cell.querySelectorAll('p')].forEach((p) => {
    if (!p.contains(a)) body.append(...p.childNodes);
  });
  return card;
}

export default async function decorate(block) {
  if (block.dataset && block.dataset.blockName && block.dataset.blockName !== 'form') return;

  // decode authored rows (defensively: collect by role, not position)
  let faqTitle = null;
  const faqItems = [];
  let phoneCell = null;
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const [first, second] = [...row.children];
    if (!first) return;
    if (second && first.querySelector('h2, h3, h4, p')) {
      faqItems.push([first.querySelector('h2, h3, h4, p'), second]);
    } else if (!second) {
      const h2 = first.querySelector('h2, h3');
      if (first.querySelector('a[href^="tel:"]')) phoneCell = first;
      else if (h2) faqTitle = h2;
    }
  });

  let options = {};
  try {
    const resp = await fetch(`${window.hlx.codeBasePath}/blocks/form/aaq-options.json`);
    if (resp.ok) options = await resp.json();
  } catch { /* selects render with defaults only */ }

  const left = el('div', 'form-col');
  left.append(buildAaqForm(options));

  const rail = el('div', 'form-rail');
  if (faqTitle || faqItems.length) {
    const faqBox = el('div', 'faq-container', rail);
    if (faqTitle) {
      const t = el('h2', 'faq-title', faqBox);
      t.append(...faqTitle.childNodes);
    }
    const list = el('div', 'faq', faqBox);
    faqItems.forEach(([q, a]) => list.append(faqItem(q, a)));
  }
  if (phoneCell) rail.append(phonePromo(phoneCell));

  block.replaceChildren(left, rail);
}
