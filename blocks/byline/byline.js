/**
 * byline — "Medically Reviewed | Last reviewed by … on …" provenance line
 * (template-slotted, #95). Converts on cancer-types/breast-cancer
 * (eds-conversion-log §5). Reused by clinical-trials / breast-center where the
 * replica byline is EMPTY — an empty or missing row set renders nothing.
 *
 * Authoring rows:
 *   1. reviewer links (1..n) in one cell — <a href="profile">Name, M.D.</a>, …
 *   2. review date as plain text — e.g. "August 12, 2026"
 */
export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')].filter((a) => a.textContent.trim());
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const dateCell = cells.find((c) => !c.querySelector('a') && c.textContent.trim());
  const date = dateCell ? dateCell.textContent.trim() : '';

  if (!links.length && !date) {
    // empty-tolerant (breast-center / clinical-trials): render nothing
    block.replaceChildren();
    block.closest('.section')?.classList.add('byline-empty');
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'med-review';

  const check = document.createElement('i');
  check.className = 'med-review-check';
  check.setAttribute('aria-hidden', 'true');

  const bold = document.createElement('span');
  bold.className = 'med-review-bold';
  bold.textContent = 'Medically Reviewed';

  const pipe = document.createElement('span');
  pipe.className = 'med-review-pipe';
  pipe.textContent = '|';

  const text = document.createElement('span');
  text.className = 'med-review-text';
  text.append('Last reviewed by ');
  links.forEach((a, i) => {
    if (i > 0) text.append(i === links.length - 1 ? ' and ' : ', ');
    const clone = a.cloneNode(true);
    clone.className = 'med-review-link';
    text.append(clone);
  });
  if (date) {
    const d = document.createElement('span');
    d.className = 'med-review-date';
    d.textContent = ` on ${date.replace(/^on\s+/i, '')}`;
    text.append(d);
  }

  wrap.append(check, bold, pipe, text);
  block.replaceChildren(wrap);
}
