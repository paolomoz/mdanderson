# Dynamic blocks map — mdanderson.org EDS POC (Phase B2)

**Written by:** stardust:deploy central Steps 1/2/2b run, 2026-08-20.
**Scope decision (applies to every block below):** ALL listing-candidate blocks ship **STATIC (editorial)** in this 12-page POC. A `query-index.json` built over 12 published pages would contain at most 1 article and 0 location detail pages — every dynamic rail would render near-empty. The authored rows ARE the POC content; the production path per block is documented so flipping to index-driven is a decode-side change only (the authored shape already mirrors the index row shape).

The `<meta>` contract rows below are ALSO recorded in `stardust/eds-conversion-log.md` §9 — page agents emit them in each page's metadata block NOW, so the indices are turnkey later.

---

## 1. `article-cards` (all variants) — the article-listing family

Instances: breast-cancer `featured-articles` (grid, 8), clinical-trials `in-the-news` (news, 2) + `faculty-experts` (experts, 2), cancerwise `featured` / `rail-tab` (Latest ×5, Top ×5) / `topic` (6 tabs × 8), article `more-stories` (rail, 5).

- **POC:** static rows: image | title+href | category | date | summary (variant-dependent subset).
- **Production path:** reads `/cancerwise/query-index.json` (draft `helix-query.yaml` at repo root, scoped `/cancerwise/**`).
  - `grid`/`news`/`rail` variants: filter by `category` (or a `tags` row authored in the block as config), sort `publishdate` desc, limit N.
  - `topic` tabs: one fetch, group by `category` (closed set: diagnosis-treatment, patients-caregivers, healthy-living, research, expert-insights, philanthropy).
  - `rail-tab` "Top Stories": needs a popularity signal the index cannot supply — stays editorial (curated rows) even in production; "Latest" flips to index-driven.
  - `experts`/`featured`: editorial curation candidates — keep authored rows, or author just the article URLs and hydrate title/image/description from the index (recommended hybrid).
- **Card fields needed:** `path`, `title`, `image`, `description` (summary variants), `publishdate` (rendered "August 19, 2026"), `category` (+ color class), `author` (byline variants).
- **`<meta>` contract (article pages):** `author`, `publishdate` (ISO yyyy-mm-dd), `category` (one of the closed topic set), `image` (feature image), `readtime`, `reviewer`, `reviewdate`, plus stock `title`/`description`.

## 2. `locations` (our-locations houston campus block)

- **POC:** static rows (campus card: image | name+url | address+maps-url; sub-location rows: name | maps address link).
- **Production path:** a locations index — either `helix-query.yaml` scoped to `/about-md-anderson/our-locations/**` (location detail pages) or a DA sheet (`/data/locations.json`) while detail pages don't exist. Card fields: `name`/`title`, `city`, `address`, `phone`, `mapsUrl`, `image`, `path`.
- **`<meta>` contract (location detail pages, production):** `city`, `address`, `phone`, `image`, `type: location`. No POC page is a location detail page; the contract is recorded so the first location page authored is index-ready.

## 3. `carousel` (highlights — index, patients-family, research)

- **POC:** static rows (image | caption | url).
- **Production:** stays **editorial/curated** — the replica's highlights mix newsroom, cancerwise, podcast and campaign URLs; no single index covers them and curation is the point. Not a query-index consumer. (If ever automated: union of `/cancerwise/**` + `/newsroom/**` indices, curated allowlist.)

## 4. `link-list (thumbs)` (donors gifts-at-work) and `cards (icon, rail)` promos

Editorial by nature (hand-picked cross-links with bespoke copy) — static in POC and production. Listed here only to close the triage: they LOOK like listing rails but are not index candidates.

## 5. `section-nav (topics)` (article page topic-filter tree)

- **POC:** static authored tree (~98 category links with counts — counts will drift; accepted).
- **Production:** render from `/cancerwise/query-index.json`: group by `category`, count per group, link to the category listing route. This removes the drift and the 98-link authoring burden.

## Production index summary

| Index | Source scope | Consumed by | Status |
|---|---|---|---|
| `/cancerwise/query-index.json` | `/cancerwise/**` (exclude `/cancerwise` listing page itself) | article-cards (grid/news/rail/topic/latest), section-nav (topics) | **draft `helix-query.yaml` committed at repo root (marked DRAFT — do not rely on it until the site has enough published articles)** |
| locations index / sheet | `/about-md-anderson/our-locations/**` or DA sheet | locations | documented only — no artifact yet (no location detail pages exist) |
