/**
 * article-header — cancerwise article headline band (invented name,
 * eds-conversion-log §5; template-slotted #95). Converts on
 * cancerwise/how-to-cope-with-insomnia-during-cancer-treatment.
 * Schema: stardust/eds-schema/cancerwise-how-to-cope-with-insomnia-during-
 * cancer-treatment-h00-159856134-html.json (article-header section).
 *
 * Slots (rows classified by content, not index — #48):
 *   - the <h1> row            → the page's single <h1> (#35)
 *   - the link row            → author name + profile URL
 *   - text row matching /read/→ read time ("8 minute read")
 *   - remaining text row      → publish date ("June 08, 2026")
 * Share buttons (email + share modal) are rendered HERE in block JS
 * (interactive machinery is never authored — D15/#20; mirrors blocks/share).
 */

const NETWORKS = [
  ['facebook', 'ah-fb', (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`],
  ['twitter', 'ah-x', (u) => `https://x.com/share?url=${u}`],
  ['linkedIn', 'ah-li', (u) => `https://www.linkedin.com/shareArticle?mini=true&url=${u}`],
  ['bluesky', 'ah-bs', (u) => `https://bsky.app/intent/compose?text=${u}`],
  ['threads', 'ah-th', (u) => `https://www.threads.com/intent/post?text=${u}`],
];

function buildShare() {
  const pageUrl = window.location.href.split('#')[0];
  const enc = encodeURIComponent(pageUrl);
  const subject = encodeURIComponent(document.title || 'UT MD Anderson');

  const wrap = document.createElement('div');
  wrap.className = 'ah-share';

  const email = document.createElement('a');
  email.className = 'ah-share-btn ah-share-email';
  email.href = `mailto:?subject=${subject}&body=${encodeURIComponent(`I thought you'd like to read this: ${pageUrl}`)}`;
  email.setAttribute('aria-label', 'Share by email');
  email.innerHTML = '<i class="ah-icon-mail" aria-hidden="true"></i>';

  const open = document.createElement('a');
  open.className = 'ah-share-btn ah-share-open';
  open.href = '#';
  open.setAttribute('role', 'button');
  open.setAttribute('aria-label', 'Share this article');
  open.innerHTML = '<i class="ah-icon-arrow" aria-hidden="true"></i>';

  const modal = document.createElement('div');
  modal.className = 'ah-modal';
  modal.innerHTML = `
    <div class="ah-modal-content">
      <span class="ah-close" role="button" tabindex="0"><i class="ah-icon-x" aria-hidden="true"></i><span class="ah-close-text">Close</span></span>
      <div class="ah-modal-header">Share this article</div>
      <div class="ah-social">Via social media:
        <div class="ah-social-links"></div>
      </div>
      <div class="ah-copy">Or copy the link: <br>
        <input type="text" class="ah-copy-field" readonly>
        <span class="ah-copy-button"><button type="button"><span class="ah-tooltip">Copy to clipboard</span>Copy</button></span>
      </div>
    </div>`;

  const linksWrap = modal.querySelector('.ah-social-links');
  NETWORKS.forEach(([label, cls, url]) => {
    const a = document.createElement('a');
    a.className = `ah-box ${cls}`;
    a.href = url(enc);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', label);
    a.innerHTML = '<i aria-hidden="true"></i>';
    linksWrap.append(a);
  });

  const field = modal.querySelector('.ah-copy-field');
  field.value = pageUrl;
  const closeModal = () => modal.classList.remove('open');
  open.addEventListener('click', (e) => { e.preventDefault(); modal.classList.add('open'); });
  modal.querySelector('.ah-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  const tooltip = modal.querySelector('.ah-tooltip');
  modal.querySelector('.ah-copy-button button').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(field.value);
      tooltip.textContent = 'Copied!';
    } catch {
      field.select();
      document.execCommand('copy');
      tooltip.textContent = 'Copied!';
    }
    setTimeout(() => { tooltip.textContent = 'Copy to clipboard'; }, 1500);
  });

  wrap.append(email, open, modal);
  return wrap;
}

export default async function decorate(block) {
  const authoredH1 = block.querySelector('h1, h2');
  const author = [...block.querySelectorAll('a')].find((a) => a.textContent.trim());
  const texts = [...block.querySelectorAll(':scope > div > div')]
    .filter((c) => !c.querySelector('a, h1, h2, h3') && c.textContent.trim())
    .map((c) => c.textContent.trim());
  const readTime = texts.find((t) => /read/i.test(t)) || '';
  const pubDate = texts.find((t) => t !== readTime) || '';

  const headline = document.createElement('div');
  headline.className = 'headline';

  const h1 = document.createElement('h1');
  if (authoredH1) h1.append(...[...authoredH1.childNodes].map((n) => n.cloneNode(true)));
  headline.append(h1);

  const info = document.createElement('div');
  info.className = 'ah-info';
  if (author) {
    const byline = document.createElement('p');
    byline.className = 'ah-author';
    byline.append('BY ');
    const a = author.cloneNode(true);
    a.className = 'ah-author-link';
    byline.append(a);
    info.append(byline);
  }
  const shareCell = document.createElement('div');
  shareCell.className = 'ah-share-cell';
  const spacer = document.createElement('span');
  spacer.className = 'ah-spacer';
  spacer.textContent = ' | ';
  shareCell.append(spacer, buildShare());
  info.append(shareCell);
  headline.append(info);

  if (readTime || pubDate) {
    const meta = document.createElement('div');
    meta.className = 'ah-meta';
    const p = document.createElement('p');
    p.className = 'ah-readtime-date';
    p.innerHTML = '<i class="ah-icon-clock" aria-hidden="true"></i>';
    const span = document.createElement('span');
    span.className = 'ah-tab';
    if (pubDate) {
      span.append(`${readTime} | Published `);
      const d = document.createElement('span');
      d.textContent = pubDate;
      span.append(d);
    } else {
      span.textContent = readTime;
    }
    p.append(span);
    meta.append(p);
    headline.append(meta);
  }

  block.replaceChildren(headline);
}
