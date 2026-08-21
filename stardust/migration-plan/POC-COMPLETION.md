# POC Completion — Definition of Done

Companion to [PLAN.md](PLAN.md). The delivered POC (12 pages, 27 blocks, 6 page
types, replica ≤4.4% pixel diff) proves the *static* migration path. Completing
the POC means proving the remaining risk areas end-to-end at sample scale:
**all 7 page types, the dynamic/query-index machinery, every integration
pattern, and instrumented martech** — on 70 sample pages (10 per type).

---

## Workstreams

### A. Blocks & page types (closes the authoring gap)

| Item | What | Size |
|---|---|---|
| `disease` archetype | New page type for cancer-types: landing + symptoms/diagnosis/treatment subpage layout; fixed slots (trials callout, featured articles, appointment CTAs) | 2–3 d |
| `tabs` block | Cancerwise landing 6-topic tabbed collection (query-index-fed, see B) | 1–2 d |
| `table` block | Styled content tables + variants (striped, header-col) | 0.5 d |
| `sticky-cta` block | Call / Request-appointment rail, metadata-toggled per page | 1 d |
| `hero` variant: department-hero | Lab hero with chair/contact overlay (leftnavdetailpage) | 0.5 d |
| `callout` variants: contact-card, clinical-trials-callout | Newsroom media-contact sidebar; disease left-nav trials box | 0.5 d |

### B. Dynamic foundation (query-index machinery)

1. **`helix-query.yaml`** with 4 scoped indexes: `/cancerwise/**`,
   `/newsroom/**`, `/cancer-types/**`, clinical-trials. Ship with repo.
2. **Metadata contract** emitted at import time (Tier-2, per PLAN §3c):
   cancerwise → `publish-date`, `topic`, `read-time`, `medically-reviewed`;
   newsroom → `publish-date`, `release-type`; cancer-types → `cancer-type`.
   Validate on the 70 samples — this is the contract the full migration rides.
3. **Convert listing blocks to index-driven**: article-cards gains a
   query-index mode (feeds cancerwise tabs, related-article rails, disease
   featured-articles); newsroom year/month archive block grouped by
   `publish-date`.
4. **Header-alert fragment**: client-fetched EDS fragment replacing AEM's
   `alert.nocache.html`; author a demo alert in DA.
5. **Cancer-types typeahead**: replace the static `cancertype-search.xml` with
   the `/cancer-types/` query-index (pure EDS, no external dependency).
Size: 4–5 d.

### C. Search integrations (Mindbreeze)

The appliance speaks GSA/GSP XML on same-origin proxy paths. POC goal: prove
EDS blocks can consume it without the appliance changing.

1. **Proxy**: CDN/edge rule (or dev-time worker) forwarding `/search*`,
   `/search-fis`, `/search-clinicaltrial` to www.mdanderson.org — POC can
   proxy against production read-only. 1 d.
2. **Site-search results block**: EDS page + block replacing
   `search-results.v2.html`; query `mda_aem_prod`, parse GSP XML, paginate.
   2–3 d.
3. **Clinical-trials search block**: same API, `pagetype:clinical trial`
   filter, typeahead. 1–2 d.
4. **Find-a-doctor (stretch)**: demo block against `fis_profile_prod`
   rendering faculty cards that link to faculty.mdanderson.org profiles
   (profiles themselves stay external — full decision deferred per PLAN §6).
   1–2 d.

### D. Clinical-trial detail pages (generator prototype)

Prove the feed→content path: importer that renders **10 sample trial detail
pages** (protocol IDs pulled from live `clinical-trials-detail.ID*.html`
pages) into DA with the trials metadata contract, indexed by query-index.
Establishes the pattern for all ~2,560 pages. 2–3 d.

### E. Forms

1. Footer newsletter → POST to existing SFMC endpoint (already public form
   action). 0.5 d.
2. One FormAssembly-embedded page (subscribe-to-cancerwise) posting to
   `mdanderson.govfa.net` workflow processor; script loaded lazily. 1 d.
3. One confirmation-page sample (ask-a-question/confirmation) to prove the
   conversion-event data-layer hook without ad pixels. 0.5 d.

### F. Martech instrumentation

Per PLAN §4 — POC ships the *target* stack, not the current one:

1. `delayed.js`: **AEP Web SDK (alloy)** to existing prod datastream
   `9a7a2f87-…` (org `13664673527846410A490D45@AdobeOrg`); GA4 `G-F59JGPSZ6R`.
2. Data layer: map `utag_data` keys (`page_name`, `page_section`,
   `page_category`, `page_subcategory1..N`, `Language`, `Device`) from EDS
   metadata → XDM.
3. Loyal Health chat: interaction-triggered load on one patient-facing sample.
4. **No ad pixels, no Tealium sync, no CMP** in POC — gated on legal review
   (PLAN §6.2); document the hook points.
Size: 2–3 d. Validate: events land in Analytics debugger; Lighthouse stays ≥90.

### G. Sample import & QA (the 70 pages)

Run the 70 samples below through `prepare-migration` → `migrate` → deploy to
`main--mdanderson--paolomoz.aem.page`. Gates per page type:
- pixel diff ≤5% @1440 vs live (replica method from POC)
- Lighthouse ≥90 mobile on 1 page per type (with martech F live)
- query-index listings render from real index data (no hardcoded cards)
- metadata contract present on all editorial/disease samples
Size: 3–4 d incl. fixes.

**Total: roughly 25–33 working days** (parallelizable across A–F; C and D can
run concurrently with A/B).

### Explicitly out of POC scope (full-migration items)
Bulk import of 9,330 pages · promise redirect map · faculty profile
generation · CMP + ad-pixel decisions · Mindbreeze re-crawl of EDS content ·
DNS cutover.

---

## Sample pages — 10 per page type (70 total)

All URLs verified against the sitemap inventory (except the 10 trial details,
which are dynamic/unlisted by design). Chosen to avoid the 12 already-migrated
pages and to maximize template/variant coverage.

### landing (basepage roots & hubs)
1. https://www.mdanderson.org/education-training.html (carousel hero + promo grid)
2. https://www.mdanderson.org/donors-volunteers.html
3. https://www.mdanderson.org/for-physicians.html
4. https://www.mdanderson.org/publications.html
5. https://www.mdanderson.org/about-md-anderson/careers.html
6. https://www.mdanderson.org/prevention-screening/get-screened.html
7. https://www.mdanderson.org/donors-volunteers/donate.html (inline video hero)
8. https://www.mdanderson.org/research/research-resources.html
9. https://www.mdanderson.org/education-training/degree-granting-schools.html
10. https://www.mdanderson.org/research/research-areas.html

### program (leftnavdetailpage / leftnavsubpage programs — incl. department-hero variant)
1. https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/abdominal-imaging.html
2. https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/behavioral-science.html
3. https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/breast-medical-oncology.html
4. https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/biostatistics.html
5. https://www.mdanderson.org/education-training/clinical-training/certificate-programs-review-courses/ahearn-educator-program.html
6. https://www.mdanderson.org/education-training/clinical-training/graduate-medical-education.html
7. https://www.mdanderson.org/education-training/research-training/career-development.html
8. https://www.mdanderson.org/research/research-resources/core-facilities/advanced-technology-genomics-core.html
9. https://www.mdanderson.org/research/research-resources/core-facilities/advanced-spatial-genomics-core.html
10. https://www.mdanderson.org/patients-family/diagnosis-treatment/care-centers-clinics/proton-therapy-center.html

### static (leftnavpage / leftnavsubpage content)
1. https://www.mdanderson.org/about-md-anderson/business-legal/code-of-ethics.html
2. https://www.mdanderson.org/patients-family/becoming-our-patient/getting-to-md-anderson/parking.html (table block)
3. https://www.mdanderson.org/treatment-options/brachytherapy.html
4. https://www.mdanderson.org/for-physicians/clinical-tools-resources/clinical-calculators.html (jQuery-UI accordion)
5. https://www.mdanderson.org/research/research-areas/basic-science.html
6. https://www.mdanderson.org/about-md-anderson/facts-history/institutional-profile.html
7. https://www.mdanderson.org/patients-family/becoming-our-patient/planning-for-care/virtual-visits.html
8. https://www.mdanderson.org/about-md-anderson/contact-us/helpful-phone-numbers.html
9. https://www.mdanderson.org/podcast.html
10. https://www.mdanderson.org/research/departments-labs-institutes/departments-divisions/anatomic-pathology.html (faculty-links accordion stress test)

### listing (query-index-driven — workstream B)
1. https://www.mdanderson.org/cancerwise.html (re-do with tabs + query-index; currently static in POC)
2. https://www.mdanderson.org/newsroom.html
3. https://www.mdanderson.org/newsroom/2024.html (year archive)
4. https://www.mdanderson.org/newsroom/2025.html
5. https://www.mdanderson.org/newsroom/2020/01.html (month archive)
6. https://www.mdanderson.org/research/departments-labs-institutes.html (A–Z index)
7. https://www.mdanderson.org/research/research-resources/core-facilities.html (269-item index)
8. https://www.mdanderson.org/research/research-resources/conferences-seminars.html
9. https://www.mdanderson.org/patients-family/search-results.v2.html (search app — workstream C)
10. https://www.mdanderson.org/patients-family/diagnosis-treatment/clinical-trials.html (re-do with live trials search — workstream C)

### article (5 cancerwise + 5 newsroom; exercises byline, med-review, contact-card, share, related rail)
1. https://www.mdanderson.org/cancerwise/-how-i-knew-i-had-colorectal-cancer---six-survivors-share-symptoms.h00-159781968.html
2. https://www.mdanderson.org/cancerwise/-drug-hunter--deploys-ai-to-accelerate-path-to-new-therapies.h00-159852189.html
3. https://www.mdanderson.org/cancerwise/-5-ways-our-social-work-counselors-can-help-during-cancer-treatm.h00-158988234.html
4. https://www.mdanderson.org/cancerwise/your-guide-to-walking-as-exercise.h00-159694389.html
5. https://www.mdanderson.org/cancerwise/zebrafish-photos-put-researcher-on-cutting-edge-of-science-and-photography.h00-159143667.html
6. https://www.mdanderson.org/newsroom/---md-anderson-s-institute-for-data-science-in-oncology-establis.h00-159698334.html
7. https://www.mdanderson.org/newsroom/---two-md-anderson-researchers-elected-aaas-fellows--.h00-159774867.html
8. https://www.mdanderson.org/newsroom/-md-anderson-research-highlights-for-january-12--2022.h00-159536589.html
9. https://www.mdanderson.org/newsroom/-patients-with-heart-disease-may-be-at-increased-risk-for-advanc.h00-159703068.html
10. https://www.mdanderson.org/newsroom/1-400--west-texans-support-md-anderson-at-39-th-polo-on-the-prai.h00-159775656.html

### form (SFMC + FormAssembly + confirmation patterns)
1. https://www.mdanderson.org/publications/subscribe-to-cancerwise.html
2. https://www.mdanderson.org/publications/subscribe-to-focused-on-health.html
3. https://www.mdanderson.org/publications/subscribe-to-frontline.html
4. https://www.mdanderson.org/publications/subscribe-to-leukemia-insights.html
5. https://www.mdanderson.org/publications/subscribe-to-proton-pals.html
6. https://www.mdanderson.org/about-md-anderson/contact-us/askmdanderson/ask-a-question.html
7. https://www.mdanderson.org/about-md-anderson/contact-us/askmdanderson/ask-a-question/confirmation.html (conversion-event hook)
8. https://www.mdanderson.org/newsroom/request-to-film-on-campus.html
9. https://www.mdanderson.org/donors-volunteers/other-ways-to-help/give-blood/contact-us.html
10. https://www.mdanderson.org/patients-family/diagnosis-treatment/care-centers-clinics/proton-therapy-center/contact-us.html

### disease (NEW page type — 4 landings + 6 subpages across the 3 subpage flavors)
1. https://www.mdanderson.org/cancer-types/lung-cancer.html
2. https://www.mdanderson.org/cancer-types/brain-tumor.html
3. https://www.mdanderson.org/cancer-types/acute-myeloid-leukemia.html
4. https://www.mdanderson.org/cancer-types/colon-cancer.html
5. https://www.mdanderson.org/cancer-types/lung-cancer/lung-cancer-treatment.html
6. https://www.mdanderson.org/cancer-types/lung-cancer/lung-cancer-symptoms.html
7. https://www.mdanderson.org/cancer-types/brain-tumor/brain-tumor-diagnosis.html
8. https://www.mdanderson.org/cancer-types/colon-cancer/colon-cancer-symptoms.html
9. https://www.mdanderson.org/cancer-types/bladder-cancer/bladder-cancer-treatment.html
10. https://www.mdanderson.org/cancer-types/acute-myeloid-leukemia/acute-myeloid-leukemia-diagnosis.html

Plus (workstream D, not sitemap URLs): **10 clinical-trial detail pages**
generated from live protocol IDs (`clinical-trials-detail.ID{protocol}.html`).

---

## Acceptance criteria (POC "done")

1. All 7 page types live on aem.page with ≥10 samples each, pixel diff ≤5%.
2. Cancerwise tabs, newsroom archives, related rails, and cancer-types
   typeahead render from `query-index.json` — zero hardcoded listings.
3. Site search + clinical-trials search return live Mindbreeze results
   through the EDS proxy.
4. 10 generated trial detail pages published from the feed prototype.
5. Newsletter (SFMC) and one FormAssembly form submit successfully.
6. alloy + GA4 events visible in debuggers; Lighthouse mobile ≥90 on one page
   per type with martech enabled.
7. Header alert demo publishes via fragment without site republish.
