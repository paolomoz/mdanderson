---
_provenance:
  writtenBy: stardust:prototype (horizon track)
  writtenAt: 2026-08-21T11:30:00Z
  againstInput: https://www.mdanderson.org/ (homepage, slug index)
  mode: user-directed redesign (Track 3)
  approvedWireframe: stardust/wireframes/b-horizon.html
  userDirective: >
    2026-08-21 chat: "I want to work on a much better design… less fidelity
    with the original, still same content and brand but new design ideas…
    more modern, more unique and more attractive… photography led (example
    lilly.com)". User reviewed three wireframes and picked B ("Horizon"),
    then approved the Lilly-model pill-header/canopy revision, then:
    "build a prototype based on b-horizon carefully, with stardust:prototype.
    use high resolution images… take care of the details (corners, borders,
    fonts, motions, transitions, etc.)".
  namespaceNote: >
    Horizon track only. Artifacts: stardust/horizon/, stardust/prototypes/
    horizon-shape.md, horizon-proposed.html, horizon-cinematic.html,
    assets/horizon/. The replica pipeline (root DESIGN/PRODUCT files,
    stardust/state.json pages[], *-proposed.html, canon/) is untouched.
    The uplift track (stardust/uplift/, uplift-{a,b,c}.html) is untouched.
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/wireframes/b-horizon.html
    - stardust/uplift/direction.md (register precedent)
    - DESIGN.json (captured tokens, pinned families)
---

# Horizon direction — mdanderson.org homepage redesign prototype

## Active — 2026-08-21

**Register:** cinematic photography-led institutional. The homepage becomes
a chaptered photographic arrival: one full-viewport human moment, a floating
pill header that expands into a canopy mega-menu (Lilly.com model,
user-supplied reference screenshots), and a 01→04 chapter scroll
(Your care → Why MD Anderson → Stories → Take action).

**ia-fidelity: reimagined** (homepage only, this track only). Content is
**verbatim** from `current/pages/index.json` — every headline, phone number,
CTA and story title is the captured site's. Structure diverges deliberately:
the user asked for "less fidelity with the original, same content and brand."

**Brand pinning (Mode A surfaces carried):**
- Palette: MD Anderson red `#da291c` on near-black ink + paper white.
  Red stays scarce: nav CTA, chapter kickers, one red take-action band.
- Type: Univers LT (67 Bold Cn for display caps, 65 Bold, 55 Roman,
  45 Light) + Minion (canopy brand statement, editorial moments) — the
  captured licensed kit, self-hosted at `assets/fonts/` as gate
  instrumentation only (licensing alert unchanged, see fonts/LICENSING.md).
- Signature motifs (budget-exempt, mandatory): the red strike through
  "Cancer" in the wordmark; "Making Cancer History®"; the #1 / 15-years
  credential numerals.

**Motion:** cinematic register `arrival` (same heuristic result as uplift-C:
civic-formal + institutional + place-led). Lenis + canonical runtime.
Static `horizon-proposed.html` is the gate-bearing artifact;
`horizon-cinematic.html` is the review surface.

**Photography contract:** captured DAM renditions cap at 1444×619 — too
small for 100vh cinematic surfaces. High-resolution placeholder photography
(Unsplash, art-directed to the brief, staged at `assets/horizon/media/`)
carries the four cinematic surfaces; every such image is recorded in
`_provenance.unsourcedContent[]` and must be swapped with MD Anderson
DAM/brand-team originals before any public use. Captured brand assets
(wordmark, father/daughter story poster, highlight thumbs) are used
wherever their resolution allows.

## Anti-references

- The current mdanderson.org visual system (the user asked to depart from it).
- Generic hospital-template IA (hero-then-bands with icon wells).
- The uplift A/B/C variants (this is a fourth, structurally distinct take).
- Dark-luxury registers (Sequel-style) — a cancer center must stay warm.

## Divergence inputs

- Approved wireframe: `stardust/wireframes/b-horizon.html` (structure is
  user-approved; the prototype refines, it does not re-plan).
- Lilly.com header model: collapsed logo+burger pill left / utility pill
  right; expanding full-width dark rounded canopy with chip nav row,
  divider, brand statement + featured card.
- Refero style references: Superpower (full-bleed portrait + single red
  CTA), until (glass pill nav, scroll cue), Luffu (humanist full-bleed
  photography).
