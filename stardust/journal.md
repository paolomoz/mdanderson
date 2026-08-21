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
