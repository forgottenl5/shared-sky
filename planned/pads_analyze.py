"""Analysis for PADS_PREREG.md; committed before runs."""
import glob, json
R = [json.loads(l) for f in glob.glob('out/pads/runs_*.jsonl') for l in open(f) if l.strip()]
SITES = ['amazon', 'wing', 'zipHOU', 'zipDFW']; LAY = ['random30', 'p10', 'p30', 'p60']
def g(s, m, l, k): rows = [r for r in R if (r['site'], r['mult'], r['layout']) == (s, m, l)]; return sum(r[k] for r in rows), rows
def mw(s, m, l): _, rows = g(s, m, l, 'meanWait'); return sum(r['meanWait'] for r in rows) / max(1, len(rows))
print('| Site | traffic | random pads (30 m square) | fixed, 10 m apart | fixed, 30 m | fixed, 60 m | mean pad wait (fixed) |\n|---|---|---|---|---|---|---|')
for s in SITES:
    for m in [1, 2]:
        print(f"| {s} | {m}x | " + ' | '.join(f"{g(s,m,l,'near300')[0]} ({g(s,m,l,'padLevel')[0]} low)" for l in LAY) + f" | {mw(s,m,'p30'):.0f} s |")
print('(near-site same-company wide meetings within 300 m, 3 seeds x 2 h; "low" = both drones below 20 m)')
P = []
f1 = {s: g(s, 1, 'p30', 'near300')[0] / max(1, g(s, 1, 'random30', 'near300')[0]) for s in SITES}; P.append(('F1 fixed 30 m pads <= 50 % of random pads at 1x, each site', ', '.join(f'{k} {100*v:.0f} %' for k, v in f1.items()), all(v <= 0.5 for v in f1.values())))
f2 = {s: [g(s, 1, l, 'near300')[0] for l in ['p10', 'p30', 'p60']] for s in SITES}; P.append(('F2 meetings fall with pad spacing 10 > 30 > 60 m at 1x, each site', ', '.join(f'{k} {v[0]}/{v[1]}/{v[2]}' for k, v in f2.items()), all(v[0] > v[1] > v[2] for v in f2.values())))
f3 = {s: mw(s, 1, 'p30') for s in ['wing', 'zipHOU', 'zipDFW']}; P.append(('F3 mean pad wait <= 30 s at 1x (Wing, Zipline Houston, Zipline DFW)', ', '.join(f'{k} {v:.0f} s' for k, v in f3.items()), all(v <= 30 for v in f3.values())))
f4 = {s: g(s, 1, 'random30', 'padLevel')[0] / max(1, g(s, 1, 'random30', 'near300')[0]) for s in SITES}; P.append(('F4 random-pad meetings are >= 50 % pad-level (both below 20 m) at 1x, each site', ', '.join(f'{k} {100*v:.0f} %' for k, v in f4.items()), all(v >= 0.5 for v in f4.values())))
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in P: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print('Amazon mean pad wait at 1x / 2x (20 pads assumed):', round(mw('amazon', 1, 'p30')), round(mw('amazon', 2, 'p30')), 's')
print(f'Runs read: {len(R)} (expected 96).')
