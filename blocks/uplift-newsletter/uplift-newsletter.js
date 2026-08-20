/*
 * uplift-newsletter — Cancerwise newsletter capture band (uplift-c demo).
 * Decode tier: TEMPLATE-SLOTTED (#95) — prototype §.newsletter DOM verbatim;
 * authored h2 + submit label slotted. The form is interactive structure,
 * built in block JS (D15 — never authored); submit listener attached here
 * (CSP: no inline handlers). Demo form: submit is prevented (no endpoint).
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const heading = cell.querySelector('h1, h2, h3');
  const label = [...cell.querySelectorAll('p')].find((p) => p.textContent.trim());

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const h2 = document.createElement('h2');
  h2.textContent = heading ? heading.textContent.trim() : 'Subscribe to our Cancerwise newsletter';
  wrap.append(h2);

  const form = document.createElement('form');
  form.innerHTML = `
    <input type="text" name="first" placeholder="First Name *" aria-label="First Name (required)" required>
    <input type="text" name="last" placeholder="Last Name *" aria-label="Last Name (required)" required>
    <input type="email" name="email" placeholder="Email Address *" aria-label="Email Address (required)" required>
    <button class="btn btn--red" type="submit"></button>`;
  form.querySelector('button').textContent = label ? label.textContent.trim() : 'Get started';
  form.addEventListener('submit', (e) => e.preventDefault());
  wrap.append(form);

  block.textContent = '';
  block.append(wrap);
}
