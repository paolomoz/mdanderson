<!-- provenance: written by stardust:rollout (master session) | the author-only
     cluster-agent contract for EDS conversion Phase C | digest of deploy
     SKILL.md Steps 7-9 + ENCODE contract + rollout delivery gates -->

# EDS cluster-agent brief — mdanderson.org POC

You are an AUTHOR-ONLY conversion agent: you write block code and content
pages; you NEVER deploy, PUT to DA, publish, commit, or touch state files.
The orchestrator deploys centrally.

## Read first (in order)
1. `stardust/eds-conversion-log.md` — the LOCKED architecture. Block names,
   variants, decode tiers, converts-on/reused-by, closed section-style set
   (`dark` = blue #3361AD paint, `tinted`, `lede`, `bleed`, `page-head`),
   encode notes, metadata contract. Never invent a new block name; a gap goes
   in your report.
2. `/Users/paolo/.claude/plugins/cache/adobe-skills/stardust/0.18.1/skills/deploy/SKILL.md`
   — Steps 7 (brief), 8 (block JS + all numbered decode rules), 9 (content
   scaffold), the ENCODE contract, ANTI-PATTERNS. These are binding.
3. `stardust/runtime-contract.json` — formatted-only buttonization,
   `p.button-wrapper`, wrapTextNodes #104 applies.
4. Your pages' schemas: `stardust/eds-schema/<slug>.json`.

## Inputs per page
- Migrated HTML (the visual + content spec): path in `stardust/state.json`
  → `pages[].migratedPath`. The gated prototype at
  `http://localhost:8791/<slug>-proposed.html` renders the same page (server
  runs; NEVER start/kill servers on 8791).
- Foundation is DONE: `styles/styles.css` (tokens, buttons, 5 section
  styles), `styles/fonts.css`, `blocks/header`, `blocks/footer`,
  `content/nav.html`, `content/footer.html`. Do not modify foundation or
  chrome. Missing tokens: add to `:root` (never redefine existing).

## Deliverables per page
1. **Blocks you CONVERT** (your list only — reuse everything else by name):
   `blocks/<name>/<name>.js` + `.css` per deploy Step 8. Decode tier per the
   log (#95): template-slotted = prototype section DOM as template literal +
   role slots; reconstructive = defensive cell-cascade collector (#62/#104
   canonical `collectNodes`), heading-boundary segmentation (#52/#69/#76),
   classifiers `el.matches(sel) || el.querySelector(sel)` (#53), media =
   `picture, img` (#72). CSS scoped under `.<name>`, wrap containers styled
   (#13/#74), variants as block classes. Never manufacture button anchors
   (#4); clone cells — `decorateButtons` already classed them.
2. **Content page** at `content/<delivered-path>.html` — DA body fragment
   (deploy Step 9): starts `<body>`, empty `<header></header>`/`<footer></footer>`,
   one section per `main > div`, metadata block FIRST with real Title
   (≤60 chars from the page's captured title in
   `stardust/current/pages/<slug>.json`) + Description (captured meta
   description) + the page-type metadata contract rows from the conversion
   log (e.g. article → publishdate/category/author/image). Exactly one
   `<h1>`. Section heads above blocks = default content (D1). CTAs
   paragraph-wrapped `<strong><a>`/`<em><a>` per the log's mapping.
3. **Delivered path** = the pageMap path from `stardust/state.json`
   (`migrate.pageMap`), normalized per Gate 3: lowercase, no trailing `-`/`_`,
   no `--` segment, and STRIP any `.hNN-…` dotted suffix from the leaf
   (e.g. the cancerwise article → `/cancerwise/how-to-cope-with-insomnia-during-cancer-treatment`).
   When you change a path, append `source<TAB>destination` to
   `stardust/redirects.tsv`.

## Images (editorial vs decorative)
- Editorial images (meaning-carrying, incl. hero backgrounds): stage the
  binary at `media-staging/<scope>/<file>` (scope = short page slug; copy
  from `stardust/migrated/assets/...` where already local, else download with
  a real-Chrome UA + referer) and author
  `<img src="https://content.da.live/paolomoz/mdanderson/media/<scope>/<file>" alt="…">`.
  The orchestrator uploads media-staging before page PUTs. Do NOT anon-curl
  content.da.live URLs (they 401 by design).
- Keep a live-CDN absolute URL ONLY when no local copy exists and the URL
  200s to a Chrome-UA curl; list each in your report for media-reconcile.
- Decorative/fixed chrome imagery: CSS background, root-relative `/img/...`
  committed under `img/` (never absolute origins in block code, #44/#67).
- SVGs authored to DA must be pure-vector (#99); embedded-raster SVGs →
  extract the PNG.

## Internal links
Links to the 12 delivered pages → root-relative extensionless delivered
paths (no trailing slash, no .html). All other mdanderson.org links stay
absolute (bounce beats 404).

## Gates (all must pass before you report done — fix and re-run)
```bash
node skills/deploy/scripts/davids-model-lint.mjs content/<page>.html      # 0 red
node skills/deploy/scripts/block-roundtrip.mjs \
  "http://localhost:8791/<slug>-proposed.html" content/<page>.html --blocks <name>   # exit 0 per converted block
node skills/deploy/scripts/block-roundtrip.mjs \
  "http://localhost:8791/<slug>-proposed.html" content/<page>.html        # whole-page, exit 0
# harness + qa-gate: start the dev server yourself if not running —
#   npx -y @adobe/aem-cli up --no-open --port <unique port 3001-3099>   (kill it when done)
node skills/deploy/scripts/build-harness.mjs content/<page>.html qa/<slug>.html
node skills/deploy/scripts/qa-gate.mjs http://localhost:<port>/qa/<slug>.html --schema stardust/eds-schema/<slug>.json
```
qa-gate chrome-empty / auth-gated-image warnings are known harness limits —
note, don't chase. Per-instance variants from the log's fingerprint section
must be reproduced, never flattened (#90).

## Never
Deploy/PUT/publish; commit; edit foundation/chrome/scripts/aem.js/head.html;
create blocks outside your convert list; modify another cluster's content
files; touch stardust/state.json, status.jsonl, prototypes, or migrated/.

## Report (final reply, compact)
Per page: content path, blocks converted (names) / reused, gate results
(lint reds, roundtrip exit, qa-gate), images staged vs live-CDN-kept (counts
+ any 403/404 URLs), redirects added, deliberate drops (with why), gaps for
the deploy phase.
