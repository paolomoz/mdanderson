#!/bin/bash
# horizon demo — content delivery (run from repo root on branch horizon).
# Requires a FRESH DA_TOKEN in /Users/paolo/.claude/.env (dev tokens last ~24h).
# Idempotent: PUT + preview are safe to re-run.
# Per-branch fstab mounts are ignored on this config (uplift-c learning):
# content rides the shared site mount at path /horizon.
set -euo pipefail

TOKEN=$(grep '^DA_TOKEN=' /Users/paolo/.claude/.env | cut -d= -f2-)
ORG=paolomoz REPO=mdanderson BRANCH=horizon

echo "== preflight: token accepted by DA?"
CODE=$(/usr/bin/curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" \
  "https://admin.da.live/source/$ORG/$REPO/nav.html")
[ "$CODE" = "200" ] || { echo "DA_TOKEN rejected ($CODE) — refresh it in /Users/paolo/.claude/.env"; exit 1; }

echo "== media (branch-independent DA source)"
GEN=stardust/prototypes/assets/horizon/media/gen
MED=stardust/prototypes/assets/horizon/media
for f in canopy-team.jpg hero-dawn.jpg care-room.jpg why-hands.jpg act-giving.jpg \
         film-survivor.jpg film-caregiver.jpg film-research.jpg film-clinic.jpg; do
  /usr/bin/curl -sS -X PUT -H "Authorization: Bearer $TOKEN" \
    -F "data=@$GEN/$f;type=image/jpeg" \
    -o /dev/null -w "  $f %{http_code}\n" \
    "https://admin.da.live/source/$ORG/$REPO/media/horizon/$f"
done
for f in story-father-1444.jpg hl-beyond-sunscreen.jpg hl-finding-connection.jpg hl-coping-with-insomnia.jpg; do
  /usr/bin/curl -sS -X PUT -H "Authorization: Bearer $TOKEN" \
    -F "data=@$MED/$f;type=image/jpeg" \
    -o /dev/null -w "  $f %{http_code}\n" \
    "https://admin.da.live/source/$ORG/$REPO/media/horizon/$f"
done

echo "== content PUT (/horizon — path-based; per-branch fstab mount is ignored)"
/usr/bin/curl -sS -X PUT -H "Authorization: Bearer $TOKEN" \
  -F "data=@content-horizon/horizon.html;type=text/html" \
  -o /dev/null -w "  horizon.html %{http_code}\n" \
  "https://admin.da.live/source/$ORG/$REPO/horizon.html"

echo "== preview"
/usr/bin/curl -sS -X POST -H "Authorization: Bearer $TOKEN" \
  -o /dev/null -w "  preview %{http_code}\n" \
  "https://admin.hlx.page/preview/$ORG/$REPO/$BRANCH/horizon"

echo "== verify delivered .plain.html"
P=$(/usr/bin/curl -s --compressed "https://$BRANCH--$REPO--$ORG.aem.page/horizon.plain.html")
echo "  about:error: $(echo "$P" | grep -c about:error) (expect 0)"
echo "  h1 count:    $(echo "$P" | grep -c '<h1') (expect 1)"
echo "  img count:   $(echo "$P" | grep -oc '<img') (expect 13)"
echo
echo "demo: https://$BRANCH--$REPO--$ORG.aem.page/horizon"
