/**
 * table — styled content table (live `.rte-container table`).
 * Live pipeline (mda-web internal.min.js): grafts a <thead> from the
 * authored <th> row, adds `.table`, runs footable, hides empty body
 * cells and zebra-stripes every second body row (`.odd`).
 * Reference: patients-family/becoming-our-patient/getting-to-md-anderson/
 * parking.html (Mays Clinic/Duncan Building garage rates table).
 *
 * Authoring: standard EDS table — block rows become table rows, cells
 * become columns. First row becomes the <thead> (header is the default;
 * `header` variant accepted). Variants: `no-header` (all rows are body
 * rows, live `.no-header` path), `striped` (accepted; live stripes every
 * table, so zebra is always on — see table.css nth-child rule).
 */
export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    if (header && i === 0) thead.append(tr);
    else tbody.append(tr);
    [...row.children].forEach((cell) => {
      const el = document.createElement(header && i === 0 ? 'th' : 'td');
      if (el.tagName === 'TH') el.setAttribute('scope', 'col');
      el.append(...cell.childNodes);
      // live parity: internal.min.js hides body cells with no text
      if (el.tagName === 'TD' && !el.textContent.trim()) el.classList.add('table-cell-empty');
      tr.append(el);
    });
  });

  block.replaceChildren(table);
}
