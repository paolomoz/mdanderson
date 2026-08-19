<!-- provenance: written by stardust:replica (master session) | the per-archetype
     recreation + gate contract for delegated agents | digest of
     skills/replica/reference/{recreation-procedure,source-fidelity-gate}.md -->

# Replica recreation brief — mdanderson.org POC

You are recreating ONE archetype page of https://www.mdanderson.org as clean,
semantic, platform-agnostic HTML/CSS for a same-design (pixel-faithful)
migration. **This is recreation, not redesign.** Any "improvement" — nicer
spacing, better contrast, modern touches — is a FIDELITY BUG. The
inconsistency register (stardust/replica/inconsistency-register.md) is empty:
zero design deltas are permitted.

## Inputs (all paths relative to repo root /Users/paolo/stardust/2026-08/mdanderson)

| artifact | path |
|---|---|
| Captured content (verbatim source of every string) | `stardust/current/pages/<slug>.json` |
| Ground-truth screenshot (1440px full page) | `stardust/current/assets/screenshots/<slug>.png` |
| Layout map @1440 and @360 (element sel-paths, absolute rects, computed styles) | `stardust/replica/capture/<slug>/{1440,360}.json` |
| Source stylesheets (the site's own CSS) | `stardust/replica/capture/css/*.css` |
| Fonts (self-hosted, licensed — gate instrumentation only) | `stardust/prototypes/assets/mda-fonts.css` (already written — link it) |
| Shared chrome (header/nav/blue-strip/endcancer/newsletter/footer) | `stardust/prototypes/assets/chrome.html` + `chrome.css` (exists for every page EXCEPT the homepage agent, who authors it) |
| Design tokens | `DESIGN.json` at repo root |

## Deliverable

`stardust/prototypes/<slug>-proposed.html` — one self-contained page:
- `<link rel="stylesheet" href="assets/mda-fonts.css">` + `<link rel="stylesheet" href="assets/chrome.css">` + a `<style>` block whose FIRST child is the `:root` token-contract block (copy the exact block from `assets/chrome.css` :root — same tokens on every page).
- `<body class="basepage">`, chrome included verbatim from `assets/chrome.html` (marked `data-canon`), page content inside `<main class="mda-content" data-template="<type>">`.
- Every section-level element carries `data-section`, `data-intent`, `data-layout` (+ optional `data-items`, `data-media`, `data-interactive`) per stardust's structural vocabulary.
- No JS, with ONE exception: if the live chrome morphs with scroll (check the layout map for fixed/sticky positions), a few lines toggling the same class at the same threshold — lift class and threshold from the source CSS/JS, never guess.

## Authoring order (each step removes guesswork from the next)

1. **Content skeleton** from the page JSON — headings, body, CTAs with hrefs, alt text, metadata (title, description, og). VERBATIM. No rewording, no fabrication, no truncation.
2. **Lift exact values** from the layout maps + source CSS: container widths, type ramp (family/size/line-height/letter-spacing per level), button specs (whole spec), section paddings, radii, hero heights, the container model (left-offset vs centered, %-heights, gutters). Fidelity values come from the capture, NOT your eye.
3. **Fonts**: already provided; use the exact family stacks from the layout map records.
4. **Compose against the screenshot** for what CSS doesn't name (image crops, composition, stacking, paint effects).
5. **Serve + gate loop** (below). Do NOT eyeball-polish before iteration 1 — the first gate run IS the map.
6. **The 360 layout is its own authoring pass** — lift the 360 map's geometry BEFORE authoring mobile (mobile nav = hamburger; grid collapse; hidden/restacked blocks). It is NOT a shrink of desktop.

## Parity rules (where recreations actually fail)

- **Role parity**: mirror the live element wrapping per string — `<a>` vs `<button>` vs `<span>`, exact heading LEVEL, eyebrow signature (uppercase+small). Iteration 1's role-swap reds are the worklist; fix wrapping before geometry.
- **Granularity parity**: mirror live text-node splits (span-in-heading), hidden DOM that counts as content, sr-only labels — reproduce them hidden, exactly as captured (inside `main` only; chrome is outside the content root).
- **Capture-state policy**: hydration placeholders, lazy-load placeholders, chat-widget buttons — replicate AS CAPTURED, log in your progress file, never "fix".
- **Images**: use the live `currentSrc` URLs (query strings intact) from the page JSON. If one 403s from localhost context, download it with `curl -A "<real-Chrome UA>" -e "https://www.mdanderson.org/"` into `stardust/prototypes/assets/media/<slug>/` and reference relatively. Never let a broken image ship — check the gate screenshots.
- **Icon fonts**: circle icons etc. use MDIcons/mda-icons codepoints — find the codepoint via the layout-map `text` field of the icon element or the source CSS `content:` rule.
- **Carousels**: recreate the t=0 captured state statically at its computed offsets. No JS.
- **Known nondeterminism (pre-justified, do NOT chase)**: call-tracking phone numbers rotate per live render (e.g. 1-844-429-6441 vs 1-866-…); the homepage award-badge year counter and highlights-carousel items can vary. Use the value captured in the page JSON; a content/pixel diff over these zones is JUSTIFIED — record it, don't iterate on it.

## Source-fidelity gate (per breakpoint: 1440 then 360)

A shared server ALREADY RUNS: `http://localhost:8791/` serving `stardust/prototypes/`. Do NOT start or kill any server.

```bash
PROTO="http://localhost:8791/<slug>-proposed.html"
LIVE="<live-url>"
W=1440   # then 360
GATE="stardust/replica/gates/<slug>-$W"; mkdir -p "$GATE"

node scripts/diff/content-diff.mjs "$LIVE" "$PROTO" --profile generic --width $W --main "main.mda-content" --dismiss | tee "$GATE/content-diff-iter<N>.txt"
node scripts/diff/visual-diff.mjs  "$LIVE" "$PROTO" --profile generic --width $W --main "main.mda-content" --dismiss --out "$GATE/vdiff" | tee "$GATE/visual-diff-iter<N>.txt"
# live stitch ONCE per breakpoint, reused across iterations; proto re-stitched every iteration
node scripts/replica/stitch-shot.mjs "$LIVE"  "$GATE/live.png"  --width $W --settle   # once
node scripts/replica/stitch-shot.mjs "$PROTO" "$GATE/proto.png" --width $W            # every iteration
node scripts/replica/pixel-compare.mjs "$GATE/live.png" "$GATE/proto.png" --out "$GATE/diff-iter<N>.png" --threshold 10
```

**Pass bar (ALL, per breakpoint):** 0 structural 🔴 in content-diff (🟡/🟠 confirmed-intended ok); visual-diff flags none or justified; pixel ≤ 10% full-page with no unexplained band; height |Δ| ≤ 8px. Fix heights FIRST — a height delta invalidates the %. Read the per-500px band breakdown top-down; fix the FIRST hot band; everything below it is offset-contaminated.

**Iteration cap: 3 per breakpoint.** Every fix cites the instrument line that demanded it. Re-run ALL probes after each fix round. After 3, log residuals and stop.

**Hardening you must respect:** never `fullPage:true` screenshots; never `--main body`; a `BotChallengeError`/exit-3 means escalate `--headed`, never measure a block page; if reds cluster on cookie/consent/survey strings the SCOPE or DISMISSAL is wrong, not your recreation. Also LOOK at `$GATE/live.png` before trusting it: if a "We('d) welcome your feedback!" survey modal is baked in, re-take that live capture (the dismissal usually catches it; re-run once).

## Output ledger (write this, and ONLY this, outside stardust/prototypes/)

`stardust/replica/progress/<slug>.json`:
```json
{ "pageType": "<type>", "archetype": "<slug>",
  "breakpoints": { "1440": { "iterations": N, "result": { "structuralRed": 0, "visualFlags": "…", "pixelPct": X.X, "heightDelta": N, "pass": true },
                              "justified": [ {"probe":"…","flag":"…","why":"…"} ],
                              "residuals": [ {"band":"y …","pct":X,"cause":"…","flaggedFor":"delivery|user"} ],
                              "captureState": [ {"what":"…","where":"…"} ] },
                    "360": { "…": "…" } },
  "portations": [], "notes": [] }
```

Do NOT write `stardust/state.json`, `stardust/status.jsonl`, or any file outside your page's prototype, gate dir, media dir, and progress file. Your final text reply: a compact summary — per breakpoint: iterations used, final pixel %, height Δ, structural reds, justified flags, residuals. No file dumps.
