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
2. `hero static compact` — `<p><img hero></p><h1>Name</h1>` (live bg 1400x282 rendition; band 220px).
3. Appointment band — default content `<p><strong>…</strong> <a>…</a></p>` + section-metadata `Style: dark`. Use the state the frozen gate snapshot will show: Houston after-hours = "**Let's get started.** Request an appointment online."; business hours = "**We're here for you.** Call us at <tel> or request an appointment online." Tel = live call-tracking number (nondeterministic; use captured).
4. `sticky-cta` — one link per row: tel "Call", appointment URL "Request appointment", `https://my.mdanderson.org` "MyChart" (live has all three). Mobile-only (≤752px), zero height at 1440.
5. `breadcrumbs` — `Diagnosis & Treatment / Cancer Types / <Name>` (first two as links).
6. `section-nav` — rows: [jump-label "Learn more about <Name>"], [Back → cancer-types.html], [nested `<ul>` page + child pages], [clinical-trials box: p + View Clinical Trials search link `?searchType=clinical%20trials&q=<Name>`]. Skip empty live nav items (lung had a blank "facts" li).
7. `share` (empty block).
8. `byline` — row 1: reviewer profile links; row 2: date text as shown live ("July 02, 2026" → block prefixes "on").
9. Lede — intro paragraph as default content + `Style: lede` (drop cap).
10. **Body prose + rail** — ONE section, alternating wrappers; CSS grid pairs them row-by-row (DC col 1, cards col 2): DC chunk A (first ~2 H2 topics) / `cards rail arrow` (US News badge: img + h3 + arrow link) / DC chunk B / `cards rail arrow` (blog teaser) / DC chunk C / teaser / DC chunk D / teaser. Teasers are authored `<p><img></p><p><a href=article>Title</a></p>` — see Residuals. Balance chunks so prose height ≥ card height per row.
11. **Podcast section** — remaining prose (must NOT start with an h2 — a `.podcast-container` first-DC h2 becomes the 48px centered band head) + `podcast rail`: kicker row "Featured Podcast:", then one row per episode (h3 + episode link + doctorpodcasting transcript link).
12. Anatomy band — DC `<h2>` + two `columns` blocks (each: one row, two cells of img + caption `<p>`; block 1 = stages I|III, block 2 = II|IV) + `Style: tinted`.
13. Diagnosis & Treatment — DC `<h2>` + `accordion` (rows: Diagnosis | rich cell, Treatment | rich cell). First panel opens by default = live t=0.
14. FAQ — DC `<h2>` + `accordion` (7 Q rows). First panel open = live parity.
15. Why-choose — DC prose (h2 + paragraphs + ul) + `quote rail` (one row: [name p, role p | quote p]).
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
- `cards rail` cards render at min-content width (~221px, not 358px): `.cards .table.cards-table{display:flex}` (cards.css) out-cascades `.cards.rail .cards-table{display:block}` (section-nav.css, equal specificity, loads earlier). Same on breast-cancer archetype. Teaser snippets + 36px h3 titles balloon card height — hence the image+title-link teaser authoring (title text kept as the card CTA; live's bold title + snippet + "Read more" not reproducible at parity).
- Interior 70px section padding + taller duo/trio promo panels accumulate ~+500px vertical drift by the pre-footer → tail pixel diff. Height Δ stays <5%.
- `quote-container`/`accordion-container` force the gray surface; lung live why-choose and Diagnosis & Treatment bands are white (13 gray levels — below gate threshold).
- Big serif band titles (Diagnosis & Treatment / FAQ / anatomy, 42px Minion live) render 27px sans-bold (interior DC h2 rule).
- Header+hero chrome stack ~60px shorter than live (header fragment, global).

Gate (2026-08-21, frozen-live ref): pixel 24.68% / height Δ 4.3% — FAIL on pixel after 3 iterations (17.79%/16.7 → 20.54%/8.3 → 24.68%/4.3); causes above.
