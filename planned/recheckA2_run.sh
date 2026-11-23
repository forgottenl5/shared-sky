#!/usr/bin/env bash
# RECHECK_A2 runner (planned/RECHECK_A2_PREREG.md). Re-runs COUNTFIX (42 runs) and RECOUNT1 (26 runs) with their own, unchanged
# runners and the research-module fixes switched on by environment (SKY_EXACT_DEV=1 exact deviations, SKY_BOUND=1 bounded count).
# Each mode runs in a shadow root: planned/ is COPIED (these runners write to __dirname/../out), everything else is symlinked.
#   bash planned/recheckA2_run.sh k1     fixes off: one COUNTFIX run and RECOUNT1 sub 1 seed 22 must equal the stored results
#   bash planned/recheckA2_run.sh run    the study, fixes on
set -euo pipefail
REPO=$(cd "$(dirname "$0")/.." && pwd); BASE=${RECHECK_ROOT:-$REPO/../recheck_a2}
shadow() { local W=$BASE/$1; rm -rf "$W"; mkdir -p "$W/out"; for e in "$REPO"/* "$REPO"/.[!.]*; do n=$(basename "$e"); case "$n" in out|.git) ;; planned) cp -r "$e" "$W/planned" ;; *) ln -s "$e" "$W/$n" ;; esac; done; echo "$W"; }
cf_jobs() { for d in 3 4; do for s in 1 2 3; do echo "valloc A0 $d $s"; echo "valloc A2 $d $s"; echo "proc P2 $d $s"; done
            for s in 19 20 21; do echo "dev HOLD-A0 $d $s"; echo "dev HOLD-A2 $d $s"; echo "rth RTH-OWN $d $s"; echo "rth RTH-120 $d $s"; done; done; }
case "${1:?k1|run}" in
k1) W=$(shadow off); cd "$W"; unset SKY_EXACT_DEV SKY_BOUND
    node planned/countfix.js dev HOLD-A2 3 19 4 > /dev/null; node planned/recount1_run.js 1 22 22 2> /dev/null
    python3 - "$REPO" <<'EOF'
import json, sys
R = sys.argv[1]; strip = lambda r: {k: v for k, v in r.items() if k != "wall_s"}
a = strip(json.load(open(f"{R}/out/countfix/dev_HOLD-A2_d3_19.json"))); b = strip(json.load(open("out/countfix/dev_HOLD-A2_d3_19.json")))
c = json.load(open(f"{R}/out/recount1_sub1_22-22.json")); d = json.load(open("out/recount1_sub1_22-22.json"))
print("K1 COUNTFIX dev HOLD-A2 d 3 seed 19:", "identical" if a == b else f"DIFFERENT {a} {b}")
print("K1 RECOUNT1 sub 1 seed 22:", "identical" if c == d else f"DIFFERENT {c} {d}")
print("K1", "PASS" if a == b and c == d else "FAIL")
EOF
    ;;
run) W=$(shadow on); cd "$W"; export SKY_EXACT_DEV=1 SKY_BOUND=1
    cf_jobs | xargs -P 2 -L 1 sh -c 'node planned/countfix.js "$0" "$1" "$2" "$3" 4 >> out/countfix.log'
    (node planned/recount1_run.js 1 22 24 2> out/recount1_a.log & node planned/recount1_run.js 4 22 31 2> out/recount1_b.log & wait)
    echo "done: $W ($(ls out/countfix | wc -l) COUNTFIX runs)" ;;
esac
