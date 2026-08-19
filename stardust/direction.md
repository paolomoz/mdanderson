<!-- provenance: written by stardust:stardust (master) | input: user request "build a POC of the migrated mdanderson.org site to EDS, replica + shine, hands-off" | synthesized: run plan and volume caps | reads: none (fresh project) -->

# Direction — MD Anderson EDS migration POC

## Hands-off activation — 2026-08-19

Hands-off mode activated by explicit user selection ("Hands-off (Recommended)"
via structured question). `state.json.handsOff: true` stamped. All interactive
gates auto-resolve per `stardust/SKILL.md` § Hands-off mode; every quality gate
runs at full strength. Prototype approvals will be recorded as
`approvedBy: "hands-off"` only after all gates pass.

## Run plan (user-approved 2026-08-19)

Two tracks on the same captured content:

1. **Track 1 — `stardust:replica`** (same-design migration): extract a
   ~12-page archetype roster (one per template family), recreate each as clean
   semantic HTML/CSS, pass the measured source-fidelity gate (content-diff,
   visual-diff, pixel ≤10%, height |Δ|≤8px at 1440 and 360), then
   migrate → rollout to EDS (repo github.com/paolomoz/mdanderson, DA folder
   /paolomoz/mdanderson).
2. **Track 2 — `stardust:uplift`** on the homepage: three brand-faithful
   redesign variants (one cinematic) as the "shine" demo — proof that a future
   redesign is a reskin over already-migrated content, not a migration blocker.

## Named assumptions (hands-off)

- **Volume cap:** 12 pages, one archetype per template family (POC scope,
  below the hands-off default of 100 — the goal is breadth across templates,
  not depth).
- **Dynamic integrations** (OnCore clinical trials, myCV faculty profiles,
  Mindbreeze search, video feeds) are captured as static content snapshots at
  crawl time and replicated as captured, per replica's capture-state policy.
  Production integration architecture is a talking point, not POC scope.
- **Inconsistency register: empty** — pure replica, no design deltas. The
  demo's credibility rests on pixel fidelity.
- **Direction mode:** preserve (replica Phase 2). `stardust:direct` is never
  invoked for Track 1. Track 2 (uplift) derives its own direction from the
  captured brand surface, scoped to homepage variants only — it does not
  change Track 1 state.

## Preserve-mode record — 2026-08-19T19:00Z

Mode: PRESERVE. The target spec is the captured current state of
https://www.mdanderson.org, bounded-promotion branch (extract ran with
`--pages`, no prep synthesis existed to promote verbatim).

Synthesized (bounded-single): current/pages/index.json + Phase-3 CSS lift
(stardust/replica/capture/) → PRODUCT.md · DESIGN.md · DESIGN.json
(at 2026-08-19T19:00Z).

Permitted deltas: ONLY the entries of
stardust/replica/inconsistency-register.md (empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Named assumption (fonts): Minion + Univers LT are licensed commercial kits.
Intercepted woffs are self-hosted in local prototypes strictly as gate
instrumentation; the delivery phase surfaces the licensing decision (customer
kit vs metric substitutes) to the user. Brand family names stay first in all
font stacks.
