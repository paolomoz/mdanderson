---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-08-20T05:45:00Z
  againstInput: https://www.mdanderson.org/ (homepage)
  variants: [A, B, C]
---

# Uplift summary — mdanderson.org homepage

Three brand-faithful presales variants (Mode A: #DA291C red system, Minion +
Univers, verbatim captured copy). View at http://localhost:8791/uplift-{a,b,c}.html.

---

## Variant A — the green-light

- **Role:** risk-averse green-light. Same IA as the live homepage, with all
  six diagnosed weaknesses fixed (`stardust/uplift/uplift-improvements.md`).
- **What-if trait:** none — A's bet is the improvements list, not a trait.
- **Register:** static (no motion layer).
- **Validation:** PASS — 1440/768/390 render console-clean, zero overflow;
  360px mobile-adapt audit pass (hamburger collapse, nav >=14px); computed
  WCAG contrast 0 failures; LCP eager + high-priority; vision gate pass
  against the captured screenshot.
- **File:** `stardust/prototypes/uplift-a.html` · screenshots
  `stardust/validation/uplift-a/`

**Seller pitch (read aloud):**
"This is tomorrow's version of the site you already have — same sections, same
words, same red. We scaled the ranking claim to true hero size, gave patients
one decisive appointment path, made the cancer-type and trial search feel like
search, and opened all eight stories that the old carousel was hiding.
Nothing to re-approve: it's you, with the obvious fixes shipped."

---

## Variant B — the design-team motivator

- **Role:** the brand's underused capability, foregrounded.
- **What-if trait:** *Photography re-foregrounding* — "What if the
  survivor-voiced photography breathed at editorial scale instead of thumbnail
  scale?" (evidence: 1444x619 story poster buried mid-page; eight stories
  cropped to 251x141 in a carousel).
- **Register:** static — the bet is composition, not motion. Story photo
  becomes the hero layout; ranking compresses to a black credential bar;
  Highlights becomes a featured-lead editorial grid; care search goes
  editorial (underline fields + numbered planning index).
- **Validation:** PASS — same cascade as A (render, mobile-adapt, computed
  contrast, LCP), plus craft fixes applied during critique (orphan card
  3+3+1 -> 4+3; min-content overflow on "myCancerConnection" at 360px).
- **File:** `stardust/prototypes/uplift-b.html` · screenshots
  `stardust/validation/uplift-b/`

**Seller pitch (read aloud):**
"Your differentiator isn't the ranking — it's the people. This version leads
with the father-and-daughter story at full width, the way a magazine would run
it, and turns your Cancerwise stories into an editorial front page. Same
words, same photos you already own — just finally at the scale they deserve.
The #1 ranking doesn't disappear; it becomes the credential bar under the
story, where trust actually reads."

---

## Variant C — the visionary cinematic pitch

- **Role:** the brand's third dimension — kinetic. IA identical to A; the bet
  is motion.
- **What-if trait:** *Signature-gesture extension* — "What if 'Making Cancer
  History' — the red strike through Cancer — became the page's kinetic
  voice?" (evidence: the strike lives only in the wordmark; the tagline closes
  the page as small static text).
- **Register:** `arrival` (auto-picked: civic-formal + institutional per
  PRODUCT.md Brand Personality -> motion-registers.md selection heuristic).
  Lenis 1.3.19 + the canonical motion runtime: hero parallax with deepening
  scrim, post-hero rising plate, 27 staggered section entrances, the 15-year
  credential counting up, and the footer wordmark wiping up with the red
  strike landing as the final beat.
- **Validation:** PASS — full static cascade plus motion Pass 6: Lenis boot
  clean; reduced-motion fallback complete (everything forced to final state);
  scroll-jack check pass (wheel, PageDown/End/Home all native); register-match
  audit pass (arrival vocabulary only); C-cliff detector pass (25 anim
  elements, 0 infinite loops, 35vh parallax, ~450ms max stagger); no-JS
  render identical to static A.
- **File:** `stardust/prototypes/uplift-c.html` · screenshots incl.
  `cine-{top,mid,deep,mobile}.png` in `stardust/validation/uplift-c/`

**Seller pitch (read aloud):**
"Watch what happens when the brand's own gesture — the red line through
Cancer — becomes how the page moves. The hero recedes as care options rise to
meet you, every section arrives with the calm confidence of the institution,
the fifteen-year streak counts itself up, and the page ends with 'Making
Cancer History' wiping in, strike and all. It's the same homepage, same
words — plus the dimension your brand has never used: motion. And it degrades
perfectly: no JavaScript, no motion preference, it's still variant A."

---

## Differentiation and gates

- A vs B: >=2 structural changes PASS (hero medium, highlights composition,
  credential form, care-finder form)
- A vs C: >=2 changes PASS (motion register, hero marquee/scrim, kinetic
  wordmark, count-up credential)
- B vs C: >=2 structural changes PASS (hero medium, highlights composition,
  credential form, motion axis)
- All three: console clean, no overflow at 1440/768/390 (+360 audit),
  verbatim captured copy, pinned palette/typography, token contract `:root`
  block, structural data-attributes, licensed-font gate-instrumentation note.
