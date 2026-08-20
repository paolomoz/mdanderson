---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-08-20T04:48:00Z
  againstInput: https://www.mdanderson.org/
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/assets/screenshots/index.png
    - stardust/replica/capture/index/1440.json
    - DESIGN.json
    - PRODUCT.md
  referencesUsed: []
  note: >
    Reference research unavailable in this run (no live reference budget spent;
    contemporary counter-examples are named from general practice, not fetched
    citations). Captured-evidence citations are all verifiable in the artifacts
    above.
---

# Improvements — https://www.mdanderson.org/ (homepage)

1. **[dated-pattern]** The hero is a 450px AEM carousel banner with the award
   badge baked into the background JPEG and a low-contrast ghost CTA —
   index.json `media.cssBackgrounds[0]` is a 1400×450 gradient JPG with the
   US News shield pre-composited; the h1 renders at ~44px over it with the
   only CTA a thin outline button ("Learn more about this ranking"). The
   pattern is the 2015 hero-carousel; hospital leaders (Mayo, Cleveland
   Clinic class) moved to tall, typographically-led heroes with one decisive
   action. Fix: keep the captured gradient asset and verbatim claim, scale the
   Minion display to true hero size, and give the band a single solid CTA
   with AA contrast.

2. **[ia-clutter]** Three full-bleed color bands stack inside the first
   ~1250px — purple-gradient hero (450px), blue #3361AD contact strip, and a
   full-red alert band (screenshot y≈240–330 of 2000-scale) — three competing
   "look at me" surfaces before any content. The alert ("Donate blood. Save a
   life.") is a standing campaign, not an emergency, yet it wears emergency
   red edge-to-edge. Fix: keep the blue we're-here-for-you strip slim, and
   restyle the blood-drive band as a card with a red rule on a neutral
   surface so the red ladder is spent where it converts.

3. **[contrast-or-density]** The care-navigation wells bury their function:
   inputs render at ~36px with #D0D0CE hairlines on #FFF, microcopy at 12px
   Univers under 24px headings, and the flat color discs (red/purple/blue
   icon circles) visually outweigh the search actions they label
   (1440.json search-well region; screenshot y≈360–590). Fix: promote the
   two search inputs to full-width 52px fields with solid red submit
   affordances and lift microcopy to ≥14px.

4. **[missed-opportunity]** The page's best photography is cropped to
   postage stamps. The father/daughter story ships a 1444×619 poster
   (index.json `media.imgs[5]`) but the eight Highlights stories render at
   251×141 (`media.imgs[6..13]`) inside a 4-up carousel; survivor-voiced
   editorial — the brand's differentiator per PRODUCT.md — reads as thumbnail
   filler. Fix: photo-first story cards at a consistent 16:9 with Minion
   serif headlines and room to breathe.

5. **[dated-pattern]** "UT MD Anderson Highlights" is a paginated carousel
   (Previous/Next + 1/2 dots, 8 slides of which 4 visible) — index.json
   ctas[] includes bare "1"/"2" pagination anchors with `href: null`.
   Carousels hide 50% of the editorial inventory and test poorly for
   discovery; contemporary hospital newsrooms ship static grids. Fix: static
   4×2 grid, all eight stories visible, no JS dependency.

6. **[cliché]** Every conversion surface is a color-filled box with a
   centered white headline (myCancerConnection red, counseling purple, Give
   Now red, Donate Blood black, Shop blue — five saturated slabs below the
   fold, screenshot y≈1230–1650). The vocabulary is "banner ad", not
   "editorial institution", and it flattens the red ladder item 2 diagnosed.
   Fix: keep the captured band colors as accents (rules, buttons, eyebrows)
   on calmer grounds for the support duo, reserving full-bleed color for the
   Help #EndCancer trio that closes the page.
