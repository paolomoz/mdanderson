# EDS Conversion Log — mdanderson.org replica (12-page POC)

**Written by:** stardust:deploy Steps 1 (audit) + 2 (names + reuse — LOCKED) + 2b (section schema + decode tier), run centrally, 2026-08-20.
**Inputs:** `stardust/migrated/**` (12 pages, `stardust/rollout/coverage/pages.json`), prototypes at `http://localhost:8791/<slug>-proposed.html`, chrome canon `stardust/canon/{header,footer}.html`, `stardust/runtime-contract.json` (vanilla-eds, formatted-only buttonization, `p.button-wrapper`, `emptySectionCollapse: true`).
**Schemas:** `stardust/eds-schema/<slug>.json` for all 12 pages (`patients-family-html.json` generated from the **index** prototype — same-design sibling, identical section structure; annotated in the JSON).
**This log is the LOCK.** Page/block agents build FROM it; naming or reuse changes require re-opening this document.

This was a hands-off run: every naming/reuse call below was decided centrally; the rationale is recorded inline (look for *Decision:*).

---

## 1. The one rule, applied

- Prose sections (heading / paragraphs / image / CTAs, no repeating units, no bespoke structure) = **DEFAULT CONTENT** + at most one section-metadata `style` value (D1).
- Same-pattern sections across pages = **ONE block + variant classes** (D9).
- Collection-pattern sections mirror the Block Collection name and content model (D11): `hero`, `cards`, `columns`, `accordion`, `quote`, `carousel`, `tabs→handled as grouped block instances`, `video`.
- The **More/Less prose expanders** (`extra-text` + More/Less CTAs on about, breast-cancer, breast-center, clinical-trials, our-locations) are an AEM RTE artifact. *Decision:* **dropped** — prose ships fully expanded as default content. Zero content loss, better crawlability; the toggle is not a content pattern. Recorded here so QA does not flag "missing More button".
- Replica-only widgets in `<main>` — `scrollToTop`, `chat-widget-replica`, `mda-drawer-replica`, `media-overlay`, and the scroll-triggered sticky clone `appt-bar-sticky` — are **dropped** (replica chrome simulation, not content). *Decision:* the sticky appointment-bar duplicate is not reproduced in the POC; the in-flow appointment bar carries the same facts (#86: the phone number stays server-rendered in main).

## 2. Closed section-`style` set (default-content sections ONLY — never on block sections)

| style | Paint | Used by |
|---|---|---|
| `dark` | Black full-width band, white text, phone `<strong>` emphasis | appointment-bar / contact-strip sections (all pages that have them) |
| `tinted` | Light gray band (`#f2f3f4`) | cancerwise-hero band, gray prose bands (mission-vision-values ground) |
| `lede` | Drop-cap large-type intro paragraph | intro (about, our-locations, prevention, donors), lede (breast-cancer) |
| `bleed` | Full-bleed edge-to-edge image section | badge-band (about — decorative image strip, D1: bare image ≠ block) |
| `page-head` | Icon-circle + `h1` title band + description | clinical-trials page-header (icon authored as `:icon-clinical-trials:` span) |

That's the whole set — 5 values. Section **heads** above repeating blocks (e.g. "Help #EndCancer", "Manage Your Risk", "More about breast cancer", "From our Faculty Experts", "Find stories by topic") are default content in the SAME section as the block, styled in place via `.{block}-container .default-content-wrapper` — **no style value needed** (skill § Section heads).

The `appointment-bar` / `contact-strip` triage note: it is a single prose sentence with a phone link and an appointment link — **default content + `dark`**, NOT a block (D1). CTAs stay plain links (the replica styles them inline in the sentence, not as buttons).

## 3. Chrome contract (template-slotted, D12/#95)

**Source of truth:** `stardust/canon/header.html` + `stardust/canon/footer.html` (shared by all 12 replica pages).

### `blocks/header` (template-slotted from canon/header.html)
Fetches `content/nav.html`. Document contract — **four default-content sections, fixed order**:
1. **brand** — logo link (MD Anderson logo image + home href)
2. **links** — the primary nav `<ul>` (6 items: Patients & Family / Prevention & Screening / Donors & Volunteers / For Physicians / Research / Education & Training). Flyouts are empty in the replica (`.mda-nav-flyout hidden`) — nav items are plain links.
3. **tools** — the utility link row (Clinical Trials, Locations, Careers, Contact Us, Our Doctors, Languages)
4. **utility bar** (EXTRA section per skill Step 6 multi-row chrome) — MyChart / Request an Appointment / Donate Today
The stock header block's brand/sections/tools slots keep the hamburger machinery; the block slots section 4 ABOVE the nav row and renders the **search form in block JS** (interactive, never authored — D15). `--nav-height` must be re-measured for this 3-row chrome (utility bar + logo/utility row + primary nav).
Nav decode: match `:scope > a, :scope > p > a` (#98 — pipeline wraps li triggers in `<p>` on live).

### `blocks/footer` (template-slotted from canon/footer.html)
Fetches `content/footer.html`. Document contract — one default-content section per band, fixed order:
1. **logo** (footer logo link) · 2. **Explore** link column (`<ul>`, first `<li>` = column title) · 3. **About** link column · 4. **Finding Your Way** + **Digital Accessibility** columns · 5. **Get in Touch** (Call + tel link, Ask a question link) · 6. **Stay Connected** social links (one `<ul>` of links; icons derived from hostname in block JS) · 7. **Cancerwise Podcast** links (same device) · 8. **More** legal sublinks · 9. **mission band** (mission statement paragraph + copyright line).
The footer block owns its own top margin (#31) and renders the social/podcast icon carousels from the authored link lists.

### EndCancer trio + newsletter — LOCKED DECISION
Per the replica both live **inside `<main>`** on every page (the `endcancer-trio` and `global-footer` data-sections are children of main). *Decision:* they ship as **in-main blocks reused on every page** — the recommended path — NOT as footer chrome:
- **EndCancer trio** = `cards (promo, closing)` — section head "Help #EndCancer" as default content + a 3-row cards table (Give Now / Donate Blood / Shop MD Anderson; red/black/blue panels). Canonical authoring snippet is identical on all pages that carry it (all except research, which closes with the same-pattern `pre-footer-trio`).
- **Newsletter** = `newsletter` block (variant `cancerwise`, dark band: email icon, "Subscribe to our Cancerwise newsletter", First/Last/Email fields + Get started). Last section in main on every page; the footer chrome follows immediately, preserving the replica's visual continuity (both paint the same dark ground).
- Rationale: keeps the trio + signup server-rendered on every page (#86), keeps footer.html a pure chrome document, and matches the replica's DOM placement.
- **Fragment option (noted, deferred):** these are exactly D12's "genuinely reused band" case; a fast-follow can move both into `content/fragments/closing.html` referenced by an auto-blocked fragment link per page. Rejected for the POC to keep the deploy chain simple and avoid the fragment indirection while the block set stabilizes.
- The **rest** of the replica's in-main `global-footer` (link columns, sublinks, mission band) is chrome and ships via the footer block — page agents must NOT author it into page content.

## 4. Templates / layout devices

Stock `decorateTemplateAndTheme` maps page-metadata `template:` to a body class. Locked template values:
- `landing` — index, patients-family, prevention-screening, research, donors (single column; no layout CSS needed beyond sections)
- `interior` — breast-cancer, breast-center, clinical-trials: two-column grid on `body.interior main` (sidebar ≈ 25% / content 75%). The `section-nav` block's auto container class (`.section-nav-container`) pins the sidebar to column 1; sections after it flow in column 2; full-width bands ABOVE the sidebar (hero, appointment-bar, breadcrumbs) span both columns. Implementation latitude belongs to the foundation/page agents; the contract is: **sidebar = `section-nav` block section, column assignment keyed off the runtime's `.{name}-container` class, no section-metadata on block sections**.
- `blog-article` — the cancerwise article: three-zone layout (topic-filter sidebar / article column / right rail). Rail blocks carry a `rail` variant class; template CSS assigns rail sections to the rail zone.
- `blog-listing` — cancerwise index (single column, listing styles)
- `static` — about, our-locations (single column)

**Prose+rail pairs** on non-interior pages (about mission-vision-values + quick-links-rail; breast-cancer about + about-rail / more-about + podcast-rail / why-choose + pull-quote; breast-center intro + video-teaser, cancer-types + pull-quote): the prose is **default content**; the rail is a block section (`cards (icon, rail)`, `quote`, `podcast`, `video (teaser)`) immediately following; the owning template/page CSS places the rail beside the prose. An item deliberately NOT paired is a drop recorded here: none.

## 5. Locked block table (kind · decode tier · pages · variants)

Reserved-name check passed: no block named `section`/`block`/`wrap`/`button`, none ending `-wrapper`/`-container`.

| Block | Kind (D11) | Decode tier (#95) | CONVERTS on (first) | REUSED by | Variants |
|---|---|---|---|---|---|
| `header` | chrome (stock name) | template-slotted | index | all | — |
| `footer` | chrome (stock name) | template-slotted | index | all | — |
| `hero` | collection: hero | template-slotted (slides slot per row) | index (`carousel` 1-slide) | patients-family, prevention, donors, research (4-slide + dots), about/our-locations/breast-cancer/breast-center (`static`) | `carousel`, `static`, `left`/`right` (text alignment), `compact` (thin interior title band), `scroll-cue` (Scroll Ahead chevron) |
| `cards` | collection: cards | reconstructive | index (support-duo `promo duo`, icon-trio `icon trio`, closing `promo closing`) | every page | `promo` (colored panels) / `icon` (white, icon-circle, arrow CTA); layout: `duo`, `trio` (default), `rail` (stacked single col), `ribbon` (cancerwise link-ribbon); palette classes (closed set, nth-child color cycles — see §7) |
| `article-cards` | invented (listing family) | reconstructive | breast-cancer (featured-articles `grid`) | clinical-trials (`news`, `experts`), cancerwise (`featured`, `rail-tab`, `topic`), article (`rail`) | `grid` (4-col), `news` (2-col + view-more), `experts` (2-up large w/ summary), `rail` (thumb rows), `featured` (single large w/ summary + CTA), `rail-tab` + `topic` (tab-grouped — consecutive instances grouped into a tab UI client-side, D2-safe; first instance = active tab) |
| `link-list` | invented | reconstructive | prevention-screening (manage-your-risk `columns`) | index*(inside icon-wells — see below)*, research (areas-resources), our-locations (cancer-network `columns external`), breast-cancer (locations `icon-head`), breast-center (resources), donors (gifts-at-work `thumbs`) | `columns` (2-col), `icon-head` (icon-circle heading + CTA), `thumbs` (row images), `boxed` (research departments-labs-institutes text-border rows) |
| `columns` | collection: columns | reconstructive | index (award-why-choose `badge`) | about (facts-history, careers, community-outreach), our-locations (proton/diagnostic bands), donors (innovation, volunteers, stories), breast-center (cancer-types+quote pair uses default content + quote instead; contact `contact`), prevention (—) | `image-left` / `image-right` (alternating split bands), `badge` (award image), `contact` (contact band) |
| `carousel` | collection: carousel | reconstructive | index (highlights) | patients-family, research (highlights), clinical-trials (video-gallery `videos`) | default (linked image cards + caption, dots + arrows), `videos` (2-up video cards w/ play badge + body text) |
| `accordion` | collection: accordion | reconstructive | breast-cancer (classification) | — | — (one row per panel: title cell + rich content cell, images allowed in content) |
| `quote` | collection: quote | template-slotted | research (pull-quote `spotlight`) | breast-cancer (`rail`), breast-center (`rail`), article (`rail`) | `spotlight` (photo + name + roles + quote), `rail` (icon quote + author/title) |
| `stats` | invented | reconstructive | research | — | numeral colors cycle blue/purple/blue via nth-child (fingerprint-confirmed); rows: value \| description; trailing default-content body + CTA stays outside the block |
| `banner` | invented (horizontal-text-bar) | template-slotted | index (alert-band `red`) | patients-family, research (why-research `blue`, astro-band, investigators-band) | color set `red`, `blue`, plus the two research band colors (page agent verifies exact tokens from prototype CSS and records them as variant classes) |
| `video` | collection: video | template-slotted | index (video-feature `feature`) | patients-family, research (mission-prose media `teaser`), breast-center (video-teaser `teaser`; panorama `panorama`) | `feature` (full-bleed poster + scrim + title + play), `teaser` (rail card + CTA), `panorama` (360-photo band: poster + caption/desc panel; Pannellum NOT shipped — static poster + link out; noted trade) |
| `promo-band` | invented (headline-with/bg-image) | template-slotted | prevention-screening (prevention-center-promo `orange right`) | donors (campaign-band `left`) | info-panel side `left`/`right`, panel color `orange`/default |
| `search` | invented | template-slotted (form built in block JS) | clinical-trials (`trials`) | cancerwise (`blog`) | `trials` (title + lede + inline form), `blog` (full-width band) — authored: title, placeholder, search target URL (D4 opaque token) |
| `icon-wells` | invented (bespoke landing composition) | template-slotted | index | patients-family | — single bespoke block: 2 search wells (icon \| title \| placeholder \| browse-CTA rows) + Plan Your Care link column (link rows + list CTA); mixed rows classified by leading icon token; search interactivity in block JS |
| `locations` | invented (listing family) | reconstructive | our-locations | — | campus row (image \| name+url \| address+maps-url) + one row per sub-location (name \| maps-url address); MORE/LESS expander wired in block JS; must tolerate an image-less/empty trailing sub-item (fingerprint) |
| `podcast` | invented | template-slotted | breast-cancer (podcast-rail `rail`) | clinical-trials (featured-podcast `wide`) | `rail`, `wide`; slots: kicker ("Featured Podcast:"), episode title, episode URL, transcript URL |
| `callout` | invented | reconstructive | clinical-trials (did-you-know `purple`) | article (key-takeaways `boxed`) | `purple` (title + large text), `boxed` (title + bullet list) |
| `newsletter` | invented | template-slotted (form in block JS, #20) | index (`cancerwise`) | every page (`cancerwise`); article also (`focused` — green Focused on Health rail card) | `cancerwise` (dark band), `focused` (green rail); authored: title + intro copy; fields fixed in template |
| `breadcrumbs` | invented | reconstructive (one cell of links, D5) | breast-cancer | breast-center, clinical-trials, article | — |
| `section-nav` | invented (interior sidebar) | reconstructive | breast-cancer | breast-center, clinical-trials, article (`topics` — category/topic filter tree with counts) | `topics`; authored as nested link list (parent + child levels); the breast-cancer sidebar promo box ("View Clinical Trials") is a trailing row rendered as the nav footer card; mobile jump-menu toggle in block JS |
| `share` | invented | template-slotted (zero authored rows — block derives URLs from `location`; modal + copy-link in block JS) | breast-cancer | breast-center, clinical-trials, article | — |
| `article-header` | invented | template-slotted | article | — | slots: h1 (the page's single `<h1>`), author name + profile URL, read time, publish date; share buttons rendered by JS (reuses share block's machinery or its own — implementer's call, no nested block table) |
| `byline` | invented | template-slotted | breast-cancer | breast-center (empty variant tolerated — its byline is blank in the replica), article, clinical-trials | slots: reviewer links (1..n) + review date; renders "Medically Reviewed \| Last reviewed by … on …" |

**23 content blocks + 2 chrome blocks.** Default-content sections (no block): heros' section heads n/a; per-page counts in §6. The boilerplate's stock `blocks/widget` is unused — do not build on it.

### Decode-tier defaults recap
Template-slotted (fidelity by construction): header, footer, hero, banner, video, promo-band, search, icon-wells, podcast, newsletter, share, article-header, byline, quote.
Reconstructive (authorable repeats; schema unit counts are the post-decorate assertions): cards, article-cards, link-list, columns, carousel, accordion, stats, callout, breadcrumbs, section-nav, locations.

## 6. Per-page section triage (ordered; DC = default content)

Delivery order per `stardust/rollout/plan.json`. "→ converts" marks the first build of a block; everything else reuses.

### 1. index (`/`, landing) — schema: eds-schema/index.json
1. hero — **hero (carousel, right, scroll-cue)** → converts
2. contact-strip — **DC + `dark`**
3. alert-band — **banner (red)** → converts
4. icon-wells — **icon-wells** → converts
5. award-why-choose — **columns (badge)** → converts · ⚠ replica has an `h1` here ("Why Choose MD Anderson") — canonicalize to `<h2>` (one `<h1>` per page, in the hero)
6. video-feature — **video (feature)** → converts
7. highlights-carousel — head DC + **carousel** → converts
8. support-duo — **cards (promo, duo)** → converts
9. icon-trio — **cards (icon, trio)** (title-only cards)
10. endcancer-trio — head DC + **cards (promo, closing)**
11. newsletter — **newsletter (cancerwise)** → converts
(+ metadata block; global-footer content EXCLUDED — chrome)
DC sections: 2 · block sections: 9

### 2. patients-family (`/patients-family`, landing) — schema: eds-schema/patients-family-html.json (from index prototype — noted)
Identical section list to index; **REUSES everything, converts nothing**. Same canonicalizations apply.

### 3. prevention-screening (landing)
1. hero — hero (carousel, 1 slide) — reuse
2. contact-strip — DC + `dark`
3. intro — DC + `lede`
4. icon-duo — cards (promo, duo)
5. manage-your-risk — head DC + **link-list (columns)** → converts
6. prevention-center-promo — **promo-band (orange, right)** → converts
7. endcancer-trio — head DC + cards (promo, closing)
8. newsletter — newsletter (cancerwise)
DC: 3 · blocks: 5

### 4. research (landing)
1. hero — hero (carousel, 4 slides, left, dots) — reuse (adds multi-slide + dots to the converted block)
2. mission-prose — DC prose + **video (teaser)** rail pair
3. highlights-carousel — head DC + carousel
4. why-research-band — banner (blue)
5. departments-labs-institutes — head+desc DC + **link-list (boxed)**
6. astro-band — banner (color per prototype)
7. pull-quote — **quote (spotlight)** → converts
8. stats — head DC + **stats** → converts (blue/purple/blue numeral cycle) + trailing DC body/CTA
9. investigators-band — banner (color per prototype)
10. areas-resources — link-list (columns, with per-column heading + subtext rows)
11. pre-footer-trio — cards (icon, trio) — *same pattern as closing but different copy; research has NO EndCancer trio (fidelity to replica)*
12. newsletter — newsletter (cancerwise)
DC: ~4 · blocks: 10

### 5. cancer-types/breast-cancer (program → `template: interior`)
1. hero — hero (static, compact) — adds `static` variant
2. appointment-bar — DC + `dark`
3. breadcrumbs — **breadcrumbs** → converts
4. section-nav (sidebar incl. clinical-trials promo box) — **section-nav** → converts
5. share — **share** → converts
6. byline (medical reviewers ×3 + date) — **byline** → converts
7. lede — DC + `lede`
8. about — DC prose (full, expander dropped) + rail: DC image + **cards (icon, rail)** ("#1 in Cancer Care" promo)
9. classification — **accordion** → converts (3 panels, rich content w/ images)
10. more-about — head DC + DC prose + rail **podcast** → converts
11. why-choose — DC prose + **quote (rail)**
12. locations (Treatment at MD Anderson) — link-list (icon-head)
13. featured-articles — **article-cards (grid)** → converts (8 story cards)
14. cta-duo — cards (promo, duo)
15. support-trio — cards (icon, trio)
16. endcancer-trio — head DC + cards (promo, closing)
17. newsletter — newsletter (cancerwise)
DC: ~6 · blocks: 12

### 6. patients-family/…/breast-center (program → interior)
1. hero — hero (static, compact)
2. appointment-bar — DC + `dark`
3. breadcrumbs — breadcrumbs
4. section-nav — section-nav
5. share — share
6. byline — byline (empty-tolerant)
7. intro — DC prose + **video (teaser)** rail
8. cancer-types — DC (bold lead + link list as native `<ul>`) + **quote (rail)**
9. panorama — video (`panorama`) — adds variant
10. cta-duo — cards (promo, duo)
11. resources — head DC + link-list (columns)
12. prevention-promo — columns (image + icon-promo panel — `image-left` w/ promo cell)
13. contact — columns (contact)
14. endcancer-trio — head DC + cards (promo, closing)
15. newsletter — newsletter (cancerwise)
DC: ~5 · blocks: 11

### 7. patients-family/…/clinical-trials (program → interior)
1. breadcrumbs — breadcrumbs
2. section-nav — section-nav
3. share — share (share-tools)
4. byline — byline (medical-reviewer, empty-tolerant)
5. page-header — **DC + `page-head`** (icon span + h1 + description)
6. trial-search — **search (trials)** → converts
7. about-trials — DC prose + rail **callout (purple)** → converts (did-you-know) + **podcast (wide)**
8. trial-pathways — cards (icon, trio)
9. in-the-news — article-cards (news) + view-more toggle in block JS
10. video-gallery — carousel (videos) — adds variant
11. faculty-experts — head DC + article-cards (experts)
12. endcancer-trio — head DC + cards (promo, closing)
13. newsletter — newsletter (cancerwise)
DC: ~3 · blocks: 10

### 8. about-md-anderson/our-locations (listing → `static`)
1. hero — hero (static)
2. appointment-bar — DC + `dark`
3. intro — DC + `lede`
4. houston-locations — **locations** → converts (campus card + 7 sub-items, one image-less/empty tolerated; MORE/LESS in JS)
5. proton-therapy-center — columns (image-left)
6. diagnostic-clinics — columns (image-right)
7. diagnostic-laboratory-centers — columns (image-left)
8. cancer-network — head/desc/CTA DC + link-list (columns, external links w/ region subtext)
9. visitor-resources — cards (icon, trio)
10. endcancer-trio — head DC + cards (promo, closing)
11. newsletter — newsletter (cancerwise)
DC: ~4 · blocks: 8

### 9. cancerwise (listing → `blog-listing`)
1. cancerwise-hero — **DC + `tinted`** (h1 wordmark link, "wise" accent as `<em>` — block CSS/foundation colors `h1 em`; summary paragraph)
2. blog-search — search (blog)
3. featured-stories — **article-cards (featured)** + two **article-cards (rail-tab)** instances ("Read the latest stories" / "Top Stories") grouped into tabs client-side → converts variants
4. link-ribbon — cards (ribbon) — 3 icon CTA buttons
5. stories-by-topic — head DC + six **article-cards (topic)** instances (Diagnosis & Treatment · Patients & Caregivers · Healthy Living · Research · Expert Insights · Philanthropy), each = tab-label row + headline row + 8 card rows; grouped into a tab UI client-side; first = active
6. endcancer-trio — head DC + cards (promo, closing)
7. newsletter — newsletter (cancerwise)
DC: ~3 · blocks: 6 (11 block instances)

### 10. cancerwise/how-to-cope-with-insomnia… (article → `blog-article`)
1. breadcrumbs — breadcrumbs
2. topic-filters — section-nav (topics) — full category tree w/ counts, STATIC in POC (production: query-index; see dynamic-blocks-map)
3. article-header — **article-header** → converts (h1, author+link, 8-min read, publish date, share buttons)
4. medical-review — byline
5. article body — **DC prose** (h2/h3/p/ul/links — the bulk of the page) interleaved with rail/inline blocks:
   - feature-image — DC image
   - key-takeaways — callout (boxed)
   - pull-quote — quote (rail)
   - more-stories — article-cards (rail) — 5 thumb rows
   - share-story-promo / request-appointment-promo / reduce-risk-promo — three cards (icon, rail) singles
   - newsletter-signup — newsletter (`focused`) — adds variant
6. endcancer-trio — head DC + cards (promo, closing)
7. newsletter — newsletter (cancerwise)
DC: large (article prose + image) · blocks: 8

### 11. donors-volunteers (form → landing template)
1. hero — hero (carousel, 1 slide, w/ CTAs)
2. intro — DC + `lede`
3. give-columns — two stacked cards (promo) + **link-list (thumbs)** → converts variant (gifts-at-work, image rows + Make a gift CTA)
4. innovation / 5. volunteers / 6. stories — columns (image alternating)
7. campaign-band — promo-band (left)
8. help-trio — cards (icon, trio)
9. contact-strip — DC + `dark`
10. endcancer-trio — head DC + cards (promo, closing)
11. newsletter — newsletter (cancerwise)
DC: ~3 · blocks: 8

### 12. about-md-anderson (static)
1. hero — hero (static)
2. appointment-bar — DC + `dark`
3. intro — DC + `lede`
4. mission-vision-values — DC prose (full) + rail **cards (icon, rail)** ×3 (quick-links-rail: Locations / Contact Us / Find Your Way)
5. facts-history / 6. careers / 7. community-outreach — columns (image alternating)
8. resources-trio — cards (icon, trio) (Business & Legal / Newsroom / For Employees)
9. badge-band — **DC image + `bleed`** (decorative full-bleed strip — D1, not a block)
10. endcancer-trio — head DC + cards (promo, closing)
11. newsletter — newsletter (cancerwise)
DC: ~5 · blocks: 6

**Totals:** ~41 default-content sections vs ~93 block-section instances across the 12 pages, served by 23 content blocks.

## 7. Fingerprint findings folded in (#90 — real variants the blocks MUST reproduce)

Probed: index, research, cancerwise, our-locations (full JSON kept at /tmp/fp during the run; conclusions locked here).

| Section / group | Finding | Requirement |
|---|---|---|
| research `stats` .stat-item ×3 | numerals colored **blue / purple / blue** | `stats` CSS cycles accent color via nth-child — never flatten to one color |
| our-locations `houston-locations` .sub-item ×7 | 6 with image-ish content, 1 empty/image-less | `locations` decode tolerates a sparse/empty sub-item without breaking the grid |
| cancerwise `blog-listing`/`featured-stories` .collection-group ×2 | image-led featured group vs text-only list group | `article-cards (featured)` vs `(rail-tab)` are structurally different — model as separate variant instances, not uniform cards |
| cancerwise story cards | **colored category tag** (`blog-category diag-treatment` etc.) + author-date | `article-cards` renders a category tag colored by a closed topic→color map in block CSS (class = slugified category), plus the date line |
| cancerwise tab menus (`ui-tabs-active`) | **active tab** state (Latest/Top; 6 topic tabs) | tab grouping JS marks first instance active; active styling required (fingerprint hint "active tab" — confirmed in DOM, panels are display-gated so the probe under-reported) |
| index/about `columns` groups (.col-double ×2) | image column alternates sides across bands; award band's image is a **badge** not a photo | `image-left`/`image-right`/`badge` variants (locked above) |
| index `icon-wells` col-double | left column carries a divider border (`cell-border`) | block CSS detail — keep the divider |
| research hero carousel-body ×2 per slide | desktop + mobile duplicates of the same copy | **migration artifact, not a variant** — author copy ONCE; the block emits both renderings |
| footer groups (I.fa red vs white, col2/UL/LI clusters) | chrome styling deltas | template-slotted footer reproduces them by construction — filtered as no-ops |
| P. clusters (proton, diagnostic, visitor-resources) | paragraphs with vs without inline links | **false positives** — filtered |
| cards `promo` palettes | closing = red/black/blue; support-duo = red/purple; give stack = purple/green; icon-duo = purple/red | palette rides **per-variant nth-child cycles** declared as palette classes (closed set): `closing`, `support`, `give`, `screen` — recorded so no author ever picks a color (D6). `cards icon` circle colors ride the authored `:icon-*:` token + variant CSS per section where they diverge |

## 8. Encode notes page agents must follow

- **Icons** author as `:icon-name:` tokens (EDS default-content icon convention → `<span class="icon icon-…">`); the icon font/SVG set is lifted once into `icons/`.
- **Buttons**: `<strong><a>` primary / `<em><a>` secondary (runtime is formatted-only, `p.button-wrapper`). The replica's arrow-CTAs (`Browse cancer types →`) are text links with flourish, NOT buttons — leave plain `<a>`, style per block.
- Card/sub titles canonicalize to `<h3>`; exactly one `<h1>` per page (hero or article-header); index's in-body `h1` → `h2`.
- **Accents** (`Cancer<em>wise</em>`, `.first-large` drop caps) ride `<em>` / section style — never spans.
- Video/embed URLs stay plain links on their own line → `buildAutoBlocks()` (D1); the `video` block is for the composed poster+overlay bands, whose video URL is an authored cell.
- Images: rehost editorial images to DA `/media/<scope>/`, author `content.da.live` URLs; replica-relative `assets/media/...` srcs must never ship (→ `about:error`).
- `main .section:empty { display: none }` in the foundation (`emptySectionCollapse: true`).

## 9. Page-metadata contract (each page's `metadata` block — D14)

All pages: `title`, `description`, `template` (§4 value). Plus per content type (these feed the production indices — see `stardust/rollout/dynamic-blocks-map.md`):

| Type (pages) | Required metadata rows |
|---|---|
| **article** (cancerwise/how-to-cope-…) | `author` (Roman Gokhman) · `publishdate` (2026-06-08) · `category` (closed topic set: diagnosis-treatment, patients-caregivers, healthy-living, research, expert-insights, philanthropy) · `image` (feature image URL) · `readtime` (8) · `reviewer` (Pamela Schlembach, M.D.) · `reviewdate` (2026-06-08) |
| **blog listing** (cancerwise) | `image` (og card) |
| **location** (none in POC — contract for production location detail pages) | `city` · `address` · `phone` · `image` · `type: location` |
| **program/interior** (breast-cancer, breast-center, clinical-trials) | `reviewer` + `reviewdate` where a byline exists; `image` |

Page agents MUST emit these rows even though the POC listing blocks are static — they are what makes the draft `helix-query.yaml` index turnkey at production scale.

## 10. Open risks / notes for later steps

- **Fonts/licensing**: the replica uses MD Anderson's proprietary faces + Font Awesome-style icon fonts — Step 4's licensing-alert protocol applies when the foundation agent lifts them.
- The `panorama` 360 viewer ships as a static poster + external link in the POC (CSP/wasm risk with Pannellum; #102). Recorded trade.
- The article page's topic-filter tree (~98 links w/ per-category counts) is authored statically — counts will drift; production replaces it with an index-driven render (dynamic-blocks-map).
- `content-band-1` data-sections in the migrated pages are migration wrapper artifacts, not sections — ignore them.
- Cross-check every reconstructive block's unit counts against its page schema in `stardust/eds-schema/` (#93); `repeats[].uniform: false` entries correspond to the §7 variants.

## 11. Foundation + chrome notes (written by the FOUNDATION agent, 2026-08-20)

### ⚠️ FONT LICENSING ALERT (#80)
**Minion (Adobe) and Univers LT 45/55/65/67BoldCn (Monotype/Linotype) are licensed commercial kits**, self-hosted under `fonts/` strictly for POC-preview fidelity. **Do not publish beyond the POC preview until licensing is confirmed.** Full file→family→foundry table + remove path in `fonts/LICENSING.md`; banner comment atop `styles/styles.css`. Remove path: delete the woffs + their `@font-face` rules in `styles/fonts.css` — every stack degrades to the metric-matched `minion-fallback`/`univers-fallback`/`univers-cn-fallback` local faces with zero layout shift. The site's FontAwesome-derived icon build (`fontawesome-webfont.woff`, custom codepoints) and the MDIcons/mda-icons clientlib fonts are client-owned assets — confirm reuse. Open Sans is Apache 2.0 (fine).

### Foundation facts the page/block agents rely on
- **`--nav-height`**: 224px desktop (utility bar 48 + logo row 116 + red nav 60, measured from `stardust/replica/capture/index/1440.json`); 85px at ≤991px (360 map). Chrome collapse breakpoint = **991px** (canon pinned); header emits `data-nav-collapse="hamburger"`.
- **Metric-matched fallbacks** (computed with fontTools string-advance widths from the shipped woffs): `minion-fallback` ← local Times New Roman (size-adjust 99.53%, ascent 72.359%, descent 27.172%, line-gap 19.906%); `univers-fallback` ← local Arial (104.739% / 99.293% / 26.185% / 0%); `univers-cn-fallback` ← local Arial Narrow for the 67 Bold Condensed face (107.225% / 103.901% / 24.233% / 0%).
- **Tokens**: canon token contract verbatim in `:root` (`--heading-xxl/xl/lg/md`, `--body`, `--body-sm`, `--section-padding`, `--max-width: 1440px`, `--radius: 0px`, spacing scale) + full DESIGN.json palette (`--color-accent`, `--color-blue`, `--color-purple`, …) + font-family tokens (`--body-font-family`, `--body-font-semibold`, `--sans-font-family`, `--sans-light-font-family`, `--sans-bold-font-family`, `--sans-boldcn-font-family`). Token gate (#91) passes for all block CSS.
- **Buttons**: `a.button` = Univers 55 18px, square corners, padding 11px 30px; `.primary` = red fill #DA291C; `.secondary` = ghost outline (currentcolor — white on `.dark` bands); `.accent` = appointment blue #3361AD.
- **Section style paints**: `dark` is implemented with the canon `.appointment-bar.banner` spec — **blue #3361AD band** (§2's "black" description was a drafting slip; the replica strip is blue per canon.css and DESIGN.json "blue we're-here-for-you strip"). `lede` drop-cap rides `::first-letter` (102px) — no span needed in content. `page-head` icon rides the `:icon-*:` span slot.
- **Chrome**: header/footer blocks are template-slotted from canon; `content/nav.html` (brand / links / tools / utility-bar sections) and `content/footer.html` (9 band sections) authored per the §3 contract. Nav decode matches `:scope > a, :scope > p > a` (#98). Mega-menu flyout panels exist in the header template (hidden, canon parity); authored nested `<ul>`s under a top-level nav `<li>` render into them. The replica's flyouts are empty, so nav.html authors plain links.
- **Favicon**: `https://www.mdanderson.org/favicon.ico` returned **404** (real-Chrome UA) — skipped per protocol; the boilerplate favicon remains.
- **Chrome logo images** in nav/footer.html are fully-qualified `www.mdanderson.org` clientlib URLs (canon-verbatim). If preview ingestion 403s on them (bot wall), the deploy agent should download-and-rehost to DA `/media/chrome/` per the skill's image rule.

## 12. Program-cluster notes (breast-cancer / breast-center / clinical-trials, written 2026-08-20)

Converted per §5: `breadcrumbs`, `section-nav`, `share`, `byline`, `accordion`,
`podcast` (rail + wide), `article-cards` (grid + news + experts), `search`
(trials), `callout` (purple). All per-block AND whole-page `block-roundtrip`
runs exit 0 on the three pages.

- **Interior template layout** lives in `blocks/section-nav/section-nav.css`
  (§4 latitude): `body.interior main` = 240px/1fr grid keyed off
  `.section-nav-container`; sections after the sidebar flow in column 2; the
  trailing two sections (EndCancer trio + newsletter) span full width via
  `:nth-last-child(-n+2)` — interior pages MUST keep those as the last two
  sections. Prose+rail pairs are single sections (DC + rail block) paired via
  container/`:has()` variant selectors.
- **Reused-block variant additions** (the log's "adds variant" instances) are
  implemented WITHOUT rewriting the landing cluster's files while both
  clusters ran in parallel: variant CSS is appended in section-nav.css under
  a marked banner (`quote.rail`, `video.panorama`, `carousel.videos`,
  `link-list.icon-head`, `cards.rail`, duo palettes `trials`/`patient`, trio
  circle palette `pathways` purple/lightblue/orange, per-instance gray grounds
  as block-variant class `tinted`); two small ADDITIVE JS edits were made:
  `cards.js` (card media rendering + icon-card body/CTA — index behavior
  unchanged), `video.js` (panorama credit link), `carousel.js` (videos
  More/Less mobile expander). Deploy consolidation may move the CSS into the
  owning blocks.
- **Palette additions beyond §7's closed set** (per-instance fingerprints):
  duo `trials` (purple/blue, breast-cancer), duo `patient` (blue/purple,
  breast-center), trio circles `pathways` (purple/lightblue/orange, both
  trios on breast-cancer + clinical-trials). §7's icon-trio default
  (red/lightblue/green) holds for index only.
- **Icons**: 10 authored-icon SVGs extracted from `fonts/mda-icons.woff`
  (white fill, for colored circles) into `icons/` — clinical-trials,
  carepages, mycancerconnection, screenings, counseling,
  care-centers-clinics, manage-risks, knowledgecenter, contact-us,
  directions. cicon codepoints for cards glyphs added for the same names.
  Breast-center's contact card uses the `directions` glyph e60d (index's
  directions-stroke) — the replica's e60e variant is a close cousin; accepted.
- **Media**: all editorial images staged under `media-staging/{breast-cancer,
  clinical-trials,breast-center}/`; Cancerwise podcast artwork ships as fixed
  brand assets under `img/podcast/` (#67).
- **Deliberate drops** (zero-pixel or replica artifacts): after-hours hidden
  appointment-bar duplicate; mobile lede duplicate; sticky appt bar (§1);
  empty byline blocks on breast-center/clinical-trials (blank in replica —
  metadata reviewer rows only on breast-cancer); the empty
  breast-cancer-facts sidebar link (empty text in replica); the accordion
  panel-3 "Schedule a Screening" injected promo's white box border (inline-
  style hack in source; content kept as h3+p+accent button); urldefense
  wrappers on the two app-store links (unwrapped to direct store URLs).
  More/Less prose expanders ship as BLOCK-OWNED mobile UI in accordion and
  carousel(videos) — authored content is fully expanded per §1.
- **Known harness limits hit** (not defects): body.interior/section-style
  classes are pipeline-rendered (v2 server-side) so the harness shows a
  single column and unstyled dark/lede/page-head bands; `:icon-x:` tokens
  stay literal text locally; content.da.live images 401 anonymously;
  chrome header/footer render empty (qa-gate ✗ ×2/page); qa-gate's
  order-based schema unit matcher misaligns because the interior schemas
  wrap the whole replica body in 1–2 giant sections (page-body /
  col-content-wrapper / highlight / global-footer) — the actual unit counts
  render (verified: closing 3, trio 3, duo 2, breadcrumbs 3, risk-list 11,
  exactly one h1 per page).

## 13. Static/listing/funnel-cluster notes (about-md-anderson / our-locations / donors-volunteers, written 2026-08-20)

Converted per §5: `locations` (our-locations houston-locations — reconstructive;
3-cell location-card rows [image | name+url | address+maps-url] + 2-cell campus
building rows [NAME | maps-url address] rendered into the featured card's
MORE/LESS dropdown, wired in block JS; a trailing empty `.sub-item` spacer is
BLOCK-emitted for replica grid parity — the fingerprint's image-less/empty
sub-item is also tolerated on the decode side); `link-list (thumbs)` (donors
gifts-at-work — icon-circle head row + subtext + image link rows + trailing
list CTA). All per-block AND whole-page `block-roundtrip` runs exit 0 on the
three pages (per-instance maps recorded in the runs; the prototypes carry no
`data-section` on the EndCancer/newsletter chrome, mapped via `data-canon`).

- **Reused-block additions (§12 pattern, marked banners in the owning files;
  regression roundtrips re-run clean on index, prevention-screening, research,
  patients-family, breast-cancer, breast-center, clinical-trials):**
  - `cards.css`: `give` (donors stacked promo duo, purple/green), icon-circle
    palettes `resources` (about orange/lightblue/green), `visitor`
    (our-locations purple/red/blue-promo), `help` (donors orange/green/
    lightblue), `quicklinks` (about rail blue-promo/orange/green); `tinted`
    gray section ground via `:has()`; `icon rail` = about mission prose+rail
    pairing (2fr/1fr section grid, gray rail); icon-card body/CTA typography
    + wave-2 cicon codepoints + trio card dividers.
  - `cards.js` (additive): a CTA is an anchor ALONE in its paragraph — body
    paragraphs may carry inline links (our-locations Directions app-store
    links) and are kept as body copy; whitespace separators in whole-card
    anchors (title/body word separation for classification).
  - `columns.js/.css` (additive): `promo` (about split bands — promo type
    ramp + red arrow/linkout CTA), `center`, `tinted`; `wrapNowrap` no longer
    wraps HEADINGS in the generic path (their replica headings use `&nbsp;`,
    a span split the classified heading text) — the index `badge` path keeps
    wrapping (its replica heading carries span.nowrap).
  - `hero.css` (additive): `static:not(.compact)` = 276px band, 50% scrim,
    mobile 100px/24px (about + our-locations full title-band heros).
  - `link-list.js/.css` (additive): row thumbnails inside link anchors
    (our-locations partner rows + thumbs), `thumbs` variant, `external` head
    styling (cancer-network DC head), donors give-columns pairing
    (`.section.cards-container.link-list-container` grid).
  - `promo-band.js/.css` (additive): external CTAs render the linkout glyph +
    a `.visuallyhidden` "Opens a new window" span (replica parity); `left` =
    donors campaign-band full-bleed image + gradient scrim + overlaid panel.
- **Media**: about + our-locations staged from local migrated assets
  (`media-staging/{about,locations}/`); donors images downloaded with a
  real-Chrome UA + referer (all 200 after following 301s) into
  `media-staging/donors/`; the campaign `lvpimage...png` is actually JPEG —
  staged as `campaign-1400.jpg`.
- **Deliberate drops** (locked in §1/§6 or replica artifacts): More/Less
  prose expanders (about mission, our-locations locations MORE/LESS is the
  ONE kept expander — block-owned UI, authored content fully expanded);
  donors innovation video machinery (play button, YouTube id, poster caption)
  — §6.11 locks the section as `columns` image band, poster authored as the
  image; the badge-band mobile crop (`badges-496`) — single desktop image
  authored, scales down; sticky appt bar / chat / drawer replica widgets (§1);
  urldefense wrappers on the two app-store links (unwrapped, §12 precedent).
- **Known harness limits re-confirmed** (not defects): section-style classes
  (dark/lede/bleed) are pipeline-rendered so the harness shows unstyled
  bands; content.da.live images 401 anonymously; chrome header/footer render
  empty (qa-gate ✗ ×2/page); the order-based schema unit matcher misaligns
  (about `mission-vision-values` ≥4 vs 3 rail cards; donors help-trio/
  highlight/global-footer shifted) — actual unit counts verified by DOM
  probe: mission 5 uls/15 lis/3 h2s + 3 rail cards in a 2-col grid; donors
  give 2 + thumbs 3 + trio 3 + closing 3; our-locations 7 sub-items (1 empty
  spacer) + 7 dropdown buildings + 7 partner rows (4+3) + MORE/LESS drive
  toggles; exactly one h1 per page.
- **Location metadata contract**: NOT applied — our-locations is a listing
  page; §9 locks the city/address/phone rows to production location DETAIL
  pages only (none in the POC).

## 13. Editorial-cluster notes (cancerwise listing + insomnia article, written 2026-08-20)

Converted per §5/§6.9–6.10: `article-header` (new block, template-slotted, own
share-modal machinery), `search (blog)`, `article-cards (featured / rail-tab /
topic / rail)`, `cards (ribbon)`, `newsletter (focused)`, `section-nav (topics)`,
`callout (boxed)` finalized to the prototype spec (red 1.5px border, 5px radius).
All per-block AND whole-page `block-roundtrip` runs exit 0 on both pages;
index / breast-cancer / clinical-trials regression roundtrips re-run clean
after the shared-block edits (the index whole-page run shows a pre-existing
default-selector artifact: `.banner` matches the contact-strip; with
`--map banner=[data-section="alert-band"]` the banner closes clean).

- **Tab grouping (rail-tab/topic)**: consecutive instances in one section are
  grouped client-side — the FIRST instance builds the tab UI; each later
  instance's whole BLOCK element becomes its panel and moves into the group
  (element survives → runtime lifecycle + roundtrip tags intact); the emptied
  wrapper is removed. Non-active panels park offscreen
  (`position:absolute; visibility:hidden`), NOT `display:none`, so grouped
  blocks keep a rendered box for the QA probes; visual parity identical.
  First instance = active (§7). Topic panels carry the replica's two trailing
  CTA buttons ("Read more …" / "Subscribe …") as link-only rows (no heading);
  card rows are heading-bearing rows.
- **Topic → color map** (closed set, §7): CSS classes are the CANONICAL slugs
  (`diagnosis-treatment`, `patients-caregivers`, `healthy-living`, `research`,
  `expert-insights`, `philanthropy` — matching the §9 category metadata /
  helix-query contract), mapped from display text in article-cards.js
  (`Patient & Caregiver Stories` → patients-caregivers).
- **blog-article template layout** lives in blocks/section-nav/section-nav.css
  (EDITORIAL banner, §12 pattern): 240px/1fr grid keyed off
  `.section-nav-container`; the article-body section (the page's only
  `.quote-container`) is a nested grid — article column left, rail (feature
  image / quote / 3 story promos / focused signup) right, explicit grid-rows;
  last two sections full width. blog-listing styles (cw-hero 125px wordmark,
  `h1 em` red accent) ride blocks/search/search.css (`body.blog-listing`
  scoped). Marked banners also appended to article-cards / cards / newsletter
  CSS.
- **Article promos**: authored as THREE single-card `cards (icon, rail, story)`
  instances (§6.10 "singles" honored — also keeps the roundtrip's positional
  pairing 1:1); circle colors ride the authored icon via
  `:has(.cicon-*)` (green/blue/purple), dividers ride wrapper adjacency.
- **"More stories from Cancerwise" head**: authored as DC (trailing h2 of the
  prose wrapper); the `rail` variant REABSORBS it at decorate time so the
  decorated DOM matches the replica's `.at-article-list` (h2 inside).
- **Article metadata (B2 contract)**: author / publishdate 2026-06-08 (ISO) /
  category `expert-insights` (editorial call — the piece is expert
  side-effect-coping advice, same genre as the replica's expert-insights tab
  items; no category is exposed in the capture) / image (DA feature URL) /
  readtime 8 / reviewer / reviewdate, matching helix-query.yaml selectors.
- **Media**: listing images staged from migrated assets (best-res 2x variant)
  under media-staging/cancerwise/ (47 files incl. the og card); article feature
  image + 5 more-stories thumbs downloaded (Chrome-UA + referer, all 200) to
  media-staging/insomnia/ (6 files). No live-CDN URLs kept.
- **Redirects**: /cancerwise.html → /cancerwise and the article's `.h00-…`
  dotted leaf → /cancerwise/how-to-cope-with-insomnia-during-cancer-treatment
  (Gate 3), recorded in stardust/redirects.tsv.
- **Deliberate drops** (replica artifacts): scrollToTop / chat-widget /
  mda-drawer replicas (§1); the Adobe-Target `<style>` text inside the Top
  Stories panel (code-as-text, D15 — flagged 🟡 MISSING BODY in the roundtrip,
  correct); the blog search's separate visually-hidden label ("Search UT MD
  Anderson") — the input's aria-label derives from the placeholder; featured
  summary links' target/rel wrappers stripped; the pull quote is hidden ≤991px
  per the live 360 DOM (CSS only — content stays authored).
- **Known harness limits hit** (same classes as §12, not defects): chrome
  header/footer empty (qa-gate ✗ ×2/page); section-metadata (`tinted`) and the
  body template classes are pipeline-rendered, so the harness shows the
  listing hero unstyled and the article single-column; content.da.live images
  401 anonymously; qa-gate's order-based schema matcher misaligns on the giant
  blog-listing/blog-article schema sections — actual unit counts verified by
  probe (featured 1, Latest 6 / Top 5, 6 topic tabs × 8 cards + 2 CTAs,
  ribbon 3, closing 3, article: 94 topic-tree links, rail 5, promos 3,
  exactly one h1 per page; tab switching + topics accordion driven and
  asserted).
