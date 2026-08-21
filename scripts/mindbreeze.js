/*
 * mindbreeze.js — shared client for the MD Anderson Mindbreeze search
 * appliance (GSA-compatible "GSP" XML, VER 3.2). Verified endpoints
 * (all reflect the request Origin, so aem.page/aem.live can fetch direct):
 *   - site search:     /search2?q=…&site=mda_aem_prod&client=mda_aem_fe&output=xml_no_dtd
 *   - faculty:         /search-fis?q=…            (+ MT presenttitle/division/department/poster)
 *   - clinical trials: /search-clinicaltrial?q=…&output=xml_no_dtd&client=clinical_trial_fe
 *                        &requiredfields=collection:mda_aem_prod (+ MT diseases/cancer-topics)
 * Shape: <GSP><RES SN EN><M>total</M><R><T>title</T><S>snippet</S><U>url</U>
 *        <MT N V/>…</R>…</RES></GSP> — pagination via `start` (10/page).
 *
 * The XML→object mapping is Document-based (parseGspDoc) so it can be
 * exercised outside the browser with a minimal DOM shim.
 */

const APPLIANCE_ORIGIN = 'https://www.mdanderson.org';

/* faculty snippets end in a scraped-page tail, e.g.
   "Benjamin D. <em>Smith</em> | UT MD AndersonSkip to..." — cut it */
const BOILERPLATE_TAIL = '| UT MD Anderson';

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Strips the '| UT MD AndersonSkip to...' boilerplate tail from a snippet.
 * @param {string} text raw snippet text
 * @returns {string} snippet without the boilerplate tail
 */
export function stripBoilerplate(text) {
  const i = text.indexOf(BOILERPLATE_TAIL);
  return (i < 0 ? text : text.slice(0, i)).trim();
}

/**
 * Walks `text` and drops every markup tag the appliance left in field values
 * (<em>, <span>, …), returning plain text for textContent use.
 * @param {string} text field value with embedded tags
 * @returns {string} plain text
 */
export function stripTags(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const lt = text.indexOf('<', i);
    if (lt < 0) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, lt);
    const gt = text.indexOf('>', lt);
    if (gt < 0) {
      out += text.slice(lt);
      break;
    }
    i = gt + 1;
  }
  return out.trim();
}

/**
 * Sanitizes a snippet for innerHTML use: text is HTML-escaped, and of the
 * embedded tags only <em>/</em> (the appliance's query highlights) survive;
 * everything else (<span>, <b>, …) is dropped. Unbalanced ems are closed.
 * @param {string} text snippet text with embedded tags
 * @returns {string} safe HTML string containing only text and <em> elements
 */
export function sanitizeSnippet(text) {
  let out = '';
  let open = 0;
  let i = 0;
  while (i < text.length) {
    const lt = text.indexOf('<', i);
    if (lt < 0) {
      out += escapeHtml(text.slice(i));
      break;
    }
    out += escapeHtml(text.slice(i, lt));
    const gt = text.indexOf('>', lt);
    if (gt < 0) {
      out += escapeHtml(text.slice(lt));
      break;
    }
    const tag = text.slice(lt + 1, gt).trim().toLowerCase();
    if (tag === 'em') {
      out += '<em>';
      open += 1;
    } else if (tag === '/em' && open > 0) {
      out += '</em>';
      open -= 1;
    }
    i = gt + 1;
  }
  while (open > 0) {
    out += '</em>';
    open -= 1;
  }
  return out;
}

/**
 * Maps a parsed GSP XML Document to a result object.
 * @param {Document} doc parsed GSP XML (DOMParser 'text/xml' or a shim)
 * @returns {{total: number, start: number, end: number,
 *   results: {title: string, snippet: string, url: string,
 *   meta: Object<string, string>}[]}} `start`/`end` are the 1-based SN/EN
 *   bounds of this page; `snippet` is sanitized HTML (text + <em> only).
 */
export function parseGspDoc(doc) {
  const res = doc.querySelector('RES');
  if (!res) {
    return {
      total: 0, start: 0, end: 0, results: [],
    };
  }
  const m = res.querySelector('M');
  const total = Number((m && m.textContent) || '0');
  const start = Number(res.getAttribute('SN') || '0');
  const end = Number(res.getAttribute('EN') || '0');
  const results = [...res.querySelectorAll('R')].map((r) => {
    const text = (tag) => {
      const el = r.querySelector(tag);
      return el ? el.textContent : '';
    };
    const meta = {};
    [...r.querySelectorAll('MT')].forEach((mt) => {
      const name = mt.getAttribute('N');
      if (name && !(name in meta)) meta[name] = stripTags(mt.getAttribute('V') || '');
    });
    return {
      title: stripTags(text('T')),
      snippet: sanitizeSnippet(stripBoilerplate(text('S'))),
      url: text('U'),
      meta,
    };
  });
  return {
    total, start, end, results,
  };
}

/**
 * Queries a Mindbreeze appliance endpoint.
 * @param {object} opts options
 * @param {string} opts.endpoint absolute URL or appliance path (e.g. '/search2')
 * @param {string} opts.q query string
 * @param {number} [opts.start] 0-based result offset (10 per page)
 * @param {Object<string, string>} [opts.params] extra query params
 * @returns {Promise<ReturnType<typeof parseGspDoc>>} parsed results
 */
export async function mbSearch({
  endpoint, q, start = 0, params = {},
}) {
  const url = new URL(endpoint, APPLIANCE_ORIGIN);
  url.searchParams.set('q', q);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  if (start > 0) url.searchParams.set('start', String(start));
  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`mindbreeze: HTTP ${resp.status} from ${url.pathname}`);
  const xml = await resp.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('mindbreeze: unparseable GSP response');
  return parseGspDoc(doc);
}
