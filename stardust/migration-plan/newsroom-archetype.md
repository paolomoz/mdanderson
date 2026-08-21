# Newsroom press-release archetype (live template `newsarticlepage`)

Established 2026-08-21 on two releases; 2,190 pages ride this at full
migration. Read with PAGE-PRODUCTION.md. **Status: CONVERGED 2026-08-21 —
both pages PASS the pixel gate at the POC quality floor: IDSO 4.76% (Δh
0.1%), heart-disease 5.09% (Δh 0.1%). The §4b levers shipped in two code
iterations (commits e028c12, 840d440) plus two DA content corrections and
the trailing `newsletter cancerwise` section (§2 item 5, now REQUIRED).
Residual is text antialiasing noise + global-footer content diffs (both
out of template scope). §4b below is kept as the implementation record —
every lever landed; the root causes are annotated for the migration of the
remaining 2,188 pages.**

## 1. Validated pages

| Live path | DA / EDS path | Gate (pixel, height Δ) |
|---|---|---|
| `/newsroom/-patients-with-heart-disease-may-be-at-increased-risk-for-advanc.h00-159703068.html` | `/newsroom/patients-with-heart-disease-may-be-at-increased-risk-for-advanc` | **PASS 5.09%, Δ 0.1%** (was 32.33% pre-§4, 16.03% pre-§4b; iteration 1 → 8.23%, iteration 2 → 5.09%) |
| `/newsroom/---md-anderson-s-institute-for-data-science-in-oncology-establis.h00-159698334.html` | `/newsroom/md-anderson-s-institute-for-data-science-in-oncology-establis` | **PASS 4.76%, Δ 0.1%** (was 19.81% pre-§4, 10.54% pre-§4b; iteration 1 → 7.58%, iteration 2 → 4.76%) |

Polish-round evidence (2026-08-21, do not re-try): (a) adding the live
footer's newsletter strip as a trailing `newsletter cancerwise` section
MISALIGNS while §4b offsets are open — HD 20.53→24.47%, reverted; author it
only together with the §4b fixes. (b) moving the contact-card callout after
the body (merging head+body into one wrapper) only flips the body offset
sign (+205px → −28px drifting to −126px via the §4b paragraph-margin drift)
— IDSO 14.52→18.79% net worse with (a), reverted to canonical §2 order.
(c) the `tinted` band removal (§2 item 5 correction) is pixelmatch-neutral
(242-vs-255 gray is below the 0.1 threshold) but is live truth — kept.

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
   (`<h2>Help #EndCancer</h2>` + `cards promo closing` 3 cards) but with
   **NO `section-metadata` / NO `tinted` style** — CORRECTED 2026-08-21:
   the live newsroom band background is WHITE `rgb(255,255,255)` (pixel-
   sampled on both gated pages), unlike cancerwise's gray. Live band:
   `.pre-footer section.highlight` padding 70px 72px, h2 48px/48px centered
   margin -4px 0 50px.
6. **Trailing newsletter section — REQUIRED (shipped 2026-08-21 with §4b).**
   Live newsroom's footer starts with the black h90 "Subscribe to our
   Cancerwise newsletter" strip; the EDS global footer does not render it,
   but the footer's link columns own a 65px top margin — so authoring the
   trailing section reproduces live's pipeline EXACTLY (live: main-end +
   90px strip + 65 + columns; EDS: main-end + 90px section + 65 + columns).
   Markup (verbatim, own section at the end of main):
   `<div><div class="newsletter cancerwise"><div><div><p>Subscribe to our
   Cancerwise newsletter</p></div></div></div></div>`

Content quirks that are GEOMETRY (learned on the gated pages, 2026-08-21):

- **Never merge adjacent one-item `<ul>`s.** Live's per-entry 18px gap comes
  from `<p>`-in-`<li>` margins / separate one-item uls; the import had merged
  two pairs (McAllister+Nead, Qian+Rodon) into shared uls, losing 2×18px and
  the per-entry rhythm. Split them — consecutive separate `<ul>`s survive the
  DA→plain.html pipeline and collapse to the same 18px gap.
- **Contact card empty specialist-tel line.** Live cards carry
  `<a href="tel:"></a><br>` before the specialist email — one empty 20.8px
  line (card h329, not 308). Author `<p><br><a mailto…>` (a leading bare
  `<br>` alone gets stripped by the pipeline; `&nbsp;<br>` survives as
  `<br>`).

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

## 4b. SHIPPED CODE LEVERS (all landed 2026-08-21; kept as the record)

Levers 1–4 of the original list (rail flow via `regroupNewsArticle()` in
scripts.js nesting callout-wrappers into `.news-rail` / rest into
`.news-col`; subtitle; date; body rhythm) shipped first and moved the gates
to 10.54% / 16.03%. The final convergence (commits e028c12 + 840d440 +
the §2 content quirks) found FIVE root causes the first round missed —
all verified by landmark probes @1440 against live before shipping:

1. **Share strip doubled its padding (+30px on EVERYTHING below).** The
   share block ships `padding: 20px 0 10px` of its own; the template rule
   put the same 20/10 on `.share-wrapper` → h100 vs live 70, pushing h1 to
   y387 vs live 358. Fix: wrapper keeps `20px 72px 10px`, inner
   `.share { padding: 0 }`.
2. **Specificity traps in the first lever round.** `main h1 + p` (0,1,4)
   and `main h1 + p + p` (0,1,5) LOSE to `.news-col p` (0,2,2) — the
   subtitle kept 18px margins and the date stayed 18px/m18. Anchor them to
   `.news-col` (0,2,3 / 0,2,4). Likewise the rail's `margin-top: 70px`
   lever lost to the grid's wrapper reset (0,3,5) — the contact card sat at
   the grid top (y387 vs live 428); needs `> .news-rail > div.callout-wrapper`
   (0,4,3). Also zero `.callout-inner`'s base `margin: 0 0 30px` in the
   rail (live card→media gap is exactly 70).
3. **`callout media` skin lives on `.callout-inner`,** not the block: the
   old block-level reset left the base 30px flex padding (img 318×477 at
   x990 vs live 408×612 at x960) and the caption margin hit the img's `<p>`
   too. Shipped: inner display block/padding 0, body 16px, `p { margin: 0 }`,
   caption = `p:not(:has(img))` Univers 16/1.3 mt22 pr30.
4. **Live underlines every `.article-body a`** (not just `<u>` spans); EDS
   only underlines on hover. `body.news-article .news-col a:any-link
   { text-decoration: underline }`.
5. **#EndCancer band is NOT the cancerwise skin:** live newsroom `.promo`
   cards pad 60px top / **35px** bottom (not 60/60) and the CTA linkout
   icon rides a 24px line box (not 31.2) → card 325 vs EDS 351; the +26
   shifted strip + footer on both pages. Scoped:
   `body.news-article .cards.promo .promo { padding-bottom: 35px }` +
   `.cta .mda-icon-linkout { line-height: 24px }`.
6. **Standalone image flush:** live `.article-body` ends flush against the
   pre-footer; EDS wraps the trailing image in a p with 18px margin-bottom
   → zeroed via `.news-col > div:last-child > p:last-child:has(img)`.

The other two offsets were CONTENT, not code — see the §2 quirks (merged
one-item uls: 2×18px; contact-card empty tel line: 21px).

Post-ship floor: 4.76% / 5.09%, height Δ 0.1% both. Remaining residual is
text antialiasing smear (same 5–7% floor as the passing cancerwise pages)
and global-footer link-column content differences — neither is
template-scoped.

## 4. SHIPPED — `news-article` template layout CSS (2026-08-21, styles.css)

Shipped as `body.news-article main > .section:has(> .callout-wrapper)` grid
(834/54/408, head r1c1 / contact r1c2 +70px / body r2c1 / media r2c2) in
styles.css — height gates now pass. Known limitation → §4b lever 1 (row 1
sizes to the contact card). Original live-truth record kept below for the
§4b implementation:

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

Shipped shape (styles.css lines ~632–691; §4b lever 1 amends the row plan):
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
- Body-column images: the §4 grid now caps them at 834px, so ORIGINALS may
  replace pre-sized uploads (current 834-wide uploads render 1:1 with live —
  verified, no action needed on the two gated pages). Sidebar media renders
  at the full 408px since §4b lever 3 shipped (2026-08-21) — pre-sizing to
  408 is still fine but no longer load-bearing.
- Uploaded so far: `heart-disease-jama-study.jpg` (834×450),
  `kevin-nead.jpg` (408×612), `idso-advisory-council.jpg` (834×469).

## 6. Links

Standard PAGE-PRODUCTION rules. Seen on these pages: `/newsroom.html` and
`/newsroom/{yyyy}.html` are in inventory (rewrite); month archives, other
`.h00-` releases, `/research/departments-labs-institutes/**` and
`faculty.mdanderson.org` profiles are not (keep absolute).
