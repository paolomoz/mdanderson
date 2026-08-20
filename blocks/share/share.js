/**
 * share — social-share buttons + share modal (template-slotted, ZERO authored
 * rows — the block derives every share URL from window.location; #95).
 * Converts on cancer-types/breast-cancer (eds-conversion-log §5).
 * Reused by breast-center, clinical-trials, the cancerwise article.
 *
 * Authoring: an empty block table — <div class="share"></div>. Nothing to edit.
 * Interactivity (modal open/close, copy-link) is wired here (D15: never authored).
 */

const NETWORKS = [
  ['facebook', 'share-fb', (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`],
  ['twitter', 'share-x', (u) => `https://x.com/share?url=${u}`],
  ['linkedIn', 'share-li', (u) => `https://www.linkedin.com/shareArticle?mini=true&url=${u}`],
  ['bluesky', 'share-bs', (u) => `https://bsky.app/intent/compose?text=${u}`],
  ['threads', 'share-th', (u) => `https://www.threads.com/intent/post?text=${u}`],
];

export default async function decorate(block) {
  const pageUrl = window.location.href.split('#')[0];
  const enc = encodeURIComponent(pageUrl);

  const buttons = document.createElement('div');
  buttons.className = 'share-buttons';

  const email = document.createElement('a');
  email.className = 'share-btn share-email';
  email.href = `mailto:?body=${enc}`;
  email.setAttribute('aria-label', 'Share by email');
  email.innerHTML = '<i class="share-icon-mail" aria-hidden="true"></i>';

  const open = document.createElement('a');
  open.className = 'share-btn share-open';
  open.href = '#';
  open.setAttribute('role', 'button');
  open.setAttribute('aria-label', 'Share this page');
  open.innerHTML = '<i class="share-icon-arrow" aria-hidden="true"></i>';

  buttons.append(email, open);

  const modal = document.createElement('div');
  modal.className = 'share-modal';
  modal.innerHTML = `
    <div class="share-modal-content">
      <span class="share-close" role="button" tabindex="0"><i class="share-icon-x" aria-hidden="true"></i><span class="share-close-text">Close</span></span>
      <div class="share-modal-header">Share this article</div>
      <div class="share-social">Via social media:
        <div class="share-social-links"></div>
      </div>
      <div class="share-copy">Or copy the link: <br>
        <input type="text" class="share-copy-field" readonly>
        <span class="share-copy-button"><button type="button"><span class="share-tooltip">Copy to clipboard</span>Copy</button></span>
      </div>
    </div>`;

  const linksWrap = modal.querySelector('.share-social-links');
  NETWORKS.forEach(([label, cls, url]) => {
    const a = document.createElement('a');
    a.className = `share-box ${cls}`;
    a.href = url(enc);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', label);
    a.innerHTML = '<i aria-hidden="true"></i>';
    linksWrap.append(a);
  });

  const field = modal.querySelector('.share-copy-field');
  field.value = pageUrl;

  const closeModal = () => { modal.classList.remove('open'); };
  open.addEventListener('click', (e) => { e.preventDefault(); modal.classList.add('open'); });
  modal.querySelector('.share-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  const tooltip = modal.querySelector('.share-tooltip');
  modal.querySelector('.share-copy-button button').addEventListener('click', async () => {
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

  block.replaceChildren(buttons, modal);
}
