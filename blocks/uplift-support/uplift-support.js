/*
 * uplift-support — support duo (myCancerConnection / One-on-One Counseling),
 * uplift-c demo. Decode tier: TEMPLATE-SLOTTED per card (#95) — prototype
 * §.support DOM verbatim; one authored row per card (h3 + p + CTA).
 * Prototype variant carried by position: card 2 is the purple card
 * (recorded decision — fixed two-card composition).
 */

export default function decorate(block) {
  const duo = document.createElement('div');
  duo.className = 'duo';

  [...block.children].forEach((row, i) => {
    const cell = row.querySelector(':scope > div') || row;
    const heading = cell.querySelector('h2, h3');
    const body = [...cell.querySelectorAll('p')]
      .find((p) => !p.querySelector('a') && p.textContent.trim());
    const cta = cell.querySelector('a');

    const card = document.createElement('div');
    card.className = i === 1 ? 'duo-card purple' : 'duo-card';
    card.setAttribute('data-anim', '');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      card.append(h3);
    }
    if (body) {
      const p = document.createElement('p');
      p.textContent = body.textContent.trim();
      card.append(p);
    }
    if (cta) {
      const a = document.createElement('a');
      a.className = i === 1 ? 'btn btn--purple' : 'btn btn--red';
      a.href = cta.href;
      a.textContent = cta.textContent.trim();
      card.append(a);
    }
    duo.append(card);
  });

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(duo);
  block.textContent = '';
  block.append(wrap);
}
