"""AIRTAXI_NET1 analysis (registration: planned/AIRTAXI_NET1_PREREG.md). Run from the repo root after the runner:
   python3 planned/airtaxi_net1_analyze.py     (needs out/airtaxi_net1_*.json)
Writes planned/AIRTAXI_NET1_RESULTS_2026-10-26.md and planned/airtaxi_net1_results_table.md."""
import glob, json, os, statistics, sys
rows = []
for f in sorted(glob.glob('out/airtaxi_net1_*.json')): rows += json.load(open(f))
if not rows: sys.exit('no out/airtaxi_net1_*.json found: run planned/airtaxi_net1_run.js first')
grid = [r for r in rows if r['tag'] == 'grid']; speed = [r for r in rows if r['tag'] == 'speed']
NAME = {'DFW': 'DFWc'}
drive = {}   # (from, to, time) -> midpoint minutes
for ln in open('taxi/data/drive_times_raw.tsv'):
    if ln.startswith('#') or ln.startswith('from'): continue
    a, b, t, lo, hi, *_ = ln.rstrip('\n').split('\t'); a, b = NAME.get(a, a), NAME.get(b, b)
    drive[(a, b, t)] = (float(lo) + float(hi)) / 2
ROUTES = {'DFW': [('AFW', 'DFWc'), ('AFW', 'TOY'), ('DFWc', 'TOY'), ('DFWc', '49T')], 'HOU': [('IAH', 'HOU'), ('IAH', 'EFD')]}
LABEL = {'AFW>DFWc': 'AFW-DFW', 'AFW>TOY': 'AFW-TOY', 'DFWc>TOY': 'DFW-TOY', 'DFWc>49T': 'DFW-49T', 'IAH>HOU': 'IAH-HOU', 'IAH>EFD': 'IAH-EFD'}
SEEDS = range(1, 11)
def med(a): return statistics.median(a) if a else None
def rng(a): return (min(a), max(a)) if a else (None, None)
def sel(**kw): return [r for r in grid if all(r[k] == v for k, v in kw.items())]
BASE = dict(U=100, c=3.2, r=1.5)

# ---- break-even E*: fleet 24, base case (or speed variants)
def estar(rs, a, b, which):
    """per-seed E* for route (a,b) averaged over both directions and the times in `which`; rs = rows for one metro/case, one per seed."""
    out = []
    for r in rs:
        v = []
        for (x, y) in ((a, b), (b, a)):
            T = r['ods'].get(x + '>' + y, [0, 0, None])[2]
            if T is None: continue
            for t in which: v.append(drive[(x, y, t)] - T / 60)
        if v: out.append(sum(v) / len(v))
    return out
PEAK, NOON = ('08:00', '17:30'), ('12:00',)
res = {}
for metro in ('DFW', 'HOU'):
    rs = sel(metro=metro, n=24, **BASE)
    for a, b in ROUTES[metro]:
        k = LABEL[a + '>' + b]
        pk, nn = estar(rs, a, b, PEAK), estar(rs, a, b, NOON)
        res[k] = dict(metro=metro, peak=med(pk), peak_r=rng(pk), noon=med(nn), noon_r=rng(nn),
                      T=med([r['ods'][a + '>' + b][2] / 60 for r in rs if r['ods'].get(a + '>' + b, [0, 0, None])[2]]))
# ---- required fleet
FL = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
def need(metro, U, c, r):
    out = []
    for s in SEEDS:
        got = 99
        for n in FL:
            rr = [x for x in grid if x['metro'] == metro and x['U'] == U and x['c'] == c and x['r'] == r and x['n'] == n and x['s'] == s]
            if not rr: continue
            N_, S_, _, w, _ = rr[0]['tot']
            if N_ and S_ / N_ >= 0.95 and w is not None and w <= 600: got = n; break
        out.append(got)
    return out
fleet = {}
for metro in ('DFW', 'HOU'):
    for U in (60, 100, 150):
        for c in (1.5, 3.2):
            for r in (0.5, 1.5, 3):
                v = need(metro, U, c, r); fleet[(metro, U, c, r)] = (med(v), rng(v))
# ---- predictions
P = []
def chk(name, ok, text): P.append((name, ok, text));
P1 = {'AFW-TOY': (33, 48), 'AFW-DFW': (22, 37), 'DFW-49T': (18, 32), 'IAH-EFD': (22, 35), 'IAH-HOU': (21, 35), 'DFW-TOY': (11, 24)}
for k, (lo, hi) in P1.items(): chk('P1 ' + k, lo <= res[k]['peak'] <= hi, f"peak E* {res[k]['peak']:.1f} min (predicted {lo}-{hi}; seed range {res[k]['peak_r'][0]:.1f} to {res[k]['peak_r'][1]:.1f})")
top = max(res, key=lambda k: res[k]['peak']); bot = min(res, key=lambda k: res[k]['peak'])
chk('P2', top == 'AFW-TOY' and bot == 'DFW-TOY', f"highest {top} ({res[top]['peak']:.1f}), lowest {bot} ({res[bot]['peak']:.1f})")
d3 = {k: res[k]['peak'] - res[k]['noon'] for k in res}
chk('P3', all(3 <= v <= 20 for v in d3.values()), 'peak minus noon E*: ' + ', '.join(f'{k} {v:.1f}' for k, v in d3.items()))
win40 = sorted(k for k in res if res[k]['peak'] > 40)
chk('P8', win40 == ['AFW-TOY'], f"routes where peak E* > 40 min: {win40}")
bf = {m: fleet[(m, 100, 3.2, 1.5)] for m in ('DFW', 'HOU')}
chk('P4 DFW', 6 <= bf['DFW'][0] <= 11, f"required fleet {bf['DFW'][0]} (seed range {bf['DFW'][1]}); predicted 6-11")
chk('P4 HOU', 4 <= bf['HOU'][0] <= 8, f"required fleet {bf['HOU'][0]} (seed range {bf['HOU'][1]}); predicted 4-8")
def ratio(a, b): return None if a is None or b is None or a >= 99 or b >= 99 else a / b
r5 = {m: ratio(fleet[(m, 100, 1.5, 1.5)][0], fleet[(m, 100, 3.2, 1.5)][0]) for m in ('DFW', 'HOU')}
chk('P5', any(v is not None and v >= 1.3 for v in r5.values()), 'slow/base fleet ratio: ' + str({m: (round(v, 2) if v else v) for m, v in r5.items()}))
r6 = {m: ratio(fleet[(m, 60, 3.2, 1.5)][0], fleet[(m, 150, 3.2, 1.5)][0]) for m in ('DFW', 'HOU')}
chk('P6', any(v is not None and v >= 1.2 for v in r6.values()), 'U60/U150 fleet ratio: ' + str({m: (round(v, 2) if v else v) for m, v in r6.items()}))
r7 = {m: ratio(fleet[(m, 100, 3.2, 3)][0], fleet[(m, 100, 3.2, 0.5)][0]) for m in ('DFW', 'HOU')}
ev = [v for v in r7.values() if v is not None]
chk('P7', bool(ev) and len(ev) == 2 and all(v >= 2.5 for v in ev), 'r3/r0.5 fleet ratio: ' + str({m: (round(v, 2) if v else 'not reached') for m, v in r7.items()}))
# ---- speed sensitivity
sp = {}
for v in (55, 67, 89):
    for metro in ('DFW', 'HOU'):
        rs = [r for r in speed if r['metro'] == metro and r['v'] == v] if v != 67 else sel(metro=metro, n=24, **BASE)
        for a, b in ROUTES[metro]: sp[(LABEL[a + '>' + b], v)] = med(estar(rs, a, b, PEAK))
# ---- output
L = ['# AIRTAXI_NET1 results (run 2026-10-26; registration planned/AIRTAXI_NET1_PREREG.md)', '', 'Scenario model: every demand, range, charging and ground-access value is an assumption (see the registration). Driving = Google "typically" range midpoint, read once. Not a forecast.', '']
L += ['## Predictions', '', '| # | Result | Detail |', '|---|---|---|'] + [f'| {n} | {"pass" if ok else "**FAIL**"} | {t} |' for n, ok, t in P]
L += ['', f'{sum(1 for _, ok, _ in P if ok)} of {len(P)} passed.', '', '## Break-even access time E* (minutes of getting to and from the pad at which air = driving midpoint)', '',
      'Base case (usable range 100 km, charging 3.2 km/min, r = 1.5), fleet 24 so queueing is negligible. Median over 10 seeds; T_air = request to landing-pad-clear.', '',
      '| Route | T_air (min) | E* peak (08:00, 17:30) | E* noon | Air beats driving at peak with E = 20 / 40 / 60? |', '|---|---|---|---|---|']
for k, v in res.items(): L.append(f"| {k} | {v['T']:.1f} | {v['peak']:.1f} ({v['peak_r'][0]:.1f} to {v['peak_r'][1]:.1f}) | {v['noon']:.1f} | " + ' / '.join('yes' if v['peak'] > e else 'no' for e in (20, 40, 60)) + ' |')
L += ['', '## Aircraft needed (smallest fleet with >= 95 % served and median wait <= 10 min; median over 10 seeds, min-max; 99 = not reached at 24)', '',
      '| Metro | Usable range (km) | Charging (km/min) | r = 0.5 | r = 1.5 | r = 3 |', '|---|---|---|---|---|---|']
for metro in ('DFW', 'HOU'):
    for U in (60, 100, 150):
        for c in (1.5, 3.2):
            L.append(f'| {metro} | {U} | {c} | ' + ' | '.join(f'{fleet[(metro, U, c, r)][0]} ({fleet[(metro, U, c, r)][1][0]}-{fleet[(metro, U, c, r)][1][1]})' for r in (0.5, 1.5, 3)) + ' |')
L += ['', '## Sensitivity: cruise speed (peak E*, minutes)', '', '| Route | 55 m/s (123 mph) | 67 m/s (150 mph, base) | 89 m/s (200 mph) |', '|---|---|---|---|']
for k in res: L.append(f"| {k} | {sp[(k, 55)]:.1f} | {sp[(k, 67)]:.1f} | {sp[(k, 89)]:.1f} |")
open('planned/AIRTAXI_NET1_RESULTS_2026-10-26.md', 'w').write('\n'.join(L) + '\n')
open('planned/airtaxi_net1_results_table.md', 'w').write('\n'.join(L[L.index('## Break-even access time E* (minutes of getting to and from the pad at which air = driving midpoint)'):]) + '\n')
print('\n'.join(L))
