#!/bin/zsh
# Resume script — listings batch, pages 5-6 (blocked 2026-08-21 18:22 when
# DA_TOKEN expired mid-run). Refresh DA_TOKEN in ~/.claude/.env from a
# da.live login first, then run this from the repo root:
#   zsh stardust/staging/listings-batch/resume.sh
set -e
export $(grep DA_TOKEN ~/.claude/.env)
CURL=/usr/bin/curl
DIR="$(cd "$(dirname "$0")" && pwd)"
AUTH="authorization: Bearer $DA_TOKEN"

# --- media for /research/research-resources/conferences-seminars ---
$CURL -sf -X POST "https://admin.da.live/source/paolomoz/mdanderson/media/research/hero-conferences-seminars-1400.jpg" -H "$AUTH" -F "data=@$DIR/media/hero-cs-1400.jpg;type=image/jpeg" -o /dev/null && echo "media 1/3"
$CURL -sf -X POST "https://admin.da.live/source/paolomoz/mdanderson/media/research/hero-conferences-seminars-496.jpg" -H "$AUTH" -F "data=@$DIR/media/hero-cs-496.jpg;type=image/jpeg" -o /dev/null && echo "media 2/3"
$CURL -sf -X POST "https://admin.da.live/source/paolomoz/mdanderson/media/research/enjoy-science-gloved-hand.jpg" -H "$AUTH" -F "data=@$DIR/media/enjoy-science-tube.jpg;type=image/jpeg" -o /dev/null && echo "media 3/3"

publish() { # $1 = DA/EDS path (no .html), $2 = source file
  $CURL -sf -X POST "https://admin.da.live/source/paolomoz/mdanderson$1.html" -H "$AUTH" -F "data=@$2;type=text/html" -o /dev/null
  $CURL -sf -X POST "https://admin.hlx.page/preview/paolomoz/mdanderson/main$1" -H "$AUTH" -o /dev/null
  $CURL -sf -X POST "https://admin.hlx.page/live/paolomoz/mdanderson/main$1" -H "$AUTH" -o /dev/null
  echo "published $1"
}

# page 5 — source upload succeeded before expiry but preview/live 404'd; redo all
publish /research/research-resources/core-facilities "$DIR/core-facilities.html"
# page 6 — never uploaded
publish /research/research-resources/conferences-seminars "$DIR/conferences-seminars.html"

# gates (run from repo root)
node stardust/scripts/fidelity-gate.mjs "/research/research-resources/core-facilities.html" "/research/research-resources/core-facilities" || true
node stardust/scripts/fidelity-gate.mjs "/research/research-resources/conferences-seminars.html" "/research/research-resources/conferences-seminars" || true
