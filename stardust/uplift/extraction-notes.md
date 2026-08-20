---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-08-20T04:47:00Z
  againstInput: https://www.mdanderson.org/
  note: >
    Phase 1 (extract) SKIPPED — reuse-if-fresh. A full single-page capture of
    the same URL exists from the replica track, extracted 2026-08-19 (< 7 days
    old). No re-crawl performed; only image asset mirroring for uplift variants.
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/assets/screenshots/index.png
    - stardust/replica/capture/index/1440.json
    - stardust/replica/capture/index/360.json
    - DESIGN.json (root, replica-authored Mode A token source)
    - PRODUCT.md (root, brand personality evidence)
    - stardust/prototypes/index-proposed.html (read-only: verbatim copy extraction)
---

# Uplift extraction notes — mdanderson.org homepage

Reusing extraction from 2026-08-19 (replica track). Signals consumed:

## Brand surface (from root DESIGN.json + PRODUCT.md)
- Palette: #DA291C (MD Anderson red, single dominant accent) on
  #000/#FFF/#F2F3F4/#F7F7F7/#D0D0CE/#605D5D neutrals; accent chips
  #783491 purple, #23B8F1 light blue, #3361AD blue.
- Type: Minion (serif) display + body; Univers LT 55/45/65/67BoldCn (sans)
  for nav/labels/buttons; MDIcons icon font. Licensed kits — self-hosted
  woffs reused strictly as gate instrumentation (see assets/uplift/mda-fonts.css).
- Geometry: square corners, flat surfaces, full-bleed bands, 1440px container,
  70px/72px section padding, line-height 1.3, letter-spacing -0.02em.
- Brand personality: authoritative + credentialed (US News #1 hero, 15-year
  streak), humane + survivor-voiced (Cancerwise stories, father/daughter film),
  urgent-but-hopeful campaign voice (Help #EndCancer, Making Cancer History®).
- Signature gesture: the wordmark itself — "Cancer" struck through by a red
  line ("Making Cancer History®"). Appears only in the logo and footer.

## Verbatim homepage content inventory (index.json + validated replica render)
Section order as captured: utility bar + mega-nav → hero (#1 in the nation
for cancer care, US News badge baked into 1400×450 gradient JPG, ghost CTA
"Learn more about this ranking") → blue "We're here for you" strip
(1-877-790-1139) → red blood-drive alert band → search wells (Search Cancer
Types / Search Clinical Trials / Plan Your Care ×3 rows) → "15 Years" ribbon
panel + Why Choose UT MD Anderson → full-width story video band ("Father
inspires daughter's career path at UT MD Anderson", 1444×619 poster) →
UT MD Anderson Highlights carousel (8 items at 251×141, 2 pages) → duo promos
(myCancerConnection red / One-on-One Counseling purple) → icon trio (Find Our
Locations / Read Our Blog / Ask a Question) → Help #EndCancer trio (Give Now
red / Donate Blood black / Shop UT MD Anderson blue) → Cancerwise newsletter
bar → mega footer + mission band.

Highlights (title — dek, all captured):
1. Top cancer hospital — UT MD Anderson earns U.S. News & World Report's top ranking
2. Uterine cancer signs — What six survivors noticed before diagnosis
3. Blood donation — One caregiver's reasons for giving back
4. Beyond sunscreen — Podcast: Preventing skin cancer with UPF clothing
5. Finding connection — Breaking through isolation after a cancer diagnosis
6. Coping with insomnia — Ways to improve sleep during treatment
7. Only Possible Here — Support our effort to transform bold ideas into real impact
8. Phase I trials — What to know before deciding to enroll

## Assets mirrored for uplift (stardust/prototypes/assets/uplift/media/)
- hero-1400.jpg (1400×450, gradient + US News badge, captured hero background)
- story-father-1444.jpg (1444×619, strongest photography on the page)
- hl-*.jpg ×8 (251×141 highlight renditions — larger AEM renditions 404,
  so editorial variants render these at ≤ ~400px width)
- logo.webp (1527×639 wordmark with red strike through "Cancer"), footer-logo.webp

## Named discrepancy
- The captured full-page screenshot ribbon reads "17 Years"; the verbatim DOM
  capture (index.json body[]) and the validated replica both read "15 Years".
  Uplift uses the DOM-verbatim "15" (content source of truth).
