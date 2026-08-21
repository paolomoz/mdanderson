/**
 * news-archive — newsroom year/month archive listing (workstream B3,
 * POC-COMPLETION listing cluster: /newsroom/2024, /newsroom/2025,
 * /newsroom/2020/01). Query-index-driven from day one: reads
 * /newsroom/query-index.json and renders the live archive anatomy —
 * month-grouped headings ("January 2020") with release title links + dates
 * (live DOM: section.table > .blog-summary > .blog-summary-wrapper with
 * h3.blog-title > a and p.author-date).
 *
 * Authoring rows (key | value):
 *   year   — REQUIRED, the archive year ("2024")
 *   month  — optional, restricts to one month ("1", "01" or "January")
 *   source — optional index override (default /newsroom/query-index.json)
 *
 * Empty year/month (young index) renders a clean empty state; a fetch error
 * or missing `year` renders nothing (console.warn).
 */

const DEFAULT_SOURCE = '/newsroom/query-index.json';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/* "1" / "01" / "January" / "jan" → 1-12, or 0 when absent/unparsable */
function monthNumber(value) {
  if (!value) return 0;
  const n = Number.parseInt(value, 10);
  if (n >= 1 && n <= 12) return n;
  const name = value.trim().toLowerCase();
  const i = MONTHS.findIndex((m) => m.toLowerCase().startsWith(name.slice(0, 3)));
  return i >= 0 ? i + 1 : 0;
}

/* live archive date line format: "February 03, 2020" (p.author-date) */
function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '';
  return `${MONTHS[Number(m[2]) - 1]} ${m[3]}, ${m[1]}`;
}

function cleanTitle(title) {
  return (title || '').replace(/\s*\|\s*(UT\s+)?MD Anderson.*$/i, '').trim();
}

export default async function decorate(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [key, value] = [...row.children].map((c) => c.textContent.trim());
    if (key && value !== undefined) config[key.toLowerCase()] = value;
  });
  const year = (config.year || '').trim();
  const month = monthNumber(config.month);
  const source = config.source || DEFAULT_SOURCE;

  if (!/^\d{4}$/.test(year)) {
    // eslint-disable-next-line no-console
    console.warn('news-archive: missing or invalid `year` config row');
    block.replaceChildren();
    return;
  }

  let entries;
  try {
    const resp = await fetch(source);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    entries = (await resp.json()).data || [];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`news-archive: fetch failed for ${source}`, e);
    block.replaceChildren();
    return;
  }

  const inScope = entries
    .filter((entry) => {
      const m = /^(\d{4})-(\d{2})/.exec(entry.publishdate || '');
      if (!m || m[1] !== year) return false;
      return !month || Number(m[2]) === month;
    })
    .sort((a, b) => (b.publishdate || '').localeCompare(a.publishdate || ''));

  if (!inScope.length) {
    const empty = document.createElement('p');
    empty.className = 'na-empty';
    empty.textContent = month
      ? `There are no news releases for ${MONTHS[month - 1]} ${year}.`
      : `There are no news releases for ${year}.`;
    block.replaceChildren(empty);
    return;
  }

  // group by month, newest month first (entries already sorted desc)
  const groups = new Map();
  inScope.forEach((entry) => {
    const key = entry.publishdate.slice(0, 7); // yyyy-mm
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });

  const archive = document.createElement('div');
  archive.className = 'na-archive';
  groups.forEach((group, key) => {
    const section = document.createElement('section');
    section.className = 'na-group';
    const head = document.createElement('h2');
    head.className = 'na-month';
    head.textContent = `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
    section.append(head);
    const list = document.createElement('ul');
    list.className = 'na-list';
    group.forEach((entry) => {
      const item = document.createElement('li');
      item.className = 'na-item';
      const title = document.createElement('a');
      title.className = 'na-title';
      title.href = entry.path;
      title.textContent = cleanTitle(entry.title);
      const date = document.createElement('p');
      date.className = 'na-date';
      date.textContent = formatDate(entry.publishdate);
      item.append(title, date);
      list.append(item);
    });
    section.append(list);
    archive.append(section);
  });
  block.replaceChildren(archive);
}
