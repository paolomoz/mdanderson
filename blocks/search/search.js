/**
 * search — site search band; the form is BUILT IN BLOCK JS (interactive, never
 * authored — D15/#20). Template-slotted (#95). Converts on
 * patients-family/diagnosis-treatment/clinical-trials as `trials`; the
 * cancerwise cluster reuses it as `blog`.
 * Schema: stardust/eds-schema/patients-family-diagnosis-treatment-clinical-trials-html.json
 * (trial-search section).
 *
 * Authoring rows (classified):
 *   - heading row (h2)              → band title ("Search Clinical Trials")
 *   - first link-free text row      → lede sentence
 *   - second link-free text row     → input placeholder (short)
 *   - link row                      → the search TARGET (D4 opaque URL token);
 *                                     the link's text is the submit label
 */
export default async function decorate(block) {
  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  const link = block.querySelector('a[href]');
  const texts = [...block.querySelectorAll(':scope > div > div')]
    .filter((c) => !c.querySelector('a') && !c.querySelector('h1,h2,h3,h4,h5,h6') && c.textContent.trim())
    .map((c) => c.textContent.trim());
  const lede = texts[0] || '';
  const placeholder = texts[1] || texts[0] || 'Search';
  const target = link ? link.getAttribute('href') : '#';
  const submitLabel = link ? link.textContent.trim() : 'Search';

  const band = document.createElement('div');
  band.className = 'search-band';

  const h = document.createElement('h2');
  h.textContent = heading ? heading.textContent.trim() : '';
  band.append(h);

  if (lede) {
    const p = document.createElement('p');
    p.className = 'search-lede';
    p.textContent = lede;
    band.append(p);
  }

  const form = document.createElement('form');
  form.className = 'search-form';
  const label = document.createElement('label');
  label.className = 'search-visually-hidden';
  label.textContent = placeholder;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-field';
  input.placeholder = placeholder;
  const id = `search-${Math.random().toString(36).slice(2, 8)}`;
  input.id = id;
  label.setAttribute('for', id);
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'search-submit';
  submit.textContent = submitLabel;
  form.append(input, label, submit);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    const url = new URL(target, window.location.origin);
    if (q) url.searchParams.set('q', q);
    window.location.assign(url.toString());
  });
  band.append(form);

  block.replaceChildren(band);
}
