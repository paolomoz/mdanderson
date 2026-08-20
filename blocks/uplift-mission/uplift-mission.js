/*
 * uplift-mission — "Making Cancer History®" kinetic wordmark band
 * (uplift-c demo; the footer wipe-up is the page's final motion beat).
 * Decode tier: TEMPLATE-SLOTTED (#95) — prototype §.mission tagline DOM
 * verbatim. Authored: a single tagline paragraph ("Making Cancer History®").
 * decorate() re-emits the red strike through "Cancer" (span survives no DA
 * round-trip, so the strike is generated here, not authored) and the ® sup.
 * The motion runtime (scripts/uplift-motion.js) relocates this section below
 * the footer chrome and drives the clip-path wipe-up; with reduced motion or
 * no runtime the band renders static and unclipped.
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const tagline = [...cell.querySelectorAll('p')].find((p) => p.textContent.trim())
    || cell.querySelector('h2, h3');
  const text = tagline ? tagline.textContent.trim() : 'Making Cancer History®';

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const p = document.createElement('p');
  p.className = 'tagline site-footer__wordmark';

  // slot the tagline: strike through "Cancer", ® as <sup>
  const clean = text.replace(/®/g, '');
  const parts = clean.split(/(Cancer)/);
  parts.forEach((part) => {
    if (!part) return;
    if (part === 'Cancer') {
      const strike = document.createElement('span');
      strike.className = 'strike';
      strike.textContent = part;
      p.append(strike);
    } else {
      p.append(document.createTextNode(part));
    }
  });
  if (/®/.test(text)) {
    const sup = document.createElement('sup');
    sup.textContent = '®';
    p.append(sup);
  }

  wrap.append(p);
  block.textContent = '';
  block.append(wrap);
}
