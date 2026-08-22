#!/bin/zsh
# Final full-corpus re-gate: every page pair from the fidelity log, latest
# code, one pass. Emits stardust/migration-plan/final-sweep.tsv.
cd "$(dirname "$0")/../.."
python3 - <<'PY' > /tmp/sweep-pairs.txt
rows={}
for line in open('stardust/migration-plan/fidelity-log.tsv'):
    p=line.strip().split('\t')
    if len(p)>=6: rows[p[1]]=p[2]
for live,eds in sorted(rows.items()):
    print(f"{live}|{eds}")
PY
: > stardust/migration-plan/final-sweep.tsv
while IFS='|' read -r live eds; do
  node stardust/scripts/fidelity-gate.mjs "$live" "$eds" 2>&1 | tail -1
done < /tmp/sweep-pairs.txt | tee -a stardust/migration-plan/final-sweep.log
grep -c PASS stardust/migration-plan/final-sweep.log
