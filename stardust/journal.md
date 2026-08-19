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
