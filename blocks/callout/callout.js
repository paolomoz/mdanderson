/**
 * callout — highlighted fact card (invented; reconstructive tier).
 * Converts on patients-family/diagnosis-treatment/clinical-trials as `purple`
 * ("Did You Know?" rail card); the article cluster reuses it as `boxed`
 * (key-takeaways: title + bullet list).
 * Schema: stardust/eds-schema/patients-family-diagnosis-treatment-clinical-trials-html.json
 * (about-trials → did-you-know unit).
 *
 * Authoring: one row/cell — <h3>title</h3> + body (paragraphs or a <ul>).
 * Decode is classifier-based: heading → title slot, everything else → body.
 */
export default async function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'callout-inner';

  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  if (heading) {
    const h = document.createElement('h3');
    h.className = 'callout-title';
    h.append(...[...heading.childNodes].map((n) => n.cloneNode(true)));
    inner.append(h);
  }

  const body = document.createElement('div');
  body.className = 'callout-body';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((el) => {
      if (el.matches('h1,h2,h3,h4,h5,h6') || el.querySelector('h1,h2,h3,h4,h5,h6')) return;
      body.append(el.cloneNode(true));
    });
    if (!cell.children.length && cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      body.append(p);
    }
  });
  if (body.children.length) inner.append(body);

  block.replaceChildren(inner);
}
