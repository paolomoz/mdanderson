<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape (horizon track)
  writtenAt:        2026-08-21T11:40:00Z
  page:             index (horizon variant)
  pageUrl:          https://www.mdanderson.org/
  againstDirection: stardust/horizon/direction.md (Active 2026-08-21)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/wireframes/b-horizon.html
    - stardust/horizon/direction.md
    - DESIGN.json
    - stardust/prototypes/assets/uplift/mda-fonts.css
  stardustVersion:  0.18.1
-->
---
slug: horizon
url: https://www.mdanderson.org/
register: cinematic photography-led institutional (arrival)
surprise: high
fidelity: refined
---

# Page shape: horizon (homepage redesign prototype)

User-approved structure source: `stardust/wireframes/b-horizon.html`.
All copy verbatim from `current/pages/index.json` unless classified
otherwise below. "UT MD Anderson" naming carried as captured.

## Sections (in render order)

1. **pill-header** (system-component role: `header`; direction-authorized
   new — Lilly-model canopy replaces the captured utility-bar + red-nav
   chrome; justified by the direction's header movement, user-supplied
   reference screenshots 2026-08-21). Collapsed: two floating pills over
   the hero — left: wordmark "MD Anderson ~~Cancer~~ Center" (red strike =
   captured signature motif) + hamburger; right: search icon, MyChart,
   red pill CTA "Request an appointment." Expanded canopy: full-width
   dark rounded panel — wordmark, chip nav row (Home active · Patients &
   Family · Cancer Types · Clinical Trials · Research · Prevention ·
   Giving | ⚕ For Physicians), hairline divider, mega content: Minion
   brand statement "Making Cancer History®" + featured photo card
   (captured story poster). Radius 28–32px, backdrop blur, spring-eased
   open. `data-section="header" data-nav-collapse="canopy"`.

2. **hero** (consolidates captured `hero carousel` H1 + ranking link of
   `pages/index.json#headings[0]`) — 100vh full-bleed photograph
   (`assets/horizon/media/hero-together-2560.jpg`, PLACEHOLDER), bottom-
   anchored Univers 67 BoldCn display: "#1 in the nation for cancer care"
   (verbatim, "#1" in red), kicker "U.S. News & World Report · 12 years
   running" (direction-authorized rewrite of the captured ranking link
   text), CTA link "Learn more about this ranking" (captured), scroll cue.
   Deepening scrim toward baseline. `data-section="hero"
   data-intent="brand-claim" data-layout="full-bleed"
   data-media="background-image"`.

3. **care-finder** (consolidates captured `icon-wells` search trio +
   `dark` contact strip) — white panel breaking the hero's bottom edge
   (radius 24px, deep soft shadow): 56px search input "Search cancer
   types, clinical trials or doctors…" (direction-authorized affordance
   over the captured two search wells) + red submit; quick chips (Breast
   cancer · Lung cancer · Leukemia · Open clinical trials · Screening &
   prevention — direction-authorized wayfinding shortcuts); footer row
   verbatim: "We're here for you." + "Call us at 1-877-790-1139" +
   "request an appointment online." `data-section="care-finder"
   data-intent="wayfinding" data-interactive="static-search-input"`.

4. **chapter-rail + chapter-01 your-care** (consolidates captured `icon-
   wells` Plan Your Care column: Prepare for your first visit / Check
   Insurance Coverage / Plan Travel and Lodging — verbatim H3/H4 + body) —
   sticky left rail (01–04 index, red active state); right: kicker
   "01 · Your care", H2 (direction-authorized: "From first visit to full
   plan, we walk with you"), wide photograph
   (`care-bedside-2000.jpg`, PLACEHOLDER) with three white cards
   overlapping its lower edge (radius 18px). `data-section="chapter-care"
   data-intent="wayfinding" data-layout="asymmetric" data-items="3"`.

5. **chapter-02 why** (consolidates captured `columns badge` "Why Choose
   UT MD Anderson" H1 + body + US News badge) — dark ink band: kicker
   "02 · Why MD Anderson", H2 verbatim "Why Choose UT MD Anderson", stat
   pair (#1 red / 15 years — captured credential numerals), captured body
   paragraph verbatim, link "Learn more about UT MD Anderson" (captured);
   right: photograph (`why-hands-1600.jpg`, PLACEHOLDER, radius 20px).
   `data-section="chapter-why" data-intent="credibility"
   data-layout="two-column"`.

6. **chapter-03 stories** (consolidates captured `video feature` +
   `carousel` UT MD Anderson Highlights, 8 items) — kicker "03 · Stories",
   H2 (direction-authorized: "People are the proof"), horizontal filmstrip
   (scroll-snap, drag): lead film = captured video feature (story poster
   `story-father-1444.jpg`, verbatim H3 "Father inspires daughter's career
   path at UT MD Anderson", "Watch the video" → captured YouTube URL);
   then 8 highlight films, titles + deks verbatim, thumbs from captured
   `hl-*.jpg` (251×141 — used small over placeholder portrait grounds
   where the film needs height: `film-*.jpg` PLACEHOLDERS). Radius 20px,
   gradient scrims, film text on-image. `data-section="chapter-stories"
   data-intent="editorial" data-layout="filmstrip" data-items="9"
   data-interactive="scroll-snap"`.

7. **chapter-04 take-action** (consolidates captured `banner red` blood
   drive + `Help #EndCancer` trio: Give Now / Donate Blood / Shop UT MD
   Anderson — all verbatim) — full-bleed photograph
   (`act-heart-hands-2400.jpg`, PLACEHOLDER) under a red duotone scrim;
   kicker "04 · Take action", H2 verbatim "Help #EndCancer"; lead tile =
   blood drive (verbatim H3 "Donate blood. Save a life." + body + CTA
   "Schedule a blood donation appointment" → mdandersonbloodbank.org);
   tiles 2–3 Give Now / Shop (verbatim + captured hrefs). Hairline
   white-on-red borders, radius 18px. `data-section="chapter-act"
   data-intent="conversion" data-layout="three-column" data-items="3"`.

8. **support-and-newsletter** (consolidates captured `cards promo duo
   support` myCancerConnection + One-on-One Counseling, `icon trio` Find
   Our Locations / Read Our Blog / Ask a Question, and `newsletter
   cancerwise`) — paper ground: two support cards (verbatim H3s + body)
   + pill link trio; right: Cancerwise subscribe panel (H2 direction-
   authorized: "Cancer information that helps, weekly"; input + red
   submit). `data-section="support-newsletter" data-intent="support-
   services" data-layout="two-column" data-items="5"`.

9. **footer** (system-component role: `footer`; carried from captured
   chrome) — dark ink, captured footer logo (`footer-logo.webp`), column
   directory from captured nav/link inventory, legal line verbatim.
   `data-section="footer"`.

## Layout strategy

1440-first, max content width 1360px, generous 56px gutters. Chapters
carry a persistent left rail from section 4 onward (desktop only; rail
hides ≤1024px). Full-bleed photographic bands alternate with contained
panels. Corner system: pills 999px / panels 24–32px / cards+films 18–20px
/ buttons 999px. Borders: hairlines only (1px rgba-ink-12 on paper,
rgba-paper-25 on ink/red). Shadows: two-tier (ambient 30/60px soft +
key 8/20px), never harsh.

## Type system

- Display: Univers 67 BoldCn, tight leading (0.98), -0.5% tracking,
  clamp(56px → 108px) hero; chapter H2 clamp(40px → 64px).
- Editorial serif: Minion (canopy statement, film titles at lead scale).
- Body/UI: Univers 55 Roman 16–17px / 45 Light for deks; kickers Univers
  65 Bold 12px, letterspacing .22em, uppercase, red.
- Numerals (stats): Univers 67 BoldCn, tabular where inline.
- Scale ratio ≥1.25 enforced.

## Key states & interaction model

- Canopy: closed by default; opens on burger (spring 320ms cubic-bezier
  (.32,.72,.22,1)); ESC + scrim click close; focus-trapped; `aria-expanded`.
- Search input: focus ring 2px red offset 2px.
- Films: scroll-snap-x, drag with inertia (native), hover lift 6px +
  shadow deepen 240ms.
- Cards/CTAs: hover raise 2px + shadow, active press 1px; red CTA darkens
  to #b31f14 on hover.
- Sticky rail: active chapter tracked via IntersectionObserver (cinematic
  file); static file shows 01 active.

## Motion stack (cinematic sibling)

Register `arrival` (heuristic per uplift precedent; source: direct).
Lenis (assets/uplift/lenis.min.*) + canonical runtime. [data-anim]
fade+rise on section heads, body, CTAs, cards; [data-countup] on #1/15;
[data-parallax] hero photograph (−30vh, deepening scrim); rising-plate
on care-finder. `prefers-reduced-motion` complete; `<noscript>` fallback;
`html.js-anim` gate class set inline in head.

## Discipline 2 — Anti-template pass

- **hero composition** — reflex: centered-stack + two-button pair.
  Alternatives: (a) bottom-left anchored single-CTA display over 100vh
  photo (Superpower/Inversa refs), (b) split photo/type hero, (c) type-
  only red hero. Picked (a): the wireframe's approved shape; photography
  is the direction's thesis. Ref: refero Superpower 589c0a33, until
  84e6872b.
- **search wells** — reflex: 3-up icon-well band (captured shape).
  Alternatives: (a) single hero-breaking finder panel with chips,
  (b) sticky search in header, (c) directory columns. Picked (a):
  consolidates two captured search wells + phone strip into the page's
  single task entry; differentiates from uplift-A's promoted wells.
- **highlights** — reflex: uniform card grid (uplift-A) or carousel
  (captured). Alternatives: (a) editorial lead+grid (used by uplift-B),
  (b) full-height filmstrip with on-image text, (c) list ledger. Picked
  (b): cinematic register; distinct from both uplift variants.
- **credential badge** — reflex: badge image in a column. Alternatives:
  (a) stat numerals at display scale on ink, (b) press-stamp circle,
  (c) ticker. Picked (a): arrival register count-up target; badge image
  resolution too low for retina.
- **giving band** — reflex: 3 promo cards on white. Picked: single red
  photographic band with hairline tiles — red's one full-band moment
  (captured red ladder rebalanced, uplift-improvements #2 carried).

## Discipline 3 — Surprise budget: high

Moves (from the non-template bank):
1. **document-shape substitution**: hero-then-bands → chaptered
  photographic scroll with sticky 01–04 rail (numbered-chapter shape).
2. **cliché replacement**: highlights carousel → scroll-snap filmstrip
  with on-image editorial text.
3. **cliché replacement**: utility-bar + link-row header → pill/canopy
  header (Lilly model, user-directed).

Signature preservation (budget-exempt): red Cancer-strike wordmark
(canopy + collapsed pill), "Making Cancer History®" (canopy statement),
#1/15 credential numerals (chapter 02 stats). No captured video/canvas
hero exists to preserve (captured hero is a static carousel).

## Discipline 4 — Substrate transitions

Default: paper white `#faf9f7`.
Exceptions (2):
1. chapter-02 why → ink `#141313` — "the credential interlude: authority
   moment gets the page's one dark room."
2. chapter-04 take-action → red `#da291c` duotone over photograph —
   "the brand's single full-red band, reserved for giving."
(Footer ink = system chrome, not a content substrate transition.)

## Discipline 5 — Heading hierarchy + voice classification

H1 once: hero "#1 in the nation for cancer care" (captured-verbatim;
note: captured page has a duplicate H1 "Why Choose UT MD Anderson" —
corrected to H2 here, classification: direction-authorized structural
fix). All chapter heads H2; card/film titles H3.

Voice classification summary (full list propagates to
`_provenance.voiceClassification[]`):
- captured-verbatim: hero H1 + ranking link; "We're here for you." +
  1-877-790-1139 + "request an appointment online"; "Donate blood. Save
  a life." + body; Search Cancer Types / Search Clinical Trials / Plan
  Your Care + all three planning H4s + bodies; "Why Choose UT MD
  Anderson" + body paragraph; "Father inspires daughter's career path at
  UT MD Anderson" + "Watch the video"; all 8 highlight titles + deks;
  myCancerConnection / One-on-One Counseling / Find Our Locations / Read
  Our Blog / Ask a Question; "Help #EndCancer" + Give Now / Donate Blood
  / Shop UT MD Anderson; footer legal.
- direction-authorized rewrite: chapter kickers (01–04 labels), chapter
  H2s for care ("From first visit to full plan, we walk with you") and
  stories ("People are the proof"), newsletter H2, hero kicker phrasing,
  canopy statement layout (text itself = captured tagline ®).
- placeholder (imagery only, enumerated in unsourcedContent): hero-
  together-2560.jpg, care-bedside-2000.jpg, why-hands-1600.jpg,
  act-heart-hands-2400.jpg, film-*.jpg (4 portrait grounds). Marker:
  discreet "Placeholder photography" chrome label per friction #3.

No placeholder prose. No invented stats, hours, prices, or quotes.
