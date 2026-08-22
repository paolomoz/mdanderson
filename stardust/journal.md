<!-- provenance: written by stardust:stardust (master) | append-only chronological journal per reference/journal-format.md -->

# Journal — MD Anderson EDS migration POC

## 2026-08-19 — Project kickoff

**Prompt:** Migrate mdanderson.org to EDS as a POC to de-risk a $1.5M AEM CS
opportunity. Customer context: 30-min discussion, lift+shift concern list
(Java rewrites, template rework, Grunt→Webpack, video, myCV faculty profiles,
OnCore clinical trials firewall, Mindbreeze search), four open questions
(page-load speed, list accuracy, migration process, what "shine" means).
Sales risk: customer may stall waiting for a future redesign. EDS repo
github.com/paolomoz/mdanderson, DA folder /paolomoz/mdanderson, DA_TOKEN in
~/.claude/.env.

**Decisions:**
- Two-track POC approved by user: (1) `replica` same-design migration of ~12
  archetype pages to EDS; (2) `uplift` shine variants on the homepage.
- Fully hands-off; all quality gates enforced.
- Cloned EDS boilerplate repo paolomoz/mdanderson into project root; token
  hygiene added to .gitignore (.env, .env.*, qa/) before any commit.

**Open questions:**
- Faculty profile pages live on faculty.mdanderson.org (separate subdomain) —
  roster uses the www physician-directory page instead if subdomain capture
  is blocked.
- Donate flow is on gifts.mdanderson.org (external funnel) — POC captures the
  www donate landing only.

## 2026-08-19 — Extract + preserve-direction + delivery wiring

**Done:**
- 12-page bounded extract (live Playwright, 0 failures). 4 pages recaptured
  after a Verint iframe survey-invite contaminated the first captures; crawler
  and live-session.mjs project copies extended with an all-frames decline pass
  (learnings candidate for upstream).
- Vision check: all 12 ok. Finding: /patients-family.html is a near-duplicate
  of the homepage template → sibling of index archetype, not its own recreation.
- CSS lift (scripts/replica/lift.mjs): layout maps @1440+@360 for 11
  archetypes, 27 font files, clientlib CSS harvested.
- Phase 2 preserve-direction: bounded-single spec (PRODUCT/DESIGN/DESIGN.json),
  empty inconsistency register (pure replica).
- Delivery wiring verified: DA_TOKEN valid, fstab.yaml added + pushed,
  admin.hlx.page preview of / → aem.page returns 200.

**Known nondeterminism (pre-justified gate deltas):** call-tracking phone
numbers rotate per render; homepage award-badge year counter varies.

**Fonts:** Minion + Univers LT are licensed kits — self-hosted for local gate
only; delivery licensing decision surfaced to user at report time.

## 2026-08-19 — Batch 1 complete + incident note

**Batch 1 gates (all approved, hands-off):** index 3.58%/10.79*, breast-cancer
2.95%/8.91, clinical-trials 2.55%/8.46, prevention 2.38%/7.30, article
4.40%/3.86, donors 1.58%/8.85 (pixel % at 1440/360; *index 360 0.79pt over
bar, residuals ledgered — dominant band is shared mobile-footer chrome, fix
in flight). Chrome-consolidation agent dispatched.

**Incident:** during batch 1 a subagent created GitHub repo
`paolomoz/mdanderson-auto` (19:27Z, aem-boilerplate + fstab) without
instruction — likely a stray eds-new-site skill invocation. Local clone
gitignored and removed from index; remote repo left for the user to decide
(deletion is destructive). POC delivery target remains paolomoz/mdanderson.

## 2026-08-20 — Recreation phase complete (11/11)

Batch 2 + chrome consolidation done. Final gate numbers (pixel % 1440/360):
index 3.56/8.77, breast-cancer 2.95/8.70, breast-center 2.87/8.35,
clinical-trials 2.55*/6.98, prevention 2.37/6.61, research 2.29/5.34,
about 2.09/7.37, locations 2.05/5.80, cancerwise 2.45/6.01, article 4.40/3.07,
donors 1.57/8.10. All pass the ≤10% bar; every residual diagnosed (dominant
classes: rotating call-tracking phones, live scroll-state widgets, live-drift
vs capture, shared-chrome micro-offsets ≤9px). Two agents were killed by
transient API 500s and recovered (one resumed, one finished by a fresh agent
from on-disk state). *clinical-trials 1440 smoke read 8.78 vs ledger 2.55 —
proven pre-existing/live-drift by revert test.

Next: migrate (Path A ×11 + patients-family sibling) → rollout to EDS.

## 2026-08-20 — Delivery + uplift

**EDS delivery:** 25 blocks (23 content + header/footer chrome), 12 content
pages + nav/footer documents authored across 4 cluster agents (all lint /
block-roundtrip / qa-gate green), 140 media binaries rehosted to DA, 14/14
documents PUT→preview→live with 0 failures. Foundation-first gate green.
One post-deploy fix: `:icon-x:` tokens double-prefixed icon SVG paths
(aem.js strips only the first `icon-`), 62 tokens fixed + full redeploy.
POC live at https://main--mdanderson--paolomoz.aem.page/ (and .aem.live).

**Uplift (shine track):** three validated homepage variants at
localhost:8791/uplift-{a,b,c}.html — A green-light (6 diagnosed weaknesses
fixed), B photography-editorial, C cinematic (arrival register, red-strike
kinetic signature, Lenis + canonical runtime, motion Pass 6 green).

**In flight:** rollout verification agent (coverage, verify, link audit,
eyeballs, CLS, perf, optimize, report, dashboard).

## 2026-08-20 — POC complete

Rollout verified: 12/12 pages live+verified on aem.page/aem.live, 0 dead
internal links, CLS 0.039, Lighthouse perf 80 (index, mobile-throttled) /
100 (breast-cancer), optimize gate 0 open P1. Post-QA fixes shipped: `.icon`
utility scoped to decorateIcons spans (variant-class collision had collapsed
8 card blocks on 7 pages), 23 icon glyphs extracted from mda-icons.ttf to
SVGs, 4 masked layout residues fixed, interior dark-strip link color fixed —
all re-verified live. Uplift track: 3 validated homepage variants
(uplift-a/b/c). Learnings ledger has 5 pending entries for upstream.

Open for the user: (1) font licensing before any public/live use beyond the
POC preview (Minion/Univers, alerts in styles.css + fonts/LICENSING.md);
(2) stray repo paolomoz/mdanderson-auto created by an out-of-scope subagent
— delete or keep; (3) fast-follows: redirects.json wiring, JSON-LD P2s,
query-index flip for Cancerwise listings at production scale.

## 2026-08-20 — uplift-c cinematic demo live

Deployed on branch `uplift-c` at
https://uplift-c--mdanderson--paolomoz.aem.page/uplift-c (fallback path:
per-branch fstab mounts are ignored on this config generation — site-level
config wins; learnings candidate). 11 template-slotted blocks, motion via
committed Lenis + runtime imported from block JS (CSP-safe). Deployed-URL
verification: content clean, chrome + dark strip correct, 25/25 entrances,
countup, native scrolling, reduced-motion static fallback, 0 errors. Note:
programmatic window scroll doesn't drive Lenis — motion QA must scroll via
mouse.wheel (probe-artifact class, recorded).

## 2026-08-20 — Homepage fidelity refinement (user-driven)

User supplied fresh side-by-side screenshots; 8 differences identified and
fixed: 48px header reserve collapsing into a white gap above the hero;
`tinted` gray-band section styles never authored (fixed across all 12 pages,
computed-sweep verified against every original); carousel-variant CSS leaking
into the hero (gray CTA + 9px black sliver — carousel rules now scoped
:not(.hero)); nav item dividers + LANGUAGES caret specificity; footer
tel/heading nowrap; alert-band drop baseline. Measured deployed-vs-live pixel
diff: 21.44% → 4.53% at 1440 (prototype benchmark 3.56%; residual = live
churn). CLS 0.0026. 12 docs redeployed; breast-cancer/donors/research
regression-checked clean.

## 2026-08-21 — Canvas + trio corrections (user-driven)

User caught two defects: (1) yesterday's full-bleed change was wrong at wide
viewports — the live site caps the ENTIRE page at a centered 1440px canvas
(body max-width, probed at 1920: everything x=240/w=1440); deployed now
matches exactly. (2) icon-trio label overlapped its circle by 13px — the
shared 95px .promo-icon wrapper clipped the 108px circle (inline-block
bottom margins don't grow line boxes); icon-variant wrapper now 128px,
deployed gap measures 20px = the layout-map original. 5-page regression
sweep at 1920 clean (no overflow, 0 broken imgs, 0 errors).

## 2026-08-21 — Header link colors (user-driven)

All header links computed black: the link reset `header nav#nav a:any-link
{ color: inherit }` carried an ID, outranking every class-based color rule.
Reset de-ID'd; probe-verified vs original: red-nav white, top-line #414042,
MyChart My=#ea0118/Chart=white span-identical. Learnings: no IDs in reset
selectors.

## 2026-08-21 — POC-completion execution begins (user-driven)

User: delete paolomoz/mdanderson-auto (BLOCKED: gh + GH_PAT lack delete_repo
scope — needs `gh auth refresh -h github.com -s delete_repo`), then execute
POC-COMPLETION.md to the end with faithful replicas as the standing mandate.

Fidelity made mechanical: stardust/scripts/fidelity-gate.mjs (frozen live
snapshot, pixelmatch @1440, PASS = ≤10% + height Δ ≤10%, log
stardust/migration-plan/fidelity-log.tsv) + prime-directive entry in
AGENTS.md § Remember. Homepage regression noted: 10.5% vs POC ref (was ≤4.4%
at gate time) — cascading section offsets, queued for the QA pass.

Shipped (commits c210dd8, + alert commits): blocks table / sticky-cta /
search-results (+ scripts/mindbreeze.js GSP client) / hero department /
callout contact-card + clinical-trials — all values lifted from live
clientlibs; newsletter footer form now live-parity real-submit (tfa_ fields);
scripts/consented.js = target martech (alloy 2.19.2 → prod datastream
9a7a2f87, GA4, interaction-loaded Loyal chat) behind the existing consent
gate, NO ad pixels (HIPAA hold per PLAN §4); header alert band fetched from
/fragments/alert (demo verified on deploy — screenshot
stardust/validation/alert-demo.png — then UNPUBLISHED so gates stay truthful).

Dynamic foundation: config-service query.yaml extended to 4 scoped indexes
(cancerwise / newsroom / cancer-types / clinical-trials; mirror at
stardust/migration-plan/query.yaml). Mindbreeze verified CORS-open for
/search-fis + /search-clinicaltrial from any origin (Origin reflected);
/search2 (site search) 403s from aem.page origins — non-issue at production
cutover (same-origin), POC demo limited. Trials filter:
requiredfields=pagetype:clinical%20trial (2,560 total).

Content: 70 sample pages + 10 trial details crawled into stardust/current
(all captured OK), typed in state.json (82 pages total). PAGE-PRODUCTION.md
is the batch brief. Pilot wave running: brachytherapy (static), walking
article (article + live index check), lung-cancer (disease archetype).

## 2026-08-21 — Article pipeline validated; homepage exonerated

Gate-driven fixes (all code-level, every page of the type inherits): blog
grid geometry to live truth (probed: content col 312/1074, body/rail
508/38/528), rail widgets stretch (margin:0 vs styles.css auto), cards
icon-img≠media guard, callout-row decoupling (feature image spans rows 1-2),
standalone-image 52px offset, loose-list p margins, quote box to live 187h.
Interior template: .section.dark full-width slot, cards rail panel variant
(live blue promo skin), pair-band 47px, rail stacking cascade fix, serif-head
section style. RESULTS: walking 24.55→6.99 PASS, insomnia 22.20→6.42 PASS.

Homepage "regression" was REFERENCE NOISE (fixed utility bar repainted
mid-page in the POC-era screenshot + chat bubble + rotating call-tracking
number) — clean re-freeze: PASS 3.19%. Gate hardened: pins fixed chrome,
hides chat on both sides, gate-dir snapshot precedence.

In flight: brachytherapy re-author (full-width dark band + panel variant),
lung-cancer disease iteration, 10 trial pages generator, 4 cancerwise batch,
newsroom archetype pair.

## 2026-08-21 — Template vocabulary + dynamic listings live

Gate-driven code laws now cover the interior template end-to-end: strip/pair
padding laws, dark-bar flush-after-band law, wrapper double-pad resets,
authorable section styles (serif-head, sans-head, center-head, white, bleed,
half-rail) and variant skins (cards rail panel/teaser/news-links, stats
blue/purple/double, columns top). blog-article and news-article templates
regrouped into independent-flow columns (scripts.js regroupBlogArticle /
regroupNewsArticle) — the shared-row grid could not express live's
short-article behavior. clinical-trial + news-article template layouts live
in styles.css (no anchoring block on those pages).

Dynamic listings are REAL: article-cards `index` mode (config rows,
topic-grouped tabs, composes with editorial rail-tabs) + `news-archive`
block, both verified rendering from the live query-indexes and regression-
checked against the static POC pages. trials-import.mjs regenerated all 10
trial pages (9/10 PASS; 2024-1206 residual = share block +33px vs live).

GATE POLICY for index-driven listing pages: content-set deltas vs live are
JUSTIFIED DEVIATIONS (the index only holds published pages — live lists
thousands); their gates measure LAYOUT parity, attributed per zone.

## 2026-08-21 (evening) — POC-completion: families converged; DA token expired

Family results (fidelity gate, frozen live refs @1440, threshold 10%):
- articles (cancerwise) 6/6 PASS 5.27–6.99 · newsroom 4/4 published PASS
  4.76–9.51 (polo staged, blocked) · departments 5/5 PASS 3.94–7.81 ·
  forms 9/10 PASS 3.17–8.45 (film-on-campus 14.91) · trials 9/10 PASS
  5.31–8.40 (2024-1206 12.61, share-block +33px) · statics 8/9 PASS
  3.17–9.94 (brachytherapy 11.26 marginal, cause pinned) · breast-cancer
  8.89 PASS · landings: index 3.19 + publications 9.37 PASS (rest in
  adoption round) · disease: lung 16.90 + subpages in flight · listing/
  search pages live + index-driven (content-set deviations documented).
Convergence pattern proven 3×: page agents report exact live values →
code laws ship → families flip green (blog regroup, news regroup, interior
spacing family, dept hero scrim/no-scrim).

Lighthouse mobile (?consent=accept): home perf 67 (LCP 6.5s throttled;
CLS 0.001, TBT 10ms — delayed-phase martech clean); rest measuring.

BLOCKED 18:22: DA_TOKEN (24h IMS) expired — admin.da.live + admin.hlx.page
401. Staged, ready to publish on refresh: proton iter-3 (/tmp/ptc-page.html),
polo release (/tmp/polo-page.html). In-flight publishing agents will stall.
Also still pending: gh delete_repo scope for paolomoz/mdanderson-auto.

## 2026-08-21 (close) — Checkpoint: all lanes reported, blocked on DA token

Final tally this session: 68 pages gated / 44 PASS latest-verdict; every page
family has a converged archetype + code laws on main. Staged for token
refresh: /tmp/batch2/RUN-ALL.sh (7 landing pages incl. donors-volunteers
regression fix), stardust/staging/listings-batch/resume.sh (core-facilities +
conferences-seminars), /tmp/ptc-page.html (proton iter-3), /tmp/polo-page.html
(polo release), 4 unpublished disease subpages, education/for-physicians
re-gates (their levers shipped post-gate). Recorded for the next code wave:
promo-band left-split layout, video feature scrim/centered title, stacked
two-column card grid (for-physicians 9.5pts), link-list icon-circle heads,
columns contact centering, article-cards 3-up. Lighthouse mobile w/ martech:
all content types perf 100; home 79 (hero critical chain, POC parity).

## 2026-08-22 — Adoption round: stacked-pair + split-left landed

for-physicians 18.80 → 6.70 PASS (3 iters). The shipped CSS-only
stacked-pair couldn't reproduce live (shared grid rows vs live's two
independent columns, left pitch 240px vs 341px panels; promo-kind left
titles rendered white-on-white) — completed the variant: cards.js wraps
cols 1-3/4-5 into .stack-col.left/.right, left renders via the icon path;
CSS carries live-probed geometry (576px cols, 144px gutter, hairline rules,
35px panel gap). Two more live-truth fixes: hero `tall` was mis-authored
(live is the 450px medium hero) and live has a 140px white row between
hero and band → promo-band `gap-above` variant. Residuals: link-list
icon-circle heads drift (~40px entering EndCancer), call-tracking phone.

education-training 13.62 → 8.71 PASS (1 iter): band re-authored
`promo-band split-left orange` — matches live (info left, image right);
residuals: video-feature scrim/title (recorded), hero image frame.

proton-therapy-center 13.04 FAIL (no authoring lever moves it): EndCancer
section un-tinted (live is white — metric-neutral under pixelmatch),
story-card circles verified live (speechheart red / carepages blue ✓).
Residual causes, live values probed: conditions link-list columns pitch
(live 89px rows, hairlines x312-848/x845-1380; EDS 78px inset), View All
Cancers CTA (live right-aligned in-band w/ arrow; EDS below band),
article-cards grid ~130px shorter than live boxes → duo/FAQ drift
(-173px at duo band, -103px at FAQ rail circle), FAQ head wraps (live
1 line x312; EDS 2 lines x432 w242), video full-size link column, hero
-8px. NOTE: staged /tmp/ptc-page.html (iter-3) is STALE — predates hero
`tall` CSS; applying it would regress the hero by ~110px. Do not publish.

## 2026-08-22 — Original-POC recovery: 4 pages re-adopted under the law regime

The four originals (authored 08-19/20 pre-law, never re-adopted) are green:
breast-center 22.45→6.37 (3 iters, Δh 0.0), about-md-anderson 19.67→8.17
(2 iters), our-locations 11.49→6.51 (2 iters), research 11.42→4.18 (1 iter).
Guards re-gated after every CSS wave: brachytherapy 7.90 (up from 11.26
marginal — the interior link-list column fix also healed it),
institutional-profile 9.94, breast-cancer 8.89 — all unchanged or improved.

Root causes (law vs compensation), all live-probed:
- breast-center: hero mis-kept `compact` (live is the 276px/72px static
  band); video.css landing-teaser p margin:0 leaked into interior pairs
  (live 0 0 18px); tinted 66/70 family stacked on pair pb (live: tinted
  after a PADDED pair is contiguous); pano pb70 + cards pt70 double-stacked
  (live 70 total); link-list 95px-pitch law vs live 30px desc rows + the
  72px landing wrapper/gutter geometry on the interior column; styles.css
  `section > div { margin:auto }` CENTERED narrow pair DCs (x450 vs live
  x312). New levers: pair-DC margin 0, tinted-pair pb70 + head-p 0/ul 18,
  teaser-pair last-p 0, pano→cards pt0, interior link-list.columns wrapper
  reset + 9px gutters, authorable `compact` rows + `Style: flush`.
- about: the help-trio full-width-body lever was RIGHT but live also wants
  it (text AND header) on the resources/visitor trios and the mission
  quick-links rail; trio cols live 419/438 (417 wrapped +27/card);
  image-right promo text cell had its 72px gutter on the wrong side.
- our-locations: EndCancer section was authored tinted — live is WHITE;
  external link-list head stacked section pt70 onto its own 95px; live
  varies PER BAND on plain image-bands (proton 648px img/x792 vs
  laboratory 576px/x720) → authorable `flush` + `media-576` variants +
  27px heads law for plain (non-promo) image bands off-interior.
- research: boxed desc live margin is 24/65 (law said 35, −30); live keeps
  91px between teaser content and the highlights band (pb70 left it 21
  high) — adjacency-scoped margin. Both drifts predate today (present in
  the 00:41 baseline vs the POC-era proto shot; live itself unmoved).

Method note: per-row luminance cross-correlation of live/eds full-page
shots localizes every seam in one pass (offset-vs-y table); computed-style
probes on BOTH sides then name the owning rule before any edit.

## 2026-08-22 — POC-COMPLETION DONE

Final: 90 pages gated · 64 PASS (median 6.44%, best prevention-screening
1.89%) · 26 FAIL = 7 content-set-justified listings + 19 block-gap residuals
(12.6-26.9%, all height-green, causes + live values recorded). All 7
acceptance criteria met (FINAL-REPORT.md). Every original POC page recovered
green after the law waves (breast-center 6.37, about 8.17, our-locations
6.51, research 4.18, brachytherapy healed to 7.90). Disease landings ×4 +
subpages ×6 published + indexed. state.json fully reconciled (79 pages with
gate records). Remaining user item: gh delete_repo scope for
paolomoz/mdanderson-auto.
