/*
 * search-results — Mindbreeze-backed results page (live parity: the v2
 * search-results page shell + clientlib-search styles). Variants:
 *   - (default) site search  → /search2 (mda_aem_prod / mda_aem_fe)
 *   - trials                 → /search-clinicaltrial (+ diseases/cancer-topics tags)
 *   - faculty                → /search-fis (poster/presenttitle/department cards)
 * The form/results UI is BUILT IN BLOCK JS (interactive, never authored);
 * authoring rows are optional hints:
 *   - heading row (h2, optional)  → band title
 *   - link-free text row          → input placeholder
 * Reads q/start URL params on load and keeps them synced.
 * Markup anatomy lifted from the live compiled Handlebars templates
 * (internal.min.js search_results_template / faculty_search_results_template)
 * and the search-results.v2.html shell; copy (no-results, error, count) is
 * the live shell's data-*copy attributes, verbatim.
 */

import { mbSearch } from '../../scripts/mindbreeze.js';

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 500;

const SOURCES = {
  default: {
    endpoint: '/search2',
    params: { site: 'mda_aem_prod', client: 'mda_aem_fe', output: 'xml_no_dtd' },
    placeholder: 'Search MD Anderson',
  },
  trials: {
    endpoint: '/search-clinicaltrial',
    params: { output: 'xml_no_dtd', client: 'clinical_trial_fe', requiredfields: 'collection:mda_aem_prod' },
    placeholder: 'Search Clinical Trials',
  },
  faculty: {
    endpoint: '/search-fis',
    params: {},
    placeholder: 'Search Faculty',
  },
};

/* live shell copy: data-numresultscopy="(total) results for (dynquery)" */
const COUNT_COPY = '(total) results for (dynquery)';

/* live shell copy: .searchError h2 */
const ERROR_COPY = 'An unknown error occurred. Please try your search again.';

/* live shell copy: data-noresultscopy / data-clin_trials_noresultscopy /
   data-fis_noresultscopy (resource-link lists included, verbatim) */
const NO_RESULTS_COPY = {
  default: `<p>We didn’t find any results for "<span class="search-term-red"></span>."</p>
<p>Please try the following:</p><ul>
<li>Check your spelling.</li>
<li>Search again using different words or phrases.</li></ul>
<p>Or, search other MD&nbsp;Anderson resources:</p><ul>
<li><a href="https://www.mdanderson.org/patients-family/search-results.v2.html?searchType=cancerwise">Blog Stories</a></li>
<li><a href="https://www.mdanderson.org/patients-family/search-results.v2.html?searchType=news">News Articles</a></li>
<li><a href="https://www.mdanderson.org/patients-family/search-results.v2.html?searchType=clinical%20trials">Clinical Trials</a></li>
<li><a href="https://faculty.mdanderson.org/">MD&nbsp;Anderson Doctors</a></li>
<li><a href="https://www.mdanderson.org/patients-family/search-results.v2.html?searchType=patient-education">Patient Education</a></li>
<li><a href="https://www.youtube.com/@mdanderson/videos">Video Library</a></li></ul>`,
  trials: `<p>We didn’t find any clinical trials that match "<span class="search-term-red"></span>.”</p>
<p>Please try the following:</p><ul>
<li>Check your spelling.</li>
<li>Search again using different words or phrases. Search terms can include the cancer type, treatment or drug, physician name, or national clinical trial (NCT) number.</li></ul>
<p>Or, search these sections of our site:</p><ul>
<li><a href="https://www.mdanderson.org/patients-family/search-results.v2.html?searchType=cancerwise">Blog Stories</a></li>
<li><a href="https://www.mdanderson.org/patients-family/search-results.v2.html?searchType=news">News Articles</a></li>
<li><a href="https://www.mdanderson.org/patients-family/diagnosis-treatment/cancer-types.html">Cancer Types</a></li></ul>`,
  faculty: `<p>We didn’t find any faculty members or specialties when searching for "<span class="search-term-red"></span>."</p>
<p>Please try the following:</p><ul>
<li>Check your spelling.</li>
<li>Return to the <a href="https://faculty.mdanderson.org/">faculty search page</a> to look up faculty members by division or department.</li></ul>
<p>Or, search these sections of our site:</p><ul>
<li><a href="https://www.mdanderson.org/patients-family/search-results.v2.html?searchType=cancerwise">Blog Stories</a></li>
<li><a href="https://www.mdanderson.org/patients-family/search-results.v2.html?searchType=news">News Articles</a></li>
<li><a href="https://www.mdanderson.org/patients-family/diagnosis-treatment/cancer-types.html">Cancer Types</a></li></ul>`,
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/* MT list values arrive duplicated ("Lung Cancer|Lung Cancer") — split + dedupe */
function metaList(value) {
  if (!value) return [];
  return [...new Set(value.split('|').map((v) => v.trim()).filter((v) => v))];
}

function renderResult(result, variant) {
  const li = el('li', 'search-result');
  const details = el('div', 'search-result-details');

  const title = el('div', 'search-result-title');
  const link = el('a', '', result.title || result.url);
  link.href = result.url;
  title.append(link);
  details.append(title);

  if (result.snippet) {
    /* live template nests p.search-result-details in div.search-result-details */
    const snippet = el('p', 'search-result-details');
    snippet.innerHTML = result.snippet; // sanitized in mindbreeze.js (text + em only)
    details.append(snippet);
  }

  if (variant === 'trials') {
    const tags = [...metaList(result.meta.diseases), ...metaList(result.meta['cancer-topics'])];
    if (tags.length) {
      const list = el('ul', 'search-result-tags');
      list.setAttribute('role', 'list');
      [...new Set(tags)].forEach((tag) => list.append(el('li', 'search-result-tag', tag)));
      details.append(list);
    }
  }

  li.append(details);
  return li;
}

/* faculty card, lifted from faculty_search_results_template:
   .faculty-result > .container > .bio-image img + .bio-text > a + p */
function renderFacultyResult(result) {
  const li = el('li', 'faculty-result');
  const container = el('div', 'container');

  if (result.meta.poster) {
    const media = el('div', 'bio-image');
    const img = document.createElement('img');
    img.src = new URL(result.meta.poster, 'https://www.mdanderson.org').toString();
    img.alt = result.title;
    img.loading = 'lazy';
    media.append(img);
    container.append(media);
  }

  const text = el('div', 'bio-text');
  const link = el('a', '', result.title || result.url);
  link.href = result.url;
  text.append(link);
  const lines = [result.meta.presenttitle, result.meta.department].filter((v) => v);
  if (lines.length) {
    const p = document.createElement('p');
    lines.forEach((line, i) => {
      if (i) p.append(document.createElement('br'));
      p.append(line);
    });
    text.append(p);
  }
  container.append(text);
  li.append(container);
  return li;
}

export default function decorate(block) {
  let variant = 'default';
  if (block.classList.contains('trials')) variant = 'trials';
  else if (block.classList.contains('faculty')) variant = 'faculty';
  const source = SOURCES[variant];

  /* optional authored hints (authors omit and add cells — defensive) */
  const authoredHeading = block.querySelector('h1,h2,h3,h4,h5,h6');
  const authoredText = [...block.querySelectorAll(':scope > div > div')]
    .find((c) => !c.querySelector('a,h1,h2,h3,h4,h5,h6') && c.textContent.trim());
  const placeholder = authoredText ? authoredText.textContent.trim() : source.placeholder;
  const headingText = authoredHeading ? authoredHeading.textContent.trim() : '';

  /* --- shell (live: .search-results-search-bar band + .search-content) --- */
  const band = el('div', 'sr-band');
  if (headingText) band.append(el('h1', 'sr-band-title', headingText));
  const form = el('form', 'sr-form');
  form.setAttribute('role', 'search');
  const label = el('label', 'sr-visually-hidden', placeholder);
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'sr-field';
  input.placeholder = placeholder;
  const inputId = `sr-field-${Math.random().toString(36).slice(2, 8)}`;
  input.id = inputId;
  label.setAttribute('for', inputId);
  const submit = el('button', 'sr-submit', 'Search');
  submit.type = 'submit';
  form.append(label, input, submit);
  band.append(form);

  const content = el('div', 'sr-content');
  const status = el('div', 'sr-status');
  status.setAttribute('aria-live', 'polite');
  const summary = el('div', 'search-result-summary');
  summary.hidden = true;
  const count = el('div', 'search-result-count');
  summary.append(count);
  const loader = el('div', 'sr-loader');
  loader.hidden = true;
  loader.append(el('span', 'sr-spinner'));
  const error = el('div', 'search-error');
  error.hidden = true;
  error.append(el('h2', '', ERROR_COPY));
  const noResults = el('div', 'no-results');
  noResults.hidden = true;
  const list = el('ul', variant === 'faculty' ? 'faculty-results two-wide' : 'search-result-list');
  list.setAttribute('role', 'list');
  const pagination = el('div', 'search-result-pagination');
  pagination.hidden = true;
  const prev = el('button', 'search-results-prev', 'Previous');
  prev.type = 'button';
  const pages = el('div', 'pagination');
  const next = el('button', 'search-results-more', 'Next');
  next.type = 'button';
  pagination.append(prev, pages, next);
  content.append(status, summary, loader, error, noResults, list, pagination);

  block.replaceChildren(band, content);

  /* ------------------------------ state ------------------------------ */
  let query = '';
  let startAt = 0; // 0-based offset
  let total = 0;
  let seq = 0;

  function syncUrl() {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (startAt > 0) url.searchParams.set('start', String(startAt));
    else url.searchParams.delete('start');
    window.history.replaceState(null, '', url.toString());
  }

  function renderCount() {
    count.textContent = '';
    const copy = COUNT_COPY.replace('(total)', total.toLocaleString('en-US'));
    const [before, after] = copy.split('(dynquery)');
    const strong = el('strong', '', query);
    count.append(before, strong, after || '');
    summary.hidden = false;
  }

  function renderPagination() {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const current = Math.floor(startAt / PAGE_SIZE) + 1;
    pagination.hidden = totalPages <= 1;
    prev.hidden = current <= 1;
    next.hidden = current >= totalPages;
    pages.replaceChildren();
    const windowStart = Math.max(1, Math.min(current - 4, totalPages - 9));
    const windowEnd = Math.min(totalPages, windowStart + 9);
    for (let p = windowStart; p <= windowEnd; p += 1) {
      const page = el('button', p === current ? 'active' : '', String(p));
      page.type = 'button';
      if (p === current) page.setAttribute('aria-current', 'page');
      page.setAttribute('aria-label', `Page ${p}`);
      page.dataset.start = String((p - 1) * PAGE_SIZE);
      pages.append(page);
    }
  }

  function renderNoResults() {
    noResults.innerHTML = NO_RESULTS_COPY[variant];
    noResults.querySelector('.search-term-red').textContent = query;
    noResults.hidden = false;
  }

  async function runSearch() {
    seq += 1;
    const mySeq = seq;
    list.replaceChildren();
    summary.hidden = true;
    error.hidden = true;
    noResults.hidden = true;
    pagination.hidden = true;
    if (!query) {
      status.textContent = '';
      return;
    }
    loader.hidden = false;
    status.textContent = 'Loading search results…';
    try {
      const data = await mbSearch({
        endpoint: source.endpoint, q: query, start: startAt, params: source.params,
      });
      if (mySeq !== seq) return; // a newer search superseded this one
      loader.hidden = true;
      total = data.total;
      if (!data.results.length) {
        status.textContent = `No results for ${query}`;
        renderNoResults();
        return;
      }
      status.textContent = `Showing results ${data.start} to ${data.end} of ${total.toLocaleString('en-US')}`;
      data.results.forEach((result) => {
        list.append(variant === 'faculty' ? renderFacultyResult(result) : renderResult(result, variant));
      });
      renderCount();
      renderPagination();
    } catch (e) {
      if (mySeq !== seq) return;
      loader.hidden = true;
      status.textContent = ERROR_COPY;
      error.hidden = false;
    }
  }

  function search(q, offset) {
    query = q;
    startAt = offset;
    syncUrl();
    runSearch();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    search(input.value.trim(), 0);
  });

  let debounce;
  input.addEventListener('input', () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      const q = input.value.trim();
      if (q !== query) search(q, 0);
    }, DEBOUNCE_MS);
  });

  pagination.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    let offset = startAt;
    if (button === prev) offset = Math.max(0, startAt - PAGE_SIZE);
    else if (button === next) offset = startAt + PAGE_SIZE;
    else if (button.dataset.start !== undefined) offset = Number(button.dataset.start);
    if (offset !== startAt) {
      search(query, offset);
      content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* read q/start URL params on load */
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = (urlParams.get('q') || '').trim();
  const initialStart = Math.max(0, Number(urlParams.get('start')) || 0);
  if (initialQ) {
    input.value = initialQ;
    query = initialQ;
    startAt = initialStart;
    runSearch();
  }
}
