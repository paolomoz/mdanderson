/**
 * breadcrumbs — wayfinding trail under the appointment bar (interior/article pages).
 * Schema: stardust/eds-schema/cancer-types-breast-cancer-html.json (breadcrumbs).
 * Converts on cancer-types/breast-cancer (eds-conversion-log §5, decode D5).
 *
 * Authoring: ONE cell holding the ancestor links in order, followed by the
 * current page's plain-text name:
 *   <p><a href="…">Diagnosis &amp; Treatment</a> <a href="…">Cancer Types</a> Breast Cancer</p>
 * Decode is cell-level and order-preserving: every <a> becomes a linked crumb
 * (with the ">" arrow), any trailing non-link text becomes the current crumb.
 */
export default async function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const ul = document.createElement('ul');
  ul.className = 'crumbs';

  const pushText = (text) => {
    const t = text.trim();
    if (!t) return;
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = t;
    li.append(span);
    ul.append(li);
  };

  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) { pushText(n.textContent); return; }
      if (n.nodeType !== 1) return;
      if (n.matches('a')) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = n.href ? n.getAttribute('href') : '#';
        a.className = 'crumb-arrow';
        const span = document.createElement('span');
        span.textContent = n.textContent.trim();
        a.append(span);
        li.append(a);
        ul.append(li);
        return;
      }
      walk(n);
    });
  };
  walk(cell);

  if (!ul.children.length) { block.remove(); return; }
  block.replaceChildren(ul);
}
