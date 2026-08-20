/*
 * uplift-why — credential count-up panel + "Why Choose" prose (uplift-c demo).
 * Decode tier: TEMPLATE-SLOTTED (#95) — prototype §.why DOM verbatim.
 * Row 1 (credential): "<number> <label>" p + h3 title + source p.
 * Row 2 (copy): h2 + paragraph + link. Emits data-countup on the numeral
 * (the 15-year credential counts itself up — motion runtime).
 */

export default function decorate(block) {
  const rows = [...block.children].map((row) => row.querySelector(':scope > div') || row);
  const [credCell, copyCell] = rows;

  const grid = document.createElement('div');
  grid.className = 'why-grid';

  // ── credential panel ──
  const cred = document.createElement('aside');
  cred.className = 'credential';
  cred.setAttribute('data-anim', '');
  cred.setAttribute('aria-label', 'U.S. News and World Report ranking');
  if (credCell) {
    const ps = [...credCell.querySelectorAll('p')];
    const statText = ps[0] ? ps[0].textContent.trim() : '';
    const match = statText.match(/^(\d+)\s*(.*)$/);
    const num = document.createElement('span');
    num.className = 'num';
    const label = document.createElement('span');
    label.className = 'num-label';
    if (match) {
      num.setAttribute('data-countup', match[1]);
      num.textContent = match[1];
      label.textContent = match[2];
    } else {
      num.textContent = statText;
    }
    cred.append(num, label);
    const title = credCell.querySelector('h2, h3, h4');
    if (title) {
      const h3 = document.createElement('h3');
      h3.className = 'cred-title';
      h3.textContent = title.textContent.trim();
      cred.append(h3);
    }
    const src = ps[1];
    if (src) {
      const p = document.createElement('p');
      p.className = 'cred-src';
      p.textContent = src.textContent.trim();
      cred.append(p);
    }
  }

  // ── why copy ──
  const copy = document.createElement('div');
  copy.className = 'why-copy';
  copy.setAttribute('data-anim', '');
  if (copyCell) {
    const heading = copyCell.querySelector('h1, h2, h3');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      copy.append(h2);
    }
    const rule = document.createElement('span');
    rule.className = 'rule';
    copy.append(rule);
    const body = [...copyCell.querySelectorAll('p')].find((p) => !p.querySelector('a') && p.textContent.trim());
    if (body) {
      const p = document.createElement('p');
      p.textContent = body.textContent.trim();
      copy.append(p);
    }
    const link = copyCell.querySelector('a');
    if (link) {
      const a = document.createElement('a');
      a.className = 'link-red';
      a.href = link.href;
      a.innerHTML = `${link.textContent.trim()} <span class="arr">→</span>`;
      copy.append(a);
    }
  }

  grid.append(cred, copy);
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(grid);
  block.textContent = '';
  block.append(wrap);
}
