# Page-production brief — POC-completion batch (70 samples)

Read AGENTS.md first. **Replica fidelity is the prime directive**: the deployed
EDS page must match the live original — verified mechanically by the gate. You
never invent layout, copy, or imagery; every value comes from the capture or
the live page.

## Inputs per page

- Capture JSON: `stardust/current/pages/<slug>.json` (headings, body, CTAs,
  media `currentSrc` URLs, metadata) — slug = live path, non-alnum → `-`,
  e.g. `/cancer-types/lung-cancer.html` → `cancer-types-lung-cancer-html`
- Capture screenshot: `stardust/current/assets/screenshots/<slug>.png`
- The live page itself: `curl -sL --compressed https://www.mdanderson.org<path>`
  (markup truth; the capture JSON is content truth)

## Target format — DA source HTML

`<body><header></header><main>…sections…</main><footer></footer></body>`.
One `<div>` per section; blocks are `<div class="blockname variant">` with
row/cell nested divs; default content (headings/p) sits directly in the
section div. `section-metadata` block for section styles. FIRST section
carries the `metadata` block (see contract below). Study your type's exemplar
before authoring — fetch with
`curl -s "https://admin.da.live/source/paolomoz/mdanderson<da-path>.html" -H "authorization: Bearer $DA_TOKEN"`
(token: `export $(grep DA_TOKEN ~/.claude/.env)`).

| Type | Exemplar DA path |
|---|---|
| landing | `/index`, `/patients-family`, `/research` |
| program | `/cancer-types/breast-cancer`, `/patients-family/diagnosis-treatment/care-centers-clinics/breast-center` |
| static | `/about-md-anderson` |
| listing | `/about-md-anderson/our-locations`, `/cancerwise` |
| article | `/cancerwise/how-to-cope-with-insomnia-during-cancer-treatment` |
| form | `/donors-volunteers` |
| disease | NEW — the lung-cancer archetype once approved (then fork it) |

## Blocks available

27 POC blocks (see `blocks/`; read a block's doc-comment for its authoring
rows before using it) **plus new (2026-08-21)**: `table` (rows/cells → table;
first row = thead; `no-header` variant), `sticky-cta` (one link per row:
tel, appointment URL, optional third; mobile-only ≤752px, live parity),
`search-results` (+ `trials` / `faculty` variants; form built in JS),
`hero (department)` (image row + h1/chair rows), `callout (contact-card)`,
`callout (clinical-trials)`.

## Metadata contract (per PLAN.md §3c — emit NOW, indexes are live)

Every page: `Title`, `Description` (verbatim live values), `Template` (the
page type). Additionally:
- article (cancerwise): `author`, `publishdate` (yyyy-mm-dd), `category`
  (closed set: diagnosis-treatment, patients-caregivers, healthy-living,
  research, expert-insights, philanthropy), `readtime`, `image`
- article (newsroom): `publishdate`, `releasetype` (press-release |
  research-highlight)
- disease: `cancertype` (e.g. lung-cancer), `pagekind` (landing | treatment |
  symptoms | diagnosis)
- clinical-trial detail: `protocolid`, `phase`, `diseases`, `trialstatus`

## Media

Download live images (`curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" -e "https://www.mdanderson.org/"`),
upload to DA under `/media/<section>/<basename>`:
`curl -X POST "https://admin.da.live/source/paolomoz/mdanderson/media/<section>/<name>" -H "authorization: Bearer $DA_TOKEN" -F "data=@<file>;type=image/jpeg"`,
then reference `https://content.da.live/paolomoz/mdanderson/media/<section>/<name>`.
Never hotlink www.mdanderson.org images in the page. Reuse existing media
where the exemplar already uploaded it.

## Links

- Links to pages IN the 82-page inventory (`stardust/migration-plan/sample-paths.txt`
  + the 12 POC pages): rewrite to the EDS path (strip `.html`).
- Same-origin links NOT in inventory: keep the absolute
  `https://www.mdanderson.org/...` URL (live-site bounce beats a 404).
- External links unchanged.

## Publish + gate loop (per page)

1. `curl -X POST "https://admin.da.live/source/paolomoz/mdanderson<path>.html" -H "authorization: Bearer $DA_TOKEN" -F "data=@page.html;type=text/html"` (path = live path minus `.html`; for
   cancerwise/newsroom articles ALSO drop the `.h00-…` suffix and any
   leading/odd dashes — mirror the insomnia exemplar's slug style; then pass
   the EDS path EXPLICITLY as the gate's 2nd arg)
2. Preview: `curl -X POST "https://admin.hlx.page/preview/paolomoz/mdanderson/main<path>" -H "authorization: Bearer $DA_TOKEN"`
3. Publish: `curl -X POST "https://admin.hlx.page/live/paolomoz/mdanderson/main<path>" -H "authorization: Bearer $DA_TOKEN"`
4. Gate: `node stardust/scripts/fidelity-gate.mjs <livePath>` (from repo root).
   PASS = pixel ≤10% (aim ≤5%) AND height Δ ≤10%. On FAIL, read
   `stardust/validation/gate/<slug>/diff.png` (downscale with sips first),
   fix, re-publish, re-gate. Budget up to 3 iterations; if still failing,
   record the residual with its cause — do not eyeball-polish past live truth.

## Parity rules (from the POC replica brief — where recreations actually fail)

- Verbatim text: no rewording, no truncation, keep entity/emphasis structure.
- Heading LEVELS mirror live; eyebrows and split headings mirror live nodes.
- Images: live `currentSrc` with query strings intact (then re-hosted to DA).
- Icon fonts: mdicons/mda-icons codepoints from live CSS `content:` rules.
- Carousels: captured t=0 state.
- Known nondeterminism (do NOT chase): call-tracking phone numbers rotate;
  award-badge counters; highlights-carousel rotation. Use captured values.
- Forms: field `name`s, hidden inputs, and `action` VERBATIM from live
  (FormAssembly `tfa_*` fields). NEVER test-submit a form against
  production — structural verification only.

## Hard rules

- Do NOT edit `stardust/state.json`, `styles/styles.css`, `scripts/aem.js`,
  or any block code. Block gaps are reported, not hot-fixed.
- Report per page: DA path, publish status, gate result (%, iterations),
  deviations/residuals, media uploaded.
