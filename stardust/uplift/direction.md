---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-08-20T04:50:00Z
  againstInput: https://www.mdanderson.org/ (homepage, slug index)
  mode: A (brand-faithful; palette + typography pinned to captured surface)
  namespaceNote: >
    Uplift track only. All artifacts live in stardust/uplift/ and
    stardust/prototypes/uplift-{a,b,c}.html + assets/uplift/. The replica
    pipeline (root DESIGN/PRODUCT files, stardust/state.json pages[],
    *-proposed.html, canon/, content/, blocks/, styles/) is untouched.
  readArtifacts:
    - stardust/uplift/uplift-improvements.md
    - stardust/uplift/uplift-questions.md
    - stardust/uplift/extraction-notes.md
---

# Uplift direction — mdanderson.org homepage (3 variants)

## 3a — Cinematic register for variant C

**Picked: `arrival`.** PRODUCT.md Brand Personality reads authoritative +
credentialed, humane, urgent-but-hopeful — a civic-formal, institutional,
place-led brand (a cancer center that patients arrive at). Per the selection
heuristic, `civic-formal` + `institutional` → `arrival`. Runner-up was
`editorial` (survivor-story register), but arrival's refuses list conflicts
with nothing captured, while editorial's "no count-ups" would forfeit the
15-year credential — the page's strongest number. `registerSource: direct`
(heuristic, no override).

## Variant A — Faithful + improvements

Role: risk-averse green-light. "Yes, that's us, with the obvious fixes."
Composition: same section order as captured (hero → contact strip →
blood-drive → search wells → why-choose credential → story band → highlights
→ support duo → icon trio → #EndCancer trio → newsletter → footer).
Motion: static (no cinematic layer).
Improvements applied (all 6 from uplift-improvements.md):
1 typographically-led hero on the captured gradient asset, single solid CTA;
2 red ladder rebalanced (blood-drive as ruled card on neutral ground);
3 search wells promoted to real 52px inputs with red submits;
4 photography at 16:9 with breathing room; 5 highlights carousel → static
4×2 grid, all 8 visible; 6 conversion slabs calmed (support duo on neutral
grounds with color rules; full color reserved for the closing #EndCancer trio).

## Variant B — What if the survivor stories breathed at editorial scale?

Role: design-team motivator. The brand's underused capability foregrounded.
What if: "What if the survivor-voiced photography breathed at editorial
scale instead of thumbnail scale?"
Captured trait amplified: survivor-story photography + humane voice
(candidate 2 · Photography re-foregrounding).
Evidence: index.json media.imgs[5] 1444×619 story poster vs media.imgs[6..13]
251×141 carousel crops; PRODUCT.md "humane and survivor-voiced".
Composition: photo-first magazine IA on identical verbatim content — story
photo becomes the hero layout (title in lower band); ranking claim becomes a
black credential bar with the 15-year stat; Highlights becomes a
featured-editorial grid (1 lead + 7 photo cards, hairline rules, Minion
headlines); support surfaces calm to editorial panels. Appointment/contact
affordances stay first-viewport (blue strip preserved under header).
compositionDelta vs A: ["hero-medium: gradient-badge banner → full-bleed
story photograph", "highlights: uniform 4×2 grid → featured lead + 7-card
editorial grid", "credential: split stat panel → full-bleed black credential
bar", "search wells: 3-up band → 2-up search + care-planning index list"].
Motion: static (no cinematic layer).

## Variant C — What if motion was part of the identity?

Role: visionary pitch. The brand's third dimension — kinetic.
What if: "What if 'Making Cancer History' — the red strike through Cancer —
became the page's kinetic voice?"
Cinematic register: arrival (auto-picked from PRODUCT.md Brand Personality).
Captured trait amplified: the wordmark strike gesture + credential numerals
(candidate 4 · Signature-gesture extension; arrival is its composition-led
natural register).
Evidence: index.json media.imgs[0] wordmark with red strike through
"Cancer"; DESIGN.json extensions.voice.tagline "Making Cancer History".
Composition: identical IA to A; the bet is motion, not layout.
Motion: cinematic, register `arrival` — Lenis smooth scroll + canonical
runtime; hero parallax (−35vh) with deepening scrim; post-hero rising plate
(contact strip + search band); staggered fade+rise section entrances
([data-anim]); red section rules arriving with their bands; [data-countup]
on the 15-year credential; footer "Making Cancer History®" wordmark
clip-path wipe-up with the red strike landing as the final beat. Reduced
motion + no-JS fallbacks per motion-runtime.md.
compositionDelta vs A: motion axis (register applied; static A carries no
runtime) + hero scrim/plate structure + kinetic footer wordmark band.
compositionDelta vs B: ["hero-medium: story photograph → gradient-badge
banner with parallax", "highlights: featured-editorial grid → uniform grid
with cascade entrances", "credential: black bar → count-up stat panel",
"motion: none → arrival register"].

## Named assumptions (hands-off resolutions)

1. **Fonts** — Minion/Univers licensed woffs referenced via a copied
   @font-face sheet at assets/uplift/mda-fonts.css pointing at the existing
   self-hosted kit (../fonts/). Gate instrumentation only; delivery requires
   MD Anderson's own license (comment in the CSS).
2. **"15 Years" vs screenshot "17"** — DOM capture is the content source of
   truth; variants render "15" (see extraction-notes.md § Named discrepancy).
3. **Density floor** — brand-register page with 12 sections: desktop section
   padding capped at 64px (below the 70px captured value, within the ≤64px
   floor for >5-section pages).
4. **Container** — captured 1440px container inherited (Mode A), 72px side
   padding at desktop.
5. **Green "Ask a Question" disc** — the captured icon trio uses a green
   circle not present in the extracted palette roles; uplift variants recolor
   that disc to the captured purple #783491 to stay inside the pinned palette
   (named divergence, surface-level only).
6. **Reference grounding (Phase 2.5)** — reference research unavailable in
   this environment; skipped with provenance note per SKILL.md § Phase 2.5
   graceful degradation. Dated-pattern claims name contemporary practice but
   carry no fetched citations.
7. **Favicon** — no stardust/current/assets/favicon.* exists; requirement
   not triggered. Variants ship a no-op data: icon to keep consoles clean.
8. **Video** — the captured story band is a video teaser; prototypes render
   the captured poster with a play affordance linking nothing (no media
   fabrication), matching the replica's treatment.
