"""Analysis for HEADLINE2_PREREG.md; committed before runs."""
import glob, json, random, sys
R = [json.loads(l) for f in glob.glob('out/headline2/runs_*.jsonl') for l in open(f) if l.strip()]
if not R: sys.exit('No runs in out/headline2/: run `node planned/headline2_run.js <shard> <n>` first.')
M, ARMS, KEYS = ['houston', 'dfw'], ['A0', 'S1', 'R', 'A2'], ['v10', 'v15', 'v20', 'close']
def by(m, arm): return {r['seed']: r for r in R if r['metro'] == m and r['arm'] == arm}
random.seed(12345); B = 10000
def boot_rate(m, arm, k):
    d = by(m, arm); s = sorted(d); v = [d[x][k] / 2 for x in s]; est = sum(v) / len(v)
    bs = sorted(sum(random.choice(v) for _ in v) / len(v) for _ in range(B)); return est, bs[int(.025 * B)], bs[int(.975 * B)], min(v), max(v)
def boot_cut(m, other, k):
    a, o = by(m, 'A2'), by(m, other); s = sorted(set(a) & set(o)); est = 1 - sum(a[x][k] for x in s) / sum(o[x][k] for x in s)
    bs = []
    for _ in range(B):
        ss = [random.choice(s) for _ in s]; den = sum(o[x][k] for x in ss)
        if den: bs.append(1 - sum(a[x][k] for x in ss) / den)
    bs.sort(); return est, bs[int(.025 * len(bs))], bs[int(.975 * len(bs))]
CUT = {}
for m in M:
    print(f"\n## {m.upper()}: close calls per hour between companies (bounded window; mean of seeds, 95 % seed bootstrap, seed range)")
    print('| Heights | 10 m vertical | 15 m | 20 m | 15 m / 5 m (very close) |\n|---|---|---|---|---|')
    for arm in ARMS:
        cells = []
        for k in KEYS: e, lo, hi, mn, mx = boot_rate(m, arm, k); cells.append(f"{e:.1f} [{lo:.1f}-{hi:.1f}] ({mn:.1f}-{mx:.1f})")
        print(f"| {arm} | " + ' | '.join(cells) + ' |')
    print('\n| Shared out (A2) against | 10 m | 15 m | 20 m | very close |\n|---|---|---|---|---|')
    for other in ['A0', 'S1', 'R']:
        cells = []
        for k in KEYS: e, lo, hi = boot_cut(m, other, k); CUT[m, other, k] = (e, lo, hi); cells.append(f"{100*e:.0f} % [{100*lo:.0f}-{100*hi:.0f}]")
        print(f"| {other} | " + ' | '.join(cells) + ' |')
    a0 = by(m, 'A0'); bu, ub = sum(r['v10'] for r in a0.values()), sum(r['v10_unbounded'] for r in a0.values())
    CUT[m, 'win'] = (bu, ub); print(f"\nWindow fix, A0 10 m: bounded {bu} vs unbounded {ub} ({100*(ub-bu)/ub:.1f} % fewer)")
    P = {}
    for r in a0.values():
        for k, x in r['pairs'].items(): P[k] = P.get(k, 0) + x
    print('A0 pairs (10 m): ' + ', '.join(f"{k} {x}" for k, x in sorted(P.items(), key=lambda t: -t[1])))
h1 = CUT['houston', 'S1', 'v10']; h2 = CUT['dfw', 'S1', 'v10']
P = [('H1 Houston vs S1: 60-80 % and interval < 25 points', f"{100*h1[0]:.0f} % [{100*h1[1]:.0f}-{100*h1[2]:.0f}]", 0.60 <= h1[0] <= 0.80 and (h1[2] - h1[1]) < 0.25),
     ('H2 DFW vs S1: 55-80 %', f"{100*h2[0]:.0f} % [{100*h2[1]:.0f}-{100*h2[2]:.0f}]", 0.55 <= h2[0] <= 0.80),
     ('H3 15 m vertical vs S1 below 50 % in both', f"Houston {100*CUT['houston','S1','v15'][0]:.0f} %, DFW {100*CUT['dfw','S1','v15'][0]:.0f} %", CUT['houston', 'S1', 'v15'][0] < 0.5 and CUT['dfw', 'S1', 'v15'][0] < 0.5),
     ('H4 window fix changes A0 by < 10 % in both', ', '.join(f"{m} {100*(CUT[m,'win'][1]-CUT[m,'win'][0])/CUT[m,'win'][1]:.1f} %" for m in M), all((CUT[m, 'win'][1] - CUT[m, 'win'][0]) / CUT[m, 'win'][1] < 0.10 for m in M)),
     ('H5 vs R, 10 m: 15-45 % in both', f"Houston {100*CUT['houston','R','v10'][0]:.0f} %, DFW {100*CUT['dfw','R','v10'][0]:.0f} %", all(0.15 <= CUT[m, 'R', 'v10'][0] <= 0.45 for m in M))]
print('\n| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in P: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print(f"\nRuns read: {len(R)} (expected 80).")
