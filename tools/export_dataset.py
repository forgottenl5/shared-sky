#!/usr/bin/env python3
"""Export the Shared Sky results as plain Parquet tables (for dataset hosting sites).

Reads only files that are in the public release:
  planned/raw/out_snapshot.tar.xz  -> out/headline2/runs_*.jsonl  (HEADLINE2, the headline study: 80 runs)
  docs/houston.html, docs/dfw.html -> embedded scenario data (the site's demo patch)
  docs/data/{hou,dfw}_*.js         -> flights for the other demo scenarios

Usage: python3 tools/export_dataset.py OUTDIR
Writes OUTDIR/data/{headline_runs,demo_scenarios,demo_conflicts,demo_flights}.parquet (+ .csv for the small tables)
and checks the headline cuts against planned/HEADLINE2_RESULTS_2026-10-25.md (72 % Houston, 73 % DFW).
"""
import json, os, re, sys, tarfile
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]
os.makedirs(os.path.join(OUT, "data"), exist_ok=True)

# ---------- headline study (HEADLINE2) ----------
ARMS = {  # planned/HEADLINE2_PREREG.md
    "A0": ("omaha_profile", "Amazon 61 m out / 105 m back (FAA Omaha noise analysis); Wing 46-91 m; Zipline 101 m"),
    "S1": ("best_sourced", "Amazon 69 m out / back anywhere in 85-115 m (best-sourced); Wing 46-91 m; Zipline 101 m"),
    "R": ("high_return", "Amazon 69 m out / 122 m back (secondhand staff remark only); Wing 46-91 m; Zipline 101 m"),
    "A2": ("shared_out", "Each company its own height inside its filed band: Wing 46-71 m, Amazon 81 m out / 115 m back, Zipline 101 m"),
}
rows = []
with tarfile.open(os.path.join(ROOT, "planned/raw/out_snapshot.tar.xz")) as tf:
    for m in tf.getmembers():
        if re.fullmatch(r"out/headline2/runs_\d+\.jsonl", m.name):
            for line in tf.extractfile(m).read().decode().splitlines():
                if line.strip():
                    rows.append(json.loads(line))
assert len(rows) == 80, len(rows)
H = pd.DataFrame([{
    "metro": r["metro"], "arm": r["arm"], "arm_name": ARMS[r["arm"]][0], "heights": ARMS[r["arm"]][1], "seed": r["seed"],
    "measured_hours": 2.0,
    "conflicts_10m": r["v10"], "conflicts_15m": r["v15"], "conflicts_20m": r["v20"], "tight_15m_5m": r["close"],
    "conflicts_10m_unbounded": r["v10_unbounded"],
    "amazon_wing": r["pairs"].get("amazon-wing", 0), "amazon_zipline": r["pairs"].get("amazon-zipline", 0),
    "wing_zipline": r["pairs"].get("wing-zipline", 0),
    "flights": r["flights"], "sites_wing": r["sites"]["wing"], "sites_zipline": r["sites"]["zipline"], "sites_amazon": r["sites"]["amazon"],
} for r in rows]).sort_values(["metro", "arm", "seed"]).reset_index(drop=True)
for metro, want in (("houston", 72), ("dfw", 73)):
    d = H[H.metro == metro]
    cut = 100 * (1 - d[d.arm == "A2"].conflicts_10m.sum() / d[d.arm == "S1"].conflicts_10m.sum())
    assert round(cut) == want, (metro, cut)
    print(f"check: {metro} shared out vs best-sourced, 10 m: {cut:.1f} % cut (results file: {want} %)")

# ---------- site demo patch ----------
OPN = {0: "wing", 1: "zipline", 2: "amazon"}
PAIR = {"aw": "amazon-wing", "wa": "amazon-wing", "az": "amazon-zipline", "za": "amazon-zipline", "wz": "wing-zipline", "zw": "wing-zipline"}
LABEL = {"filed": "Filed profile", "sourced": "Best-sourced Amazon", "reported": "High return (staff remark)", "shared": "Shared out",
         "checked": "Shared out + plan sharing", "layered": "Zipline on top + 5 m blocks", "holdFiled": "Bad day, filed profile",
         "holdReported": "Bad day, high return", "holdShared": "Bad day, shared out"}
CITY = {"houston": "hou", "dfw": "dfw"}

def page_data(city):
    s = open(os.path.join(ROOT, f"docs/{city}.html"), encoding="utf8").read()
    return json.loads(re.search(r'<script type="application/json" id="data">(.*?)</script>', s, re.S).group(1)), s

def page_desc(src):
    m = re.search(r"var DESC = \{(.*?)\};", src, re.S)
    return {k: re.sub(r"<[^>]+>", "", v).replace("\\'", "'") for k, v in re.findall(r"(\w+): '((?:[^'\\]|\\.)*)'", m.group(1))}

def lazy_flights(path, key):
    s = open(path, encoding="utf8").read()
    return json.loads(s[s.index("=", s.index(f'["{key}"]')) + 1:].rstrip().rstrip(";"))

def decode(a):  # [op, t0, x0, y0, z0, (dt, x, y, z)...]
    t = a[1]; T, X, Y, Z = [t], [a[2]], [a[3]], [a[4]]
    for i in range(5, len(a) - 3, 4):
        t += a[i]; T.append(round(t, 1)); X.append(a[i + 1]); Y.append(a[i + 2]); Z.append(a[i + 3])
    return OPN[a[0]], T, X, Y, Z

scen, conf, fl = [], [], []
for city, c3 in CITY.items():
    o, src = page_data(city); desc = page_desc(src); meta = o["meta"]
    filed = o["sc"]["filed"]["flights"]
    for k, v in o["sc"].items():
        F = v["flights"] or (lazy_flights(os.path.join(ROOT, "docs/data", f"{c3}_{k}.js"), f"{c3}_{k}") if k != "filed" else filed)
        dl = v.get("delays") or {}
        scen.append({"metro": city, "scenario": k, "label": LABEL[k], "description": desc.get(k, ""),
                     "conflicts_10m": v["wide"], "tight_15m_5m": v["close"], "conflicts_10m_unbounded": v["all_wide"],
                     "holds": v["holds"], "flights": len(F), "plan_check_delayed": dl.get("delayed"), "plan_check_cancelled": dl.get("cancelled")})
        for e in v["events"]:
            conf.append({"metro": city, "scenario": k, "kind": "tight" if e[0] else "conflict", "t_s": e[1],
                         "x_m": e[2], "y_m": e[3], "z_m": e[4], "pair": PAIR.get(e[5], e[5])})
        for i, a in enumerate(F):
            op, T, X, Y, Z = decode(a)
            fl.append({"metro": city, "scenario": k, "flight": i, "company": op, "start_s": T[0], "end_s": T[-1],
                       "t_s": T, "x_m": X, "y_m": Y, "z_m": Z})
        assert sum(1 for e in v["events"] if not e[0]) == v["wide"]
    print(f"{city}: demo patch {meta['zone_m'] / 1000:.0f} km zone, sites every {meta['d_km']} km, {len(o['sites'])} sites near the zone")

S, C, Fl = pd.DataFrame(scen), pd.DataFrame(conf), pd.DataFrame(fl)
hs = S[(S.metro == "houston") & S.scenario.isin(["sourced", "shared"])].set_index("scenario").conflicts_10m
assert (hs["sourced"], hs["shared"]) == (92, 33), hs  # the counters in the Houston Short
for name, df in (("headline_runs", H), ("demo_scenarios", S), ("demo_conflicts", C), ("demo_flights", Fl)):
    df.to_parquet(os.path.join(OUT, "data", f"{name}.parquet"), index=False)
    if name != "demo_flights":
        df.to_csv(os.path.join(OUT, "data", f"{name}.csv"), index=False)
    print(f"{name}: {len(df)} rows")
