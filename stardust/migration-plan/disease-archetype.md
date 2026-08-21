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
10. **Body prose + rail** — ONE section, alternating wrappers; CSS grid pairs them row-by-row (DC col 1, cards col 2): DC chunk A (first ~2 H2 topics) / `cards rail arrow` (US News badge: img + h3 + arrow link) / DC chunk B / `cards rail arrow` (blog teaser) / DC chunk C / teaser / DC chunk D / teaser. Teasers carry the FULL live anatomy (2026-08-21 final round — the rail-wrapper padding reset shipped, cards render 358px): `<p><img teaser></p><h3><a href=article>Title</a></h3><p>snippet…</p><p><a href=article>Read more</a></p>`. Snippet = the VISIBLE truncated text from the frozen live reference, ending in "..." (read it off the rail crop of live.png — live line-clamps the summary; we author the clamp result). Lung truth: quit-smoking = "Smoking is on the decline. But if you are one of the 28 million Americans still smoking, you probably know how hard it is to..."; lung-nodules = "Lung nodules — or pulmonary nodules — are small growths that can develop in the lungs. By definition, they are no larger than 3 cm, or..."; lobectomy = "A lobectomy is the surgical removal of one of the five lobes — or main sections — of the lungs. It is the most common type of...". The h3 MUST wrap the title link (a lone `<p><a>` is classified as the card CTA and would displace "Read more"). Balance chunks so prose height ≥ card height per row (see Residuals: EDS teaser cards run ~180–280px taller than live, so rows 2–4 are card-bound regardless — chunk-rebalance math gains nothing at paragraph granularity).
11. **Podcast section** — remaining prose (must NOT start with an h2 — a `.podcast-container` first-DC h2 becomes the 48px centered band head) + `podcast rail`: kicker row "Featured Podcast:", then one row per episode (h3 + episode link + doctorpodcasting transcript link).
12. Anatomy band — DC `<h2>` + two `columns` blocks (each: one row, two cells of img + caption `<p>`; block 1 = stages I|III, block 2 = II|IV) + `Style: tinted, serif-head, center-head` (live h2 is a centered Minion band title; `center-head` shipped 2026-08-21 and composes with serif-head).
13. Diagnosis & Treatment — DC `<h2>` + section-metadata `Style: serif-head, white` + `accordion` (rows: Diagnosis | rich cell, Treatment | rich cell). First panel opens by default = live t=0. Live band is WHITE — the `white` section style (shipped 2026-08-21) overrides the accordion-container gray.
14. FAQ — DC `<h2>` + section-metadata `Style: serif-head` + `accordion` (7 Q rows). First panel open = live parity. Live FAQ band IS gray, so the accordion-container gray matches here — NO `white` on this one.
15. Why-choose — DC prose (h2 + paragraphs + ul) + `quote rail` (one row: [name p, role p | quote p]) + section-metadata `Style: white` (live band is white; quote-container CSS would paint it gray).
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

FIXED by the 2026-08-21 code round (no longer author around them): rail
cards-wrapper padding reset (cards render 358px — full teaser anatomy is now
the canonical authoring, §10); pair-band 47px padding wins its cascade;
`white` and `center-head` section styles; dark appointment band text renders
live white 21px.

Remaining (all block-CSS level; live values probed @1440, 2026-08-21):
- Blog-teaser card SKIN. Live card: 358px box, `border: 1px solid #d0d0ce`
  all round, 19px inner padding; title = Minion Semi Bold 24px/31.2 LEFT
  black (320px text column, 2 lines); snippet 18px/23.4 left; "Read more"
  18px #da291c left with arrow. EDS `cards rail arrow` renders: no box
  border, 42px side padding (274px text column), title 36px CENTERED serif
  (link inherits red #da291c vs live black), snippet 21px centered, CTA
  centered. Net card heights 635/748/627 vs live 451/467/412 (+184/+281/+215)
  → grid rows 2–4 are card-bound and the body+podcast zone runs +586px
  (live 878→4102 vs EDS 878→4688), which offsets every band below. Needs a
  `teaser` skin on `cards rail` (or live's blog-summary values on rail cards
  whose title is a link).
- Anatomy band +188px (live section 1146×1188, pad 70px 36px; images
  527×395 at x=312/858, row 2 starts 99px below row 1 images incl. caption).
  EDS renders the two columns-wrappers with a much larger inter-block gap and
  narrower images on the gray ground (live paints the inner content on the
  content column with tighter rhythm).
- Why-choose −172px (EDS SHORTER): live is a 50/50 `col-double` split —
  prose column 528px wide (h=843) + quote column 537px; the EDS pair grid is
  minmax(0,1fr)/358px → 716px prose → fewer wrapped lines → band 834 vs
  live 1005.
- Icon trio +222px: live `.highlight.apply` band is 462px total (padding
  70px 36px, panels 346×295, `.promo-simple` padding 0). EDS band 684px —
  panel stack ~544px (icon circle + 36px title + body + CTA spacing).
- Featured Articles + duo band +126px, D&T accordion +104px, FAQ +56px,
  locations −28px — block padding / open-panel line-wrap deltas.
- Prose line-wrap drifts slightly vs live (Minion/Univers fallback metrics) —
  low-level red throughout the two-col body.

Gate (2026-08-21, frozen-live ref, FINAL authoring round): pixel 18.85% /
height Δ 7.6% (14158 vs 13075) — FAIL on pixel, PASS on height. Round path:
22.28%/4.5 (teaser fallback) → 18.85%/7.6 (full teaser anatomy + white +
center-head, single publish). Per-band height deltas: body+podcast +586,
anatomy +188, D&T +104, FAQ +56, why-choose −172, locations −28,
featured+duo +126, icon trio +222, EndCancer/newsletter ±2 (Σ=+1083).
Top chrome through byline/lede aligns ±4px; ALL remaining pixel is the
teaser-skin offset cascade + the band deltas above — nothing further is
authorable (chunk rebalancing is provably non-improving, §10).
