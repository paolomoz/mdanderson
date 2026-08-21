# Newsroom press-release archetype (live template `newsarticlepage`)

Established 2026-08-21 on two releases; 2,190 pages ride this at full
migration. Read with PAGE-PRODUCTION.md. **Status: composition + metadata
contract validated end-to-end (publish, index). The §4 grid CSS SHIPPED
(styles.css `body.news-article`, 834/54/408) and landed the layout — height
gates now pass (Δ 1.1% / 2.1%). Pixel gate still FAILS on both pages
(14.52% / 20.53%); the residual was polish-probed 2026-08-21 (band-profile +
geometry probes) and is ENTIRELY code-level — see §4b for the exact
selector → live-value levers. Authoring is exhausted: every alternative
composition was tried and measured WORSE (see §1 notes). Do NOT iterate
authoring further; the remaining gap closes in code, once.**

## 1. Validated pages

| Live path | DA / EDS path | Gate (pixel, height Δ) |
|---|---|---|
| `/newsroom/-patients-with-heart-disease-may-be-at-increased-risk-for-advanc.h00-159703068.html` | `/newsroom/patients-with-heart-disease-may-be-at-increased-risk-for-advanc` | 20.53%, Δ 2.1% ✓ after §4 CSS (was 32.33%/+20.8%); polish rounds 24.47%→20.53% (FAIL pixel, cause §4b) |
| `/newsroom/---md-anderson-s-institute-for-data-science-in-oncology-establis.h00-159698334.html` | `/newsroom/md-anderson-s-institute-for-data-science-in-oncology-establis` | 14.52%, Δ 1.1% ✓ after §4 CSS (was 19.81%/+3.1%); polish rounds 18.79%→14.52% (FAIL pixel, cause §4b) |

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
   No trailing newsletter section YET — the strip IS on live newsroom (it is
   the live footer's first child: black band h90, padding 20px 72px,
   "Subscribe to our Cancerwise newsletter"; live footer h900 vs EDS h745),
   but the EDS global footer block does NOT render it, and authoring the
   trailing `newsletter cancerwise` section before the §4b offset fixes ship
   measures WORSE (HD +3.9 pts — see §1). Add the trailing newsletter
   section in the same change that ships §4b.

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

## 4b. REMAINING CODE LEVERS (block the pixel gate; probed 2026-08-21 @1440)

The §4 grid shipped and passes the height gate, but its row plan sizes grid
row 1 to the contact card (row 1 = max(head, card+70) ≈ 378–399px), so the
body column starts +174px (HD) / +205px (IDSO) below live, shifting body,
standalone image, pre-footer and footer. Every lever below is selector →
live value; all EDS values were probed on the deployed pages.

1. **Rail flow (the big one, ~8–10 pts/page).** Live rail is an independent
   column: body starts at date-bottom + 18px while the card sits beside it.
   Live: `.col-content.alternate-content` x0 w960 (pad 0 18px 0 36px);
   `.col-sidebar.publication-sidebar` x960 w480 (pad 70px 72px 0 0); rail
   boxes w408 at x960; sidebar media top = contact-card bottom + 70px
   (HD: card 428→757, media 827). CSS alone can't stack two callout-wrappers
   in one grid cell — recommended fix is a tiny `news-article` template hook
   (scripts.js) wrapping the section's `.callout-wrapper`s in a rail div
   (`grid-column: 2; grid-row: 1 / span 2; align-self: start`), rail
   children in flow (first child margin-top 70px, gap 70px). EDS today:
   body firstP y780 vs live ~606 (HD); y800 vs ~601 (IDSO).
2. **Subtitle** — live `.article-subtitle`: Minion 18px/23.4, padding
   18px 0, margin 0. EDS (`main h1 + p`): margin 14.4px 0 4.5px, no padding
   → head 36px short. Suggested: `body.news-article main h1 + p
   { padding: 18px 0; margin: 0; }`
3. **Date line** — live `p.article-date`: Univers 45 Light 14px/18.2,
   margin 14px 0. EDS: plain Minion 18px/23.4. Suggested:
   `body.news-article main h1 + p + p { font: 14px/18.2px <Univers Light>;
   margin: 14px 0; }`
4. **Body rhythm (drift, ~100px over IDSO)** — live `.article-body p`
   gap = 18px (UA 1em margins collapsed); live `ul`: margin 18px 0,
   padding-left 40px; `li`: 18px/23.4, margin 0. EDS default-content p
   margins 14.4px 0 4.5px → −3.6px per block, cumulative −~100px by the
   article end. Suggested: `body.news-article main .default-content-wrapper
   :is(p, ul) { margin: 18px 0; }` (+ `ul { padding-left: 40px }`).
5. **`callout media` variant (HD ~5 pts)** — today renders as BASE callout:
   30px padding + centered flex + Minion 21px body → img 348×522 vs live
   408×612, caption Minion 21 centered vs live Univers 16px/20.8 left.
   Live: `.col-sidebar .media-image img` w408; `.media-caption` Univers
   16px/20.8, margin-top 22px, padding-right 30px, left-aligned. Suggested:
   `.callout.media .callout-inner { display: block; padding: 0; margin: 0;
   background: none; text-align: left; }` + caption rules.
6. **Share strip gutter** — live `.social-share-modal`: h70, padding
   20px 72px 10px (icons at x72). EDS `.share`: padding 20px 0 10px (icons
   at x0). Suggested: `body.news-article .share { padding: 20px 72px 10px }`.
7. **Footer newsletter strip** — live newsroom footer's first child: black
   strip h90, padding 20px 72px ("Subscribe to our Cancerwise newsletter");
   EDS footer omits it (h745 vs live h900). Ship together with the
   composition change in §2 item 5 (trailing `newsletter cancerwise`
   section), gated on levers 1–4 landing first.
8. **Contact-card internal rhythm (minor, 21px)** — HD live card h329 vs
   EDS h308 (content identical; one 16px/20.8 line of spacing). IDSO
   matches (329 = 329). Re-probe after 1–4.

With 1–6 shipped both pages project ≤5%; today's floor without them is
14.52% / 20.53% (residual bands: body-text shift smear, standalone-image
offset +101/+133, pre-footer shift +106/+137, footer strip + shift).

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
  verified, no action needed on the two gated pages). Sidebar media: keep
  pre-sizing to 408px until §4b lever 5 ships — the base callout's 30px
  padding renders any upload at 348px regardless (live shows 408).
- Uploaded so far: `heart-disease-jama-study.jpg` (834×450),
  `kevin-nead.jpg` (408×612), `idso-advisory-council.jpg` (834×469).

## 6. Links

Standard PAGE-PRODUCTION rules. Seen on these pages: `/newsroom.html` and
`/newsroom/{yyyy}.html` are in inventory (rewrite); month archives, other
`.h00-` releases, `/research/departments-labs-institutes/**` and
`faculty.mdanderson.org` profiles are not (keep absolute).
