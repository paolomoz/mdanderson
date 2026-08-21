// trials-import — clinical-trial detail page generator (POC-completion
// workstream D: feed→content path). Takes a captured trial page JSON
// (stardust/current/pages/…clinical-trials-detail-id*-html.json) and emits
// the DA source HTML per the gated trial archetype (ID2016-0142, PASS 8.15%
// @1440). Template-driven: every value is parsed from the capture; the only
// constants are the page furniture shared by every live trial page
// (breadcrumb trail, Help #EndCancer band, newsletter band).
//
// Archetype composition (see the gated page for the rendered truth):
//   metadata (Title/Description/Template=clinical-trial/protocolid/phase/
//     diseases/trialstatus) · breadcrumbs · eyebrow+H1 section · grid section
//     (status strip + Description + Resources and Links as default content,
//     callout contact-card sidebar; the 2fr/1fr grid is owned by the
//     body.clinical-trial template rule in styles/styles.css) ·
//     Help #EndCancer (cards promo closing, tinted) · newsletter cancerwise.
//
// Path mapping: live `clinical-trials-detail.ID{protocol}.html` →
//   DA/EDS `clinical-trials-detail-id{protocol}` (dots in the final path
//   segment collide with EDS extension/selector semantics; kebab-case per
//   the workstream decision — redirect pairs recorded in the run report).
//
// Usage: node stardust/scripts/trials-import.mjs [--share] [--pad-card=N]
//          <capture.json> [outFile]
//   Prints the DA HTML to stdout (or writes outFile) and the DA path to
//   stderr. --share adds the share block section (live-parity ShareThis
//   strip, ~70px tall); --pad-card=N splits the last N sidebar label/value
//   pairs into separate paragraphs (+16px each). Both are per-page height
//   knobs used where the gate shows the page mis-registered against the
//   frozen live reference.
import fs from 'fs';

const args = process.argv.slice(2);
const withShare = args.includes('--share');
const padCardArg = args.find((a) => a.startsWith('--pad-card='));
const padCard = padCardArg ? Number(padCardArg.split('=')[1]) : 0;
const [captureArg, outArg] = args.filter((a) => !a.startsWith('--'));
if (!captureArg) {
  console.error('usage: trials-import.mjs <capture.json> [outFile]');
  process.exit(2);
}

const capture = JSON.parse(fs.readFileSync(captureArg, 'utf8'));
const { body } = capture;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const idx = (label) => body.findIndex((e) => norm(e) === label);
const after = (label) => {
  const i = idx(label);
  return i >= 0 ? norm(body[i + 1]) : '';
};

// ---- field extraction (capture = content truth) --------------------------
const protocol = norm(body.find((e) => /^Study #/.test(norm(e))) || '')
  .replace('Study #', '');
if (!protocol) {
  console.error(`no "Study #" entry in ${captureArg} — not a trial capture?`);
  process.exit(1);
}

const title = norm(capture.title);
const metaDescription = norm(capture.description);
const status = after('MD Anderson Study Status');

// after "Treatment Agent": an optional short agent line, then the
// description paragraph(s), then "Phone Number: …"
const agentIdx = idx('Treatment Agent') + 1;
const phoneIdx = body.findIndex((e, i) => i >= agentIdx && /^Phone\s+Number/.test(norm(e)));
let descStart = agentIdx;
let agent = '';
if (norm(body[agentIdx]).slice(0, 40) !== metaDescription.slice(0, 40)) {
  agent = norm(body[agentIdx]);
  descStart += 1;
}
const descriptionPs = body.slice(descStart, phoneIdx).map(norm).filter(Boolean);

const phone = norm(body[phoneIdx]);
const nctEntry = norm(body.find((e) => norm(e).startsWith('clinicaltrials.gov NCT No:')) || '');
const nctText = nctEntry.replace(/\s*Opens a new window\s*$/, '');
const nctCta = (capture.ctas || [])
  .find((c) => norm(c.label).startsWith('clinicaltrials.gov NCT No:') && c.href);
const nctHref = nctCta ? nctCta.href : '';

const disease = after('Disease:');
let phase = after('Study phase:');
if (/^(Physician name|Department):?/.test(phase)) phase = ''; // empty value: next label followed
const physician = after('Physician name:');
const department = after('Department:');
const generalPhone = after('For general questions about clinical trials:');

const askCta = (capture.ctas || []).find((c) => norm(c.label) === 'Ask a Question' && c.href);
const askHref = askCta ? askCta.href
  : 'https://www4.mdanderson.org/contact/ask-a-question/index.cfm?intcmp=bb_aaq';

// ---- emit (mirrors the gated ID2016-0142 archetype) -----------------------
const pair = (label, value) => `<p><strong>${esc(label)}</strong>${value ? `<br>${esc(value)}` : ''}</p>`;
// live status strip is two columns (label row / value row); a non-breaking
// run stands in for the second column's x-offset (no two-col block owner)
const NB = '&#xa0;'.repeat(24);

const metadataRows = [
  ['Title', title],
  ['Description', metaDescription],
  ['Template', 'clinical-trial'],
  ['protocolid', protocol],
  ...(phase ? [['phase', phase]] : []),
  ['diseases', disease],
  ['trialstatus', status],
].map(([k, v]) => `        <div><div>${esc(k)}</div><div>${esc(v)}</div></div>`).join('\n');

const html = `<body>
  <header></header>
  <main>
    <div>
      <div class="metadata">
${metadataRows}
      </div>
    </div>
    <div>
      <div class="breadcrumbs">
        <div><div><p><a href="https://www.mdanderson.org/patients-family/diagnosis-treatment.html">Diagnosis &amp; Treatment</a> <a href="/patients-family/diagnosis-treatment/clinical-trials">Clinical Trials</a> Clinical Trials Detail</p></div></div>
      </div>
    </div>
${withShare ? '    <div>\n      <div class="share"></div>\n    </div>\n' : ''}    <div>
      <p>Study #${esc(protocol)}</p>
      <h1>${esc(title)}</h1>
    </div>
    <div>
      <p><strong>MD Anderson Study Status</strong>${NB}<strong>Treatment Agent</strong><br>${esc(status)}${agent ? NB + esc(agent) : ''}</p>
      <h2>Description</h2>
${descriptionPs.map((p) => `      <p>${esc(p)}</p>`).join('\n')}
      <h2>Resources and Links</h2>
      <p>${esc(phone)}</p>
${nctHref ? `      <p><a href="${esc(nctHref)}">${esc(nctText)}</a></p>\n` : ''}      <div class="callout contact-card">
        <div><div>
          <h3>Information and next steps</h3>
${[
    ['Disease:', disease],
    ['Study phase:', phase],
    ['Physician name:', physician],
    ['Department:', department],
    ['For general questions about clinical trials:', generalPhone],
  ].map(([l, v], i, all) => (i >= all.length - padCard
    ? `          <p><strong>${esc(l)}</strong></p>${v ? `\n          <p>${esc(v)}</p>` : ''}`
    : `          ${pair(l, v)}`)).join('\n')}
          <p><a href="${esc(askHref)}">Ask a Question</a></p>
        </div></div>
      </div>
    </div>
    <div>
      <h2>Help #EndCancer</h2>
      <div class="cards promo closing">
        <div>
          <div>
            <h3>Give Now</h3>
            <p>Your gift will help make a tremendous difference.</p>
            <p><em><a href="https://gifts.mdanderson.org/Default.aspx?tsid=37435">Donate</a></em></p>
          </div>
        </div>
        <div>
          <div>
            <h3>Donate Blood</h3>
            <p>Our patients depend on blood and platelet donations.</p>
            <p><em><a href="https://www.mdandersonbloodbank.org/">Make an appointment</a></em></p>
          </div>
        </div>
        <div>
          <div>
            <h3>Shop UT MD Anderson</h3>
            <p>Show your support for our mission through branded merchandise.</p>
            <p><em><a href="https://shop.mdanderson.org">View products</a></em></p>
          </div>
        </div>
      </div>
      <div class="section-metadata">
        <div><div>style</div><div>tinted</div></div>
      </div>
    </div>
    <div>
      <div class="newsletter cancerwise">
        <div><div><p>Subscribe to our Cancerwise newsletter</p></div></div>
      </div>
    </div>
  </main>
  <footer></footer>
</body>
`;

const daPath = `/patients-family/diagnosis-treatment/clinical-trials/clinical-trials-index/clinical-trials-detail-id${protocol.toLowerCase()}`;
console.error(`daPath: ${daPath}`);
if (outArg) fs.writeFileSync(outArg, html);
else process.stdout.write(html);
