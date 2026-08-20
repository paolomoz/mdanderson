#!/bin/bash
# uplift-c demo — content delivery (run from repo root on branch uplift-c).
# Requires a FRESH DA_TOKEN in /Users/paolo/.claude/.env (dev tokens last ~24h).
# Idempotent: PUT + preview are safe to re-run.
set -euo pipefail

TOKEN=$(grep '^DA_TOKEN=' /Users/paolo/.claude/.env | cut -d= -f2-)
ORG=paolomoz REPO=mdanderson BRANCH=uplift-c

echo "== preflight: token accepted by DA?"
CODE=$(/usr/bin/curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" \
  "https://admin.da.live/source/$ORG/$REPO/nav.html")
[ "$CODE" = "200" ] || { echo "DA_TOKEN rejected ($CODE) — refresh it in /Users/paolo/.claude/.env"; exit 1; }

echo "== media (branch-independent DA source)"
for f in hero-1400.jpg hl-phase-i-trials.jpg; do
  /usr/bin/curl -sS -X PUT -H "Authorization: Bearer $TOKEN" \
    -F "data=@stardust/prototypes/assets/uplift/media/$f;type=image/jpeg" \
    -o /dev/null -w "  $f %{http_code}\n" \
    "https://admin.da.live/source/$ORG/$REPO/media/uplift-c/$f"
done

echo "== content PUT (/uplift-c — fallback path; per-branch fstab mount is ignored)"
/usr/bin/curl -sS -X PUT -H "Authorization: Bearer $TOKEN" \
  -F "data=@content-uplift/uplift-c.html;type=text/html" \
  -o /dev/null -w "  uplift-c.html %{http_code}\n" \
  "https://admin.da.live/source/$ORG/$REPO/uplift-c.html"

echo "== preview"
/usr/bin/curl -sS -X POST -H "Authorization: Bearer $TOKEN" \
  -o /dev/null -w "  preview %{http_code}\n" \
  "https://admin.hlx.page/preview/$ORG/$REPO/$BRANCH/uplift-c"

echo "== verify delivered .plain.html"
P=$(/usr/bin/curl -s --compressed "https://$BRANCH--$REPO--$ORG.aem.page/uplift-c.plain.html")
echo "  about:error: $(echo "$P" | grep -c about:error) (expect 0)"
echo "  h1 count:    $(echo "$P" | grep -c '<h1') (expect 1)"
echo "  img count:   $(echo "$P" | grep -oc '<img') (expect 10)"
echo
echo "demo: https://$BRANCH--$REPO--$ORG.aem.page/uplift-c"
