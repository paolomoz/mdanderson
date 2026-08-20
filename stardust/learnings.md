# Learnings ledger — mdanderson POC rollout (2026-08-20)

### Block VARIANT name collided with a global utility class (`.cards.icon` vs `.icon`)
- failure class: silent-render (variant class shadowed by a runtime utility; block box collapses while children overflow-render)
- evidence: 8 `cards icon …` instances across 7 pages compute `display:inline-block; 24x24` from the boilerplate `.icon` utility (styles/styles.css:381). Visible on live: letter-stacked rail text on /about-md-anderson and /cancerwise/how-to-cope-with-insomnia-during-cancer-treatment, band overlaps on /about-md-anderson/our-locations, /cancer-types/breast-cancer, /donors-volunteers, card-col overflow to 1679px @1440 and clipped trio @390. Finding f-97cd97da65.
- proposed change: `skills/deploy/SKILL.md` § block naming (the deploy #15 reserved-class guard) and `skills/rollout/SKILL.md` Phase B — extend the reserved-class guard from block NAMES to block VARIANT tokens: reject/rename any variant equal to a boilerplate utility class (`icon`, `button`, `section`, `block`, `default-content-wrapper`, …). The foundation-first gate should also assert each authored block's own bounding box ≥ its children, not just grid/flex computation.
- status: pending

### Icon-token double-prefix, then missing icon assets
- failure class: capture-gap (icon pipeline shipped tokens whose SVG assets were never produced)
- evidence: run predecessor commit 77cf28d fixed `:icon-x:` double-prefix 404s (`/icons/icon-x.svg`); this run still found ~20 tokens (`:publications:`, `:gifts:`, `:donate:`, `:tips:`, …) with no SVG in `icons/` — rendered as up-to-417px broken-image boxes on index, patients-family, donors, about, insomnia. Finding f-b97f4faec6.
- proposed change: `skills/deploy/SKILL.md` § ENCODE contract → Icons — when authoring a `:token:`, REQUIRE the matching `icons/<token>.svg` to exist in the code branch (or drop to a font-glyph-only authoring form); add an icons-existence check to `skills/rollout/scripts/delivery-lint.mjs` (cheap static: token names vs `icons/*.svg`).
- status: pending

### Icon decoration order breaks "head row" detection in row-typed blocks
- failure class: silent-render (decorateIcons runs before block decorate; a head row's `:token:` becomes `span.icon > img`, so `row.querySelector('img')` misclassifies the head row as a media row)
- evidence: donors-volunteers `link-list thumbs` dropped the "Your Gifts at Work" heading + intro from the decorated DOM while `.plain.html` carried it (finding f-0dd06f4514; content-side workaround shipped: token removed from head row, page redeployed).
- proposed change: `skills/deploy/SKILL.md` § block JS conventions — row-type sniffing must exclude `span.icon img` from media detection (`row.querySelector('picture, img:not(.icon img)')` or filter by closest('span.icon')); fold the same guard into any generated row-typed block.
- status: pending

### Extract captured desynced campaign tel numbers (href ≠ visible text)
- failure class: capture-gap (source rotates campaign tracking phone numbers; snapshot caught href and text from different rotations)
- evidence: /cancer-types/breast-cancer shipped `tel:+18555269738` under visible "1-866-378-5346"; /patients-family/…/breast-center shipped `tel:+18559745992` under "1-888-499-4417" (source canonical is 1-877-632-6789). Fixed by rewriting hrefs to match visible text + redeploy (finding f-e0693b41b1).
- proposed change: `skills/rollout/scripts/delivery-lint.mjs` — add a deterministic check: a `tel:` href whose digits are not a substring-normalized match of the anchor's visible digits is a P2.
- status: pending

### delivery-lint `one-cta-per-p` false-positives on inline prose links
- failure class: gate-noise (heuristic flags paragraphs that are prose, not CTAs)
- evidence: 8 pages flagged P1 for the "We're here for you. Call us at <tel> or <a>request an appointment</a>" banner line — inline text links that EDS correctly does NOT buttonize; live render verified identical to proto.
- proposed change: `skills/rollout/reference/delivery-lint.md` + `scripts/delivery-lint.mjs` — only fire `one-cta-per-p` when the `<p>`'s non-link text is empty/whitespace (the buttonization precondition), not merely when a `<strong>` and 2+ `<a>` co-exist.
- status: pending
