# disease archetype — /cancer-types/lung-cancer (landing flavor)

Fork this composition exactly for the other cancer-types pages. DA source:
`https://admin.da.live/source/paolomoz/mdanderson/cancer-types/<slug>.html`.
Media under `/media/<slug>/…` (hero.jpg, usnews-badge.jpg, teaser-*.jpg,
anatomy-*.jpg, article-*.jpg). Every value comes from the capture / live page.

## Metadata contract (first section, `metadata` block)

| key | value |
|---|---|
| Title / Description | verbatim live |
| Template | `disease` |
| Theme | `interior` — REQUIRED: aem.js maps Theme→body class; all interior layout CSS is scoped to `body.interior` (sidebar grid, prose+rail pairs). Template alone gives only `body.disease`. |
| Cancertype | slug, e.g. `lung-cancer` |
| Pagekind | `landing` \| `treatment` \| `symptoms` \| `diagnosis` |
| Reviewer / Reviewdate | from live medical-reviewer line (yyyy-mm-dd) |
| Image | DA media hero URL |

Indexed at `/cancer-types/query-index.json` (path/title/description/cancertype/pagekind).

## Section order (one `<div>` per section)

1. `metadata` block.
2. `hero static` — `<p><img hero></p><h1>Name</h1>` (live bg 1400x282 rendition). Do NOT use `compact`: the live disease hero is the full title band — 276px, 50% black scrim, 72px Minion title — which is exactly `hero static` (non-compact). `compact` (220px band, 48px title, no scrim) ran ~56px short and left every band below misaligned (2026-08-21 gate fix, −56px top drift).
3. Appointment band — default content `<p><strong>…</strong> <a>…</a></p>` + section-metadata `Style: dark`. Use the state the frozen gate snapshot will show: Houston after-hours = "**Let's get started.** Request an appointment online."; business hours = "**We're here for you.** Call us at <tel> or request an appointment online." Tel = live call-tracking number (nondeterministic; use captured).
4. `sticky-cta` — one link per row: tel "Call", appointment URL "Request appointment", `https://my.mdanderson.org` "MyChart" (live has all three). Mobile-only (≤752px), zero height at 1440.
5. `breadcrumbs` — `Diagnosis & Treatment / Cancer Types / <Name>` (first two as links).
6. `section-nav` — rows: [jump-label "Learn more about <Name>"], [Back → cancer-types.html], [nested `<ul>` page + child pages], [clinical-trials box: p + View Clinical Trials search link `?searchType=clinical%20trials&q=<Name>`]. Skip empty live nav items (lung had a blank "facts" li).
7. `share` (empty block).
8. `byline` — row 1: reviewer profile links; row 2: date text as shown live ("July 02, 2026" → block prefixes "on").
9. Lede — intro paragraph as default content + `Style: lede` (drop cap).
10. **Body prose + rail** — ONE section, alternating wrappers; CSS grid pairs them row-by-row (DC col 1, cards col 2): DC chunk A (first ~2 H2 topics) / `cards rail arrow` (US News badge: img + h3 + arrow link) / DC chunk B / `cards rail teaser arrow` (blog teaser) / DC chunk C / teaser / DC chunk D / teaser. Blog teasers use `rail teaser arrow` (2026-08-21 authoring round 2): `teaser` = the live blog-summary skin (358px bordered box, 19px pad, Minion SemiBold 24 left title, 18px snippet, red left Read more); KEEP `arrow` too — the decorator only appends the red `mdicon-arrow` glyph to the CTA when the block carries `arrow` (without it the CTA classifies as `cta-block`, no arrow). Teasers carry the FULL live anatomy: `<p><img teaser></p><h3><a href=article>Title</a></h3><p>snippet…</p><p><a href=article>Read more</a></p>`. Snippet = the VISIBLE truncated text from the frozen live reference, ending in "..." (read it off the rail crop of live.png — live line-clamps the summary; we author the clamp result). Lung truth: quit-smoking = "Smoking is on the decline. But if you are one of the 28 million Americans still smoking, you probably know how hard it is to..."; lung-nodules = "Lung nodules — or pulmonary nodules — are small growths that can develop in the lungs. By definition, they are no larger than 3 cm, or..."; lobectomy = "A lobectomy is the surgical removal of one of the five lobes — or main sections — of the lungs. It is the most common type of...". The h3 MUST wrap the title link (a lone `<p><a>` is classified as the card CTA and would displace "Read more"). Balance chunks so prose height ≥ card height per row (see Residuals: EDS teaser cards run ~180–280px taller than live, so rows 2–4 are card-bound regardless — chunk-rebalance math gains nothing at paragraph granularity).
11. **Podcast section** — remaining prose (must NOT start with an h2 — a `.podcast-container` first-DC h2 becomes the 48px centered band head) + `podcast rail`: kicker row "Featured Podcast:", then one row per episode (h3 + episode link + doctorpodcasting transcript link).
12. Anatomy band — DC `<h2>` + two `columns` blocks (each: one row, two cells of img + caption `<p>`; block 1 = stages I|III, block 2 = II|IV) + `Style: tinted, serif-head, center-head` (live h2 is a centered Minion band title; `center-head` shipped 2026-08-21 and composes with serif-head).
13. Diagnosis & Treatment — DC `<h2>` + section-metadata `Style: serif-head, white` + `accordion` (rows: Diagnosis | rich cell, Treatment | rich cell). First panel opens by default = live t=0. Live band is WHITE — the `white` section style (shipped 2026-08-21) overrides the accordion-container gray.
14. FAQ — DC `<h2>` + section-metadata `Style: serif-head` + `accordion` (7 Q rows). First panel open = live parity. Live FAQ band IS gray, so the accordion-container gray matches here — NO `white` on this one.
15. Why-choose — DC prose (h2 + paragraphs + ul) + `quote rail` (one row: [name p, role p | quote p]) + section-metadata `Style: white, half-rail` (live band is white; quote-container CSS would paint it gray; `half-rail` = live col-double 50/50 split — prose col 528px — the default minmax(0,1fr)/358px grid ran the band −172px short).
16. Treatment locations — `link-list icon-head`: head row `<h3>Treatment at UT MD Anderson</h3><p>subtext</p>`, then one link row per location; + `cards rail` with facility photo, caption authored as a link (a media-only card row is dropped by the cards classifier — heading or CTA required) + `Style: tinted`. Grid puts list col 1, photo col 2.
17. Featured Articles — DC `<h2>Featured Articles</h2>` + `article-cards grid`, one row per captured article `[img | h3>a title]` (author ALL, block shows 2 + View more). Truncated titles: use the capture heading text verbatim (e.g. "…‘Go straight to...").
18. `cards promo duo arrow trials` — Clinical Trials (`:clinical-trials:`) + Becoming Our Patient (`:carepages:`). NO tinted (lung live band is white; breast used tinted — check your capture).
19. `cards icon trio arrow pathways tinted` — myCancerConnection / Prevention & Screening / Counseling (tinted: live band is gray).
20. EndCancer — DC `<h2>Help #EndCancer</h2>` + `cards promo closing` (3 rows). NO tinted on lung live.
21. `newsletter cancerwise`.

Sections 20–21 MUST be the last two (interior CSS spans only `:nth-last-child(-n+2)` full-width).

## Links / media rules
- Inventory pages (sample-paths.txt + 12 POC) → EDS path (strip `.html`); other same-origin → absolute `https://www.mdanderson.org/...`; external unchanged.
- AEM `jcr:content` image URLs 301 to `.dir.jpg` renditions — `curl -L`.
- Validate the assembled source: every section `<div>` must be div-balanced (one stray `</div>` inside an accordion cell silently eats all later sections).

## Known residuals (block gaps — report, do not hot-fix)

FIXED by the 2026-08-21 code rounds (no longer author around them): rail
cards-wrapper padding reset; pair-band 47px padding; `white` / `center-head`
section styles; dark appointment band text; `cards rail teaser` skin (§10);
`half-rail` section style (§15 — why-choose was −172, now +15); interior
spacing family (h1 48/40, tinted/accordion 70px padding — anatomy band was
+188, now +17); promo duo band now matches live exactly (508/508); icon trio
panel padding (was +222, now +55). The lung source carries NO spacer
compensations — none were ever needed after these.

Remaining (all block-CSS level; live values RE-PROBED FRESH on
www.mdanderson.org @1440, 2026-08-21 evening):
- Teaser card interior rhythm (+32/+62/+32). Live blog-summary: 358×451/
  467/412, img 356×200 INSIDE the 1px #d0d0ce box, pad 0 on the box, title
  column 320px. EDS `rail teaser arrow`: 483/529/444 — skin values (border,
  19px pad, Minion SemiBold 24 left, 18px snippet, red arrow CTA) all match,
  but `.promo-header` keeps `padding: 0 42px; margin-top: 35px` → 274px
  title column (extra wraps + visible left indent vs the snippet) and the
  image renders in `.card-media` OUTSIDE the bordered promo. Body+podcast
  zone net +180 (live 878→4102, EDS ends 4282).
- Inter-band 66px margins (+~264 total). Live lung tinted/accordion bands
  are CONTIGUOUS — anatomy 4102→5290, D&T 5291→7186, FAQ 7186→8074,
  why-choose 8074→9079, locations 9079→9899 (breathing room is the 70px 36px
  padding INSIDE each band). The interior spacing family
  (section-nav.css:1378) adds `margin-top: 66px` unconditionally at 4 lung
  junctions (body→anatomy 67, anatomy→D&T, D&T→FAQ, why→locations). Correct
  on batch-2 pages where the band follows prose; overshoot when band
  follows band.
- Anatomy band height FIXED (+17: live 1188 vs EDS 1205) but right-column
  images mismatch: EDS 465×349 at x=921 vs live 528×396 at x=858 (left col
  correct: 537×403@312 vs live 527×395@312) — columns block sizes col 2
  narrower. Live row 2 starts 99px below row-1 images (incl caption); EDS
  wrappers stack flush (0 gap) — height washes out, pixels don't.
- D&T accordion +104 (live 1895 vs 1999), FAQ +56 (live 888 vs 944) —
  open-panel line-wrap/padding.
- Locations −26 (live 820 vs 794); Featured Articles −47 (live zone ~723,
  cards 494×417 at y=10040 vs EDS 676); icon trio +55 (live 462, panels
  346×295 vs EDS 517, panels 343×331/377/331 — promo pad 0 now matches);
  EndCancer +2 (583/585).
- Prose line-wrap drift (Minion/Univers fallback metrics): body-rail zone
  15.5% red; EDS row-1 prose chunk 760 vs live 628.

Gate (2026-08-21, frozen-live ref, authoring round after teaser/half-rail/
spacing code ship): baseline 21.32%/Δh 5.6 → R1 (`rail teaser` ×3 +
`half-rail`) 22.27%/4.5 → R2 (`rail teaser arrow`) 22.53%/4.1 (13632 vs
13075, Σ=+557) — FAIL pixel, PASS height. Pixel RISES as height converges:
the old −172 why-choose error partially re-synced the tail with live;
correct structure leaves a monotone +cumulative offset (~+550 by locations)
that paints every tail band red (band profile: locations 27%, articles 45%,
duo 47%, trio 63%, closing 66%; chrome 4.2%, podcast 4.9%, D&T 5.6%,
FAQ 4.8% — bands that happen to align are clean). Nothing further is
authorable — every remaining delta above is block CSS; chunk rebalancing
remains non-improving (row slack 16–50px < paragraph granularity).
