# Newsroom press-release archetype (live template `newsarticlepage`)

Established 2026-08-21 on two releases; 2,190 pages ride this at full
migration. Read with PAGE-PRODUCTION.md. **Status: composition + metadata
contract validated end-to-end (publish, index); pixel gate BLOCKED on a
code-level template gap (no `news-article` layout CSS exists) — see §4.
Do NOT iterate authoring past this; the gap closes in code, once.**

## 1. Validated pages

| Live path | DA / EDS path | Gate (pixel, height Δ) |
|---|---|---|
| `/newsroom/-patients-with-heart-disease-may-be-at-increased-risk-for-advanc.h00-159703068.html` | `/newsroom/patients-with-heart-disease-may-be-at-increased-risk-for-advanc` | 47.40%→32.33% over 3 iters; height +43.4%→+20.8% (FAIL, cause §4) |
| `/newsroom/---md-anderson-s-institute-for-data-science-in-oncology-establis.h00-159698334.html` | `/newsroom/md-anderson-s-institute-for-data-science-in-oncology-establis` | 19.81%, height +3.1%, 1 iter (FAIL pixel, cause §4) |

Slug rule: live basename minus `.h00-…` suffix minus leading dashes.
Gate MUST get the EDS path explicitly:
`node stardust/scripts/fidelity-gate.mjs "<livePath>" "<edsPath>"`.

## 2. Composition (DA source, section order)

Differs from the cancerwise `blog-article`: NO topics section-nav, NO
article-header/byline blocks, NO rail promos/newsletter; head is plain
default content; sidebar is the media-specialist contact card (+ optional
media). Sections:

1. **metadata** block — see §3.
2. **breadcrumbs** — one row, one cell:
   `<p><a href="/newsroom">UT MD Anderson Newsroom</a> <a href="/newsroom/{yyyy}">{yyyy}</a>
   <a href="https://www.mdanderson.org/newsroom/{yyyy}/{mm}.html">{mm}</a> {H1 title}</p>`
   (year page is in inventory → EDS path; month page is not → absolute URL).
3. **share** — empty block `<div class="share"></div>` (template-slotted,
   zero rows; live `.social-share-modal` strip).
4. **Article section** (single section; order matters — it is the future
   grid's row plan):
   - `<h1>` verbatim (live `.article-body h1`)
   - subtitle `<p>` verbatim (live `.article-subtitle`)
   - date `<p>`: `UT MD Anderson News Release {Month DD, YYYY}` (live
     `p.article-date`; whitespace-collapsed one line)
   - `callout contact-card` — one row/cell: `<h3>Media Specialist Contact</h3>`
     + `<p>` name + `<p>` specialist tel/email links (`<br>`-separated) +
     `<p>` office name + `<p>` office tel / PublicRelations mailto /
     `<a href="http://x.com/@MDAndersonNews">@MDAndersonNews</a>` (block emits
     the X icon + linkout affordance)
   - body paragraphs/lists **verbatim** from live `.article-body` (keep the
     one-item-per-`<ul>` council-list quirk, `&nbsp;`, `<u>`, `<em>`)
   - trailing standalone body image, plain `<p><img></p>` (live
     `.bcm-standalone-image` at the end of `.article-body`)
   - optional sidebar media (live `.col-sidebar .media-image` + caption) as
     `callout media` — one row/cell: `<p><img></p>` + caption `<p>`.
     `media` is an UNSTYLED variant today (renders as base callout); it is
     the rail-placement hook for the §4 CSS (rail = all `.callout-wrapper`s).
5. **Help #EndCancer** — copy VERBATIM from the insomnia exemplar
   (`<h2>Help #EndCancer</h2>` + `cards promo closing` 3 cards +
   `section-metadata` style `tinted`). Identical band on live newsroom
   (`.pre-footer section.highlight`, padding 70px 72px, h2 48px centered).
   No trailing newsletter section (newsroom's subscribe strip is part of the
   global footer block).

## 3. Metadata contract

```
Title        <live <title> verbatim, incl. " | UT MD Anderson">
Description  <live meta description verbatim — keep U+202F etc.>
Template     news-article
Publishdate  yyyy-mm-dd            (from the article-date line)
Releasetype  press-release | research-highlight
Image        https://content.da.live/paolomoz/mdanderson/media/newsroom/<name>.jpg
```

- `Releasetype`: date line "UT MD Anderson News Release" → `press-release`;
  "MD Anderson Research Highlights…" digest pages → `research-highlight`.
- Indexed by `/newsroom/query-index.json` (config-service `newsroom-releases`:
  title, description, publishdate, releasetype, image). Verify the row
  appears after publish. Both archetype pages confirmed present.
- Template is `news-article` ONLY. Do not add `interior` — its layout CSS
  lives in `blocks/section-nav/section-nav.css` and never loads without a
  section-nav block, and it would misfire later on pages carrying
  interior-scoped blocks (accordion, article-cards).

## 4. CODE-LEVEL GAP — `news-article` template layout CSS (blocks the gate)

No stylesheet implements the newsroom two-column page grid, and the existing
two-column machinery cannot be borrowed: `body.interior` / `body.blog-article`
grids live in `blocks/section-nav/section-nav.css`, which loads only when a
section-nav block is on the page (newsroom has none), and their splits key
off rail widths (358 / 528px) that are not the newsroom's 408px. Result
without the CSS: contact card renders as a full-width gray band and sidebar
media stacks below the body — the entire residual on both gated pages.

Live truth @1440 (probed 2026-08-21 on the heart-disease page; selector →
value):

- `.page` grid: `.col-content.alternate-content` x0 w960
  (padding 0 18px 0 36px); `.col-sidebar.publication-sidebar.alternate-sidebar`
  x960 w480 (padding 70px 72px 0 0) → rail boxes w408 at x960.
- `.article-body` x72 w834 (so: 72 | body 834 | gap 54 | rail 408 | 72).
- `.article-body h1`: Minion 36px/46.8, margin 0, padding-bottom 24.12px.
- `.article-subtitle`: Minion 18px/23.4, padding 18px 0.
- `p.article-date`: Univers 45 Light 14px/18.2, margin 14px 0.
- body `p`: Minion 18px/23.4 #000; `p a` #da291c underline.
- `.article-body` standalone image: width 834 (100% of body column).
- `.article-sidebar` (contact card): already 1:1 in
  `blocks/callout/callout.css` `contact-card` — bg #f2f3f4, padding 2em,
  Univers 16px/1.3, h3 Univers Bold 24px. Correct once placed in the rail.
- `.col-sidebar .media-image img`: w408; `.media-caption`: Univers 16px/20.8,
  margin-top 22px, padding-right 30px, left-aligned.
- Breadcrumbs strip `.blog-breadcrumbs`: h63, padding 22px 25px.
- Share strip `.social-share-modal`: h70, padding 20px 72px 10px (share
  block matches heights; sits at x0 instead of live x72 without the template).

Suggested shape (NOT shipped — blocks are report-only for page agents):
```css
@media (width >= 992px) {
  body.news-article main .section:has(> .callout-wrapper) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 408px;
    column-gap: 54px;
    padding: 0 72px;
  }
  body.news-article main .section:has(> .callout-wrapper) > .default-content-wrapper { grid-column: 1; }
  body.news-article main .section:has(> .callout-wrapper) > .callout-wrapper { grid-column: 2; }
  /* first callout (contact card): margin-top 70px; date p: Univers Light 14px;
     row plan: DC(head) r1c1, contact r1c2, DC(body) r2c1, media callout r2c2 */
}
```

## 5. Media

- Upload under `/media/newsroom/<descriptive-name>.jpg` (never hotlink;
  live adaptive-image URLs 301 to a `.dir.jpg` variant — use `curl -L`).
- **Until §4 ships, pre-size uploads to the live DISPLAY width** (body
  images 834px, sidebar media 408px) — images render at intrinsic width in
  the unstyled flow, and full-res uploads blow the height gate (heart-disease
  iter-1 was +43% page height from a 1444×2166 portrait). Once §4 ships,
  the column caps them and originals can be re-uploaded.
- Uploaded so far: `heart-disease-jama-study.jpg` (834×450),
  `kevin-nead.jpg` (408×612), `idso-advisory-council.jpg` (834×469).

## 6. Links

Standard PAGE-PRODUCTION rules. Seen on these pages: `/newsroom.html` and
`/newsroom/{yyyy}.html` are in inventory (rewrite); month archives, other
`.h00-` releases, `/research/departments-labs-institutes/**` and
`faculty.mdanderson.org` profiles are not (keep absolute).
