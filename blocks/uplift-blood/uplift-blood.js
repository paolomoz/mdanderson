/*
 * uplift-blood — blood-drive ruled card (uplift-c demo).
 * Decode tier: TEMPLATE-SLOTTED (#95) — prototype §.blood DOM verbatim;
 * authored heading / copy / CTA / note slotted by role. The drop icon is
 * fixed presentation (inline SVG in the template).
 */

const DROP_SVG = '<svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true"><path d="M26 4C26 4 12 22 12 33a14 14 0 0028 0C40 22 26 4 26 4z" fill="#DA291C"/></svg>';

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const heading = cell.querySelector('h1, h2, h3');
  const cta = [...cell.querySelectorAll('a')].pop();
  const paragraphs = [...cell.querySelectorAll('p')]
    .filter((p) => !p.querySelector('a') && p.textContent.trim());
  const copy = paragraphs[0];
  const note = paragraphs[1];

  const card = document.createElement('div');
  card.className = 'blood-card';
  card.setAttribute('data-anim', '');
  card.innerHTML = `
    <span class="blood-icon" aria-hidden="true">${DROP_SVG}</span>
    <div class="blood-copy"><h3></h3><p></p></div>
    <div class="blood-cta"></div>`;

  if (heading) card.querySelector('h3').textContent = heading.textContent.trim();
  if (copy) card.querySelector('.blood-copy p').textContent = copy.textContent.trim();
  const ctaSlot = card.querySelector('.blood-cta');
  if (cta) {
    const a = document.createElement('a');
    a.className = 'btn btn--red';
    a.href = cta.href;
    a.textContent = cta.textContent.trim();
    if (/^https?:/.test(cta.href) && !cta.href.includes(window.location.hostname)) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    ctaSlot.append(a);
  }
  if (note) {
    const span = document.createElement('span');
    span.className = 'note';
    span.textContent = note.textContent.trim();
    ctaSlot.append(span);
  }

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(card);

  block.textContent = '';
  block.append(wrap);
}
