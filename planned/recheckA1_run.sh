#!/usr/bin/env bash
# RECHECK_A1 runner (planned/RECHECK_A1_PREREG.md). Re-runs six engine studies with their own, unchanged runners and the engine
# fixes switched on by planned/recheck_preload.js. Each mode runs in its own shadow root (symlinks to the repo, a fresh out/),
# so the original out/ is never touched and the original analysis scripts can be pointed at either root unchanged.
#   bash planned/recheckA1_run.sh k1     wrapper off: re-run AMZBAND and RTHREP, must equal the stored rows exactly
#   bash planned/recheckA1_run.sh k2     wrapper on: one hold run must differ from the same run with the wrapper off
#   bash planned/recheckA1_run.sh run    the study: all six runners with fixes on (2 shards each), then each runner's own checks
set -euo pipefail
REPO=$(cd "$(dirname "$0")/.." && pwd); BASE=${RECHECK_ROOT:-$REPO/../recheck_a1}
shadow() { local W=$BASE/$1; rm -rf "$W"; mkdir -p "$W/out"; for e in "$REPO"/* "$REPO"/.[!.]*; do n=$(basename "$e"); [ "$n" = out ] || [ "$n" = .git ] || ln -s "$e" "$W/$n"; done; echo "$W"; }
P=(-r ./planned/recheck_preload.js)
case "${1:?k1|k2|run}" in
k1) W=$(shadow off); cd "$W"
    RECHECK_FIX=off node "${P[@]}" planned/amzband_run.js > /dev/null
    RECHECK_FIX=off node "${P[@]}" planned/rthrep_run.js 0 1 > /dev/null
    python3 - "$REPO" <<'EOF'
import glob, json, sys
R = sys.argv[1]
def rows(pat): return sorted(json.dumps(json.loads(l), sort_keys=True) for f in glob.glob(pat) for l in open(f) if l.strip())
ok = True
for name, old, new in (("AMZBAND", f"{R}/out/amzband/runs.jsonl", "out/amzband/runs.jsonl"), ("RTHREP", f"{R}/out/rthrep/runs_*.jsonl", "out/rthrep/runs_*.jsonl")):
    a, b = rows(old), rows(new); same = a == b; ok &= same
    print(f"K1 {name}: {len(b)} rows re-run with the wrapper off, {len(a)} stored: {'identical' if same else 'DIFFERENT'}")
print("K1", "PASS" if ok else "FAIL")
EOF
    ;;
k2) node -e '
      const L = require("./lab/lab_engine.js"), cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 };
      const p = { wingFixed: null, fleet: "filed", check: true, cell: 30, tb: 5, vsep: 10, frac: 0.2, outages: 6, sub: 4, d: 4, seed: 19, heights: "filed", contingency: "hold" };
      const a = L.run(cfg, p); process.env.RECHECK_FIX = "on"; require("./planned/recheck_preload.js"); const b = L.run(cfg, p);
      console.log("K2 hold d 4 seed 19: wrapper off", a.cross_wide, a.cross_close, a.contingencyEvents, "| on", b.cross_wide, b.cross_close, b.contingencyEvents, (a.cross_wide !== b.cross_wide || a.cross_close !== b.cross_close) ? "PASS (fix applied)" : "FAIL (no change)");' ;;
run) W=$(shadow on); cd "$W"; export RECHECK_FIX=on
    node "${P[@]}" planned/amzband_run.js > out/amzband.log
    for s in rthrep prelaunch prelaunch2 dfwbad dfwproc; do
      (node "${P[@]}" planned/${s}_run.js 0 2 > out/$s.0.log 2>&1 & node "${P[@]}" planned/${s}_run.js 1 2 > out/$s.1.log 2>&1 & wait)
      echo "$s done: $(cat out/$s/*.jsonl | wc -l) rows"; done
    for s in prelaunch prelaunch2 dfwbad dfwproc rthrep amzband; do echo "== $s checks"; node "${P[@]}" planned/${s}_run.js checks 2>&1 | tail -5 || true; done > out/checks.log
    echo "done: $W" ;;
esac
