# mdanderson.org → Edge Delivery Services — Migration Implementation Plan

Prepared 2026-08-21 from live-site discovery (sitemaps, 40+ sampled pages, full
Tealium container audit). Builds on the delivered POC
(https://main--mdanderson--paolomoz.aem.page/ — 12 pages, 27 blocks, 11
archetypes at 1.6–4.4% pixel diff).

---

## 1. URL inventory

**Source:** 5 sitemaps declared in robots.txt (`sitemap.xml`, `newsroom-`,
`cancerwise-`, `cancer-types-`, `treatmentoptions-sitemap.xml`).
**Full list:** [`urls-all.txt`](urls-all.txt) (10,130 unique URLs, deduped);
per-section splits in [`urls-by-section/`](urls-by-section/).

| Section | URLs | Notes |
|---|---:|---|
| cancerwise | 3,401 | Blog articles + landing |
| newsroom | 2,191 | Press releases + year/month archives (2020→) |
| research | 2,159 | 1,813 departments-labs-institutes · 324 research-resources (269 core facilities) · 21 research-areas |
| publications | 917 | **802 promise/\* are 301 → /cancerwise.html — redirect rules only, no page migration** |
| education-training | 440 | clinical-training 172 · research-training 108 · degree-granting-schools 105 |
| cancer-types | 346 | ~80 diseases × landing/symptoms/diagnosis/treatment subpages |
| patients-family | 303 | diagnosis-treatment 237 |
| about-md-anderson | 230 | business-legal 63 · facts-history 54 · employee-resources 43 |
| donors-volunteers | 49 | |
| treatment-options | 40 | |
| prevention-screening | 35 | |
| for-physicians | 18 | flag: residual-cancer-burden.html may embed a calculator app |
| podcast | 1 | |
| **Total sitemap** | **10,130** | **Effective migration corpus ≈ 9,330** after promise redirects |

**Not in any sitemap — dynamic page families (must be planned separately):**

| Family | Volume | URL pattern | Backing system |
|---|---:|---|---|
| Faculty profiles | ~1,630 | `faculty.mdanderson.org/profiles/{first_last}.html` | FIS (Faculty Information System) via Mindbreeze index `fis_profile_prod` |
| Clinical-trial details | ~2,560 | `.../clinical-trials-detail.ID{protocol}.html` (Sling selector) | CTMS feed rendered by one AEM page |
| Search results | 1 app | `/patients-family/search-results.v2.html?q=` | Mindbreeze |

Freshness (main sitemap lastmod): 2,279 pages touched in 2026, 491 in 2025 —
over half the core corpus is actively maintained. Depth is shallow: 89% of
URLs are ≤4 path segments.

robots.txt exclusions to honor (do not migrate): `/gifts/`, `/lookups/`,
`/patient-education/`, owners-design-guidelines assets, legacy transcripts.

---

## 2. Page types and blocks

Templates were identified from AEM body classes (the site exposes no
data-template attribute). Seven page types cover the corpus — six already
proven in the POC plus one new.

### Template → page-type matrix

| AEM template (body class) | Sections | EDS page type | Est. volume |
|---|---|---|---:|
| `blogpage` / `cw-v3 blogpage` | cancerwise | **article** / **listing** (landing) | ~3,400 |
| `newsarticlepage` | newsroom releases + archives | **article** (release) / **listing** (year/month archives) | ~2,190 |
| `leftnavdetailpage` | department landings | **program** (department-hero variant) | ~250 |
| `leftnavsubpage` | dept deep pages, edu programs, research-areas | **program** / **static** | ~1,900 |
| `leftnavpage` | about, patients-family, treatment-options, for-physicians | **static** | ~590 |
| `basepage` | section landings, research-resources, donors, prevention, podcast | **landing** (roots) / **static** (leaves) | ~400 |
| `diseaselandingtemplate` / `diseasetreatmenttemplate` | cancer-types | **disease (NEW)** | 346 |
| SFMC form pages | scattered | **form** | small |

**New page type — `disease`:** cancer-types pages have dedicated AEM templates
with fixed slots (clinical-trials callout in left nav, featured-articles rail,
appointment CTAs) — too structured for `static`. One archetype covers landing +
symptoms/diagnosis/treatment subpages.

### Blocks

**Already implemented (27, POC-proven):** accordion, article-cards,
article-header, banner, breadcrumbs, byline, callout, cards, carousel, columns,
footer, fragment, header, hero, icon-wells, link-list, locations, newsletter,
podcast, promo-band, quote, search, section-nav, share, stats, video, widget.

**Net-new blocks required (3):**

| Block | Driver | Notes |
|---|---|---|
| **tabs** | cancerwise landing 6-topic tabbed collection | only true structural gap |
| **table** | styled content tables (parking rates, etc.) | EDS auto-blocks tables; needs styling + variants |
| **sticky-cta** | Call / Request-appointment sticky rail on patient-facing pages | conditional per page type; metadata-driven |

**Variants of existing blocks (3):**

| Variant | Base block | Driver |
|---|---|---|
| department-hero | hero | lab hero with chair/contact overlay (leftnavdetailpage) |
| contact-card | callout/columns | newsroom media-specialist sidebar |
| clinical-trials-callout | callout | left-nav box on disease subpages |

**Global chrome (all pages):** mega-nav header + search, breadcrumbs,
pre-footer #EndCancer promo band, footer with SFMC newsletter form,
back-to-top. All covered by existing blocks. **Header alert banner is an
uncached AEM include (`alert.nocache.html`) — becomes a client-fetched
fragment in EDS** so alerts publish instantly without full-site republish.

---

## 3. Integrations and dynamic blocks

### 3a. The central integration: Mindbreeze search appliance

One Mindbreeze InSpire appliance (GSA/GSP XML protocol, proxied same-origin)
powers **three** user-facing search products:

| Product | Endpoint | Index (collection) | Volume |
|---|---|---|---:|
| Site search (`search-results.v2.html`) | `/search`, `/search2` | `mda_aem_prod` | full site |
| Find a doctor (faculty.mdanderson.org) | `/search-fis` | `fis_profile_prod` | ~1,630 |
| Clinical-trials search | `/search-clinicaltrial` | `mda_aem_prod AND pagetype:clinical trial` | ~2,560 |

**This is the largest integration decision of the migration.** Options:
1. **Keep Mindbreeze, proxy through EDS** — CDN/edge rule forwarding
   `/search*` paths to the appliance; rebuild the three search UIs as EDS
   blocks calling the same XML API. Lowest risk; appliance must re-crawl the
   EDS-rendered pages (or ingest the query-index).
2. **Replace with EDS query-index + client search** for site search, keep
   Mindbreeze only for faculty/trials (which index non-web sources: FIS, CTMS).
3. Full engine swap (Algolia/Coveo) — out of scope unless the appliance
   contract is ending.

Recommendation: option 1 for cutover, evaluate option 2 as fast-follow.

### 3b. Dynamic page families

| Family | Strategy |
|---|---|
| Clinical-trial details (~2,560) | **Pre-generate as EDS pages** from the CTMS feed (feed→DA importer on a schedule), indexed via query-index. Volume is well within EDS norms and gives SEO + speed. Alternative: edge-worker dynamic rendering. |
| Faculty profiles (~1,630) | Phase 1: stays on faculty.mdanderson.org (linked). Phase 2 decision: FIS→DA generation like trials, or edge worker over FIS. |
| Header alerts | EDS fragment fetched client-side (replaces `alert.nocache.html`). |

### 3c. Listing blocks → EDS query-index contract

All current listings are **server-rendered by AEM content queries** — none are
client-fetched today. In EDS they become blocks reading `query-index.json`
(helix-query.yaml scoped indexes). Metadata tiers per the dynamic-listings
contract (Tier 2 fields must be authored as page metadata **before bulk
import** — retrofitting is a second migration):

| Listing block | Index scope | Tier-1 (DOM) | Tier-2 (metadata contract) |
|---|---|---|---|
| cancerwise landing + topic tabs | `/cancerwise/**` | title, image, description | `publish-date`, `topic` (6 topics), `read-time`, `medically-reviewed` |
| related-articles rails (disease + article pages) | same index | title, image | `topic`, `cancer-type` |
| newsroom listing + year/month archives | `/newsroom/**` | title, description | `publish-date`, `release-type` |
| featured-articles on disease pages | cancerwise index | title, image | `cancer-type` join field |
| departments A–Z | `/research/departments-labs-institutes/**` | title | `division`, `letter` |
| clinical-trials listing | `/patients-family/**/clinical-trials/**` | title | `protocol-id`, `phase`, `disease`, `status` |
| cancer-types typeahead | currently a static XML file | — | trivially replaced by `/cancer-types/` query-index |

Tier-3 (stay static until modeled): faculty-to-department relationships
(currently authored accordion links — keep authored).

Artifacts to produce at prep time (prepare-migration Phase 4.5):
`stardust/dynamic-blocks-map.md` + `helix-query.yaml` with 4 scoped indexes
(cancerwise, newsroom, cancer-types, clinical-trials).

### 3d. External systems (linked — no rebuild)

| System | URL | Platform |
|---|---|---|
| Appointment request / patient portal / physician referral | my.mdanderson.org | **Epic MyChart** — link-only |
| Careers | jobs.mdanderson.org | external career-site platform (Recruitics, own Tealium profile) |
| Donations | gifts.mdanderson.org | legacy ASP.NET giving app (robots-excluded) |
| Store | shop.mdanderson.org | external commerce |
| Education catalog | www.mdanderson.edu `/api/publiccatalog/v1/` | .edu API (only if surfaced) |
| Podcast feed | doctorpodcasting.com | embed/link |
| Campaign microsites | onlypossiblehere.mdanderson.org | separate |

### 3e. Forms

- Footer newsletter: small EDS form block POSTing to the existing **SFMC**
  endpoint (form action already public).
- Inline article forms: **FormAssembly** (`mdanderson.govfa.net` workflow
  processor) — EDS form block posting to same endpoint; load wforms.js lazily
  only on pages with forms.

---

## 4. Martech assessment

Full audit: Tealium container + all 37 tag payloads inspected.

### Stack summary

| Layer | Tool | Evidence |
|---|---|---|
| Tag manager | **Tealium iQ** (not Launch) | `tags.tiqcdn.com/utag/mdanderson/mdandersonorg/prod` — **`utag.sync.js` 46 KB render-blocking in `<head>`; utag.js 404 KB sync; ~975 KB total Tealium JS** |
| Analytics | Adobe Analytics (legacy AppMeasurement 2.9.0) | rsid `mda.www`, first-party `stats.mdanderson.org` |
| Analytics (migration in flight) | **AEP Web SDK / alloy dual-tag** | org `13664673527846410A490D45@AdobeOrg`, prod datastream `9a7a2f87-…` |
| Analytics | GA4 | `G-F59JGPSZ6R` (+ duplicate `G-E3Z52F3KSB`) · Siteimprove hardcoded |
| Personalization | **Adobe Target at.js 2.9.0** (`mdanderson.tt.omtrdc.net`) **and** SFMC Personalization/Evergage (hardcoded, sync) | two overlapping tools |
| Identity | ECID/VisitorAPI in render path + Audience Manager demdex ID-syncs | superseded by Web SDK |
| VoC | Verint/ForeSee **and** Qualtrics | two overlapping tools |
| Chat | Loyal Health "Guide" chatbot | every page |
| Call tracking | Invoca | feeds ad pixels |
| Consent | **None. No CMP; tags fire unconditionally.** | |
| Data layer | Tealium `utag_data`: `page_name`, `page_section`, `page_category`, `page_subcategory1..N`, `Language`, `Device` | rebuild in EDS |

### 🔴 Compliance red flags (surface to client before any tag porting)

1. **Ad pixels transmit care-seeking signals with no consent gating**: Adform
   (20 trackpoints incl. "Schedule Appointment Confirmation – Self Referral",
   "Schedule Mammogram Start"), Google Floodlight (DC-15344997 + 11438913),
   Google Ads, Trade Desk, StackAdapt, Bidtellect, Pandora/AdsWizz, Adobe Ad
   Cloud — several mapped with **appointment confirmation numbers + ECID**.
   Direct exposure under OCR tracking-technology guidance. **Default plan:
   do not port; anything legal clears gets a CMP + delayed-phase load.**
2. **Leaked credential**: ipstack API key hardcoded in utag.js
   (`6793a398…`) — rotate regardless of migration.
3. Soft-404 pattern (200 + canonical → /errors/404.html) — replace with real
   404s in EDS.

### EDS instrumentation plan (three-phase loading)

- **Eager/lazy: zero third-party JS.** This stack is a primary cause of
  current poor performance; EDS wins are forfeited if it's ported as-is.
- **delayed.js**: single **AEP Web SDK (alloy)** call to the existing prod
  datastream (routes to rsid `mda.www` via datastream mapping — completes the
  in-flight AppMeasurement→alloy migration); GA4 (one ID); Siteimprove
  (optional); Loyal Health chat loaded on first interaction/scroll;
  one VoC tool (consolidate ForeSee vs Qualtrics).
- **Rebuild data layer** mapping `utag_data` keys → XDM in the datastream.
- **Drop**: utag.sync.js, VisitorAPI/AAM syncs, everestjs, duplicate GA4,
  ipstack, at.js client-side (if personalization is required, use EDS
  experimentation plugin or Target via Web SDK, decided per use case;
  Target vs Evergage overlap needs an owner decision).
- **Ad pixels**: blocked on legal review + CMP implementation (see red flags).
- **SEO parity**: recreate JSON-LD (MedicalOrganization, BlogPosting +
  Speakable, SiteNavigationElement), OG/Twitter meta, self-canonicals via
  metadata + auto-blocks; add hreflang if/when Spanish content ships (none in
  current sitemaps).

---

## 5. Implementation phases

**Phase 0 — Foundations (wks 1–2)**
Repo/DA project hardening from POC; `helix-query.yaml` (4 scoped indexes);
metadata contract finalized (§3c — before any bulk import); header-alert
fragment; sticky-cta/tabs/table blocks + 3 variants; disease archetype;
martech decision workshop (consent/pixels — legal), Mindbreeze proxy decision.

**Phase 1 — Long-tail static + editorial pilot (wks 3–6)**
Bulk import via `$stardust prepare-migration` → `$stardust migrate` +
`rollout`: about-md-anderson, patients-family, treatment-options,
prevention-screening, for-physicians, education-training, research-resources
(~1,570 pages, types static/landing/program). Import tooling maps AEM body
classes → page types automatically. QA gate: pixel-diff sampling per type
(POC method, ≤5% target).

**Phase 2 — Editorial at scale (wks 5–10, overlaps)**
cancerwise (3,401) + newsroom (2,191) with Tier-2 metadata emitted at import
time; query-index-driven listing blocks (tabs, archives, related rails);
802 promise redirects shipped as redirect rules.

**Phase 3 — Structured & dynamic (wks 8–12)**
cancer-types (346, disease type); departments-labs-institutes (1,813);
clinical-trials: CTMS feed→DA generator (~2,560 pages) + search block on
Mindbreeze API; site-search results app as EDS block.

**Phase 4 — Cutover (wks 12–14)**
Full-corpus link check + redirect map (incl. robots exclusions, soft-404
fixes); Mindbreeze re-crawl/re-point; DNS cutover www → EDS; martech delayed.js
live with CMP; faculty.mdanderson.org remains on current stack (phase-2
decision item).

Throughout: `stardust/state.json` remains the state machine; rollout dashboard
tracks per-page status.

---

## 6. Open decisions (blocking, need client/owner input)

1. **Mindbreeze**: proxy-and-keep vs partial replacement with query-index (§3a).
2. **Ad-pixel legal review + CMP selection** — gates all advertising martech (§4).
3. **Personalization**: Target vs Evergage vs neither on EDS.
4. **Faculty profiles**: stay on subdomain vs generate into EDS (phase 2).
5. **VoC consolidation**: ForeSee vs Qualtrics.
6. Font licensing (Minion/Univers) — carried over from POC open items.

## Appendix — artifacts in this folder

- `urls-all.txt` — 10,130 sitemap URLs (deduped master list)
- `urls-by-section/*.txt` — per-section splits
