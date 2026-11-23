#!/usr/bin/env bash
# RECHECK_B runner (planned/RECHECK_B_PREREG.md): ERRORS1 (276 runs) and ERRORS2 (236 runs) re-run, unchanged, with independent
# per-flight error streams (planned/recheck_rng_preload.js). Shadow root: planned/ COPIED (the analyses write their tables into
# planned/), everything else symlinked; out/ fresh. The runners resume, so 'run' can be restarted.
#   bash planned/recheckB_run.sh k       K1 (wrapper off reproduces two stored ERRORS1 rows) and K2 (wrapper on changes them)
#   bash planned/recheckB_run.sh run     the study (about 11 CPU hours)
set -euo pipefail
REPO=$(cd "$(dirname "$0")/.." && pwd); BASE=${RECHECK_ROOT:-$REPO/../recheck_b}
shadow() { local W=$BASE/$1; [ "${2:-}" = keep ] && [ -d "$W" ] && { echo "$W"; return; }; rm -rf "$W"; mkdir -p "$W/out"
  for e in "$REPO"/* "$REPO"/.[!.]*; do n=$(basename "$e"); case "$n" in out|.git) ;; planned) cp -r "$e" "$W/planned" ;; *) ln -s "$e" "$W/$n" ;; esac; done; echo "$W"; }
P=(-r ./planned/recheck_rng_preload.js)
case "${1:?k|run}" in
k) W=$(shadow k); cd "$W"
   RECHECK_RNG=off node "${P[@]}" planned/errors1_run.js time > out/k_off.txt; RECHECK_RNG=on node "${P[@]}" planned/errors1_run.js time > out/k_on.txt
   python3 - "$REPO" <<'EOF'
import glob, json, sys
R = sys.argv[1]; strip = lambda r: {k: v for k, v in r.items() if k != "wall_s"}
st = {"|".join(str(r[k]) for k in ("study", "metro", "arm", "level", "seed")): strip(r) for f in glob.glob(f"{R}/out/errors1/*.jsonl") for l in open(f) if l.strip() for r in [json.loads(l)]}
def rows(p): return {l.split(" ")[0]: strip(json.loads(l.split(" ", 1)[1].rsplit(" ", 1)[0])) for l in open(p) if l.strip()}
off, on = rows("out/k_off.txt"), rows("out/k_on.txt")
k1 = all(off[k] == st[k] for k in off); k2 = all(on[k] != st[k] for k in on)
for k in off: print(k, "| stored v10", st[k].get("v10", st[k].get("flown_wide")), "| off", off[k].get("v10", off[k].get("flown_wide")), "| on", on[k].get("v10", on[k].get("flown_wide")))
print("K1", "PASS" if k1 else "FAIL", "(wrapper off reproduces the stored rows)"); print("K2", "PASS" if k2 else "FAIL", "(wrapper on changes them)")
EOF
   ;;
run) W=$(shadow on keep); cd "$W"; export RECHECK_RNG=on
   (node "${P[@]}" planned/errors1_run.js 0 2 >> out/errors1.0.log 2>&1 & node "${P[@]}" planned/errors1_run.js 1 2 >> out/errors1.1.log 2>&1 & wait)
   (node "${P[@]}" planned/errors2_run.js 0 2 >> out/errors2.0.log 2>&1 & node "${P[@]}" planned/errors2_run.js 1 2 >> out/errors2.1.log 2>&1 & wait)
   echo "done: $W ($(cat out/errors1/*.jsonl | wc -l) ERRORS1 rows, $(cat out/errors2/*.jsonl | wc -l) ERRORS2 rows)" ;;
esac
