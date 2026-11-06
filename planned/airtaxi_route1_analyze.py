"""AIRTAXI_ROUTE1 analysis (registration: planned/AIRTAXI_ROUTE1_PREREG.md). Run from the repo root after the runner:
   python3 planned/airtaxi_route1_analyze.py     (needs out/airtaxi_route1.json). Writes planned/AIRTAXI_ROUTE1_RESULTS_2026-10-29.md"""
import json, statistics, datetime
rows = json.load(open('out/airtaxi_route1.json'))
NAME = {'DFW': 'DFWc'}; drive = {}
for ln in open('taxi/data/drive_times_raw.tsv'):
    if ln.startswith('#') or ln.startswith('from'): continue
    a, b, t, lo, hi, *_ = ln.rstrip('\n').split('\t'); a, b = NAME.get(a, a), NAME.get(b, b); drive[(a, b, t)] = (float(lo) + float(hi)) / 2
ROUTES = {'DFW': [('AFW', 'DFWc'), ('AFW', 'TOY'), ('DFWc', 'TOY'), ('DFWc', '49T')], 'HOU': [('IAH', 'HOU'), ('IAH', 'EFD')]}
LABEL = {'AFW>DFWc': 'AFW-DFW', 'AFW>TOY': 'AFW-TOY', 'DFWc>TOY': 'DFW-TOY', 'DFWc>49T': 'DFW-49T', 'IAH>HOU': 'IAH-HOU', 'IAH>EFD': 'IAH-EFD'}
med = statistics.median
def estar(metro, f, a, b):
    out = []
    for r in rows:
        if r['part'] != 'A' or r['metro'] != metro or r['f'] != f: continue
        v = []
        for (x, y) in ((a, b), (b, a)):
            T = r['ods'].get(x + '>' + y, [0, 0, None])[2]
            if T is None: continue
            for t in ('08:00', '17:30'): v.append(drive[(x, y, t)] - T / 60)
        if v: out.append(sum(v) / len(v))
    return med(out)
E = {}
for m in ROUTES:
    for a, b in ROUTES[m]:
        k = LABEL[a + '>' + b]; E[k] = {f: estar(m, f, a, b) for f in (1.0, 1.15, 1.3)}
NET1 = {}
for ln in open('planned/airtaxi_net1_results_table.md'):
    c = [x.strip() for x in ln.split('|')]
    if len(c) > 4 and c[1] in E:
        try: NET1[c[1]] = float(c[3].split()[0])
        except: pass
P = []
chk = lambda n, ok, t: P.append((n, ok, t))
for k in E: d = E[k][1.0] - E[k][1.15]; chk('P1 ' + k, 0.7 <= d <= 2.1, f"peak E* {E[k][1.0]:.1f} -> {E[k][1.15]:.1f} min (fall {d:.2f}; predicted 0.7-2.1)")
for k in E: d = E[k][1.0] - E[k][1.3]; chk('P2 ' + k, 1.4 <= d <= 4.2, f"peak E* {E[k][1.0]:.1f} -> {E[k][1.3]:.1f} min at f=1.30 (fall {d:.2f}; predicted 1.4-4.2)")
o0 = sorted(E, key=lambda k: -E[k][1.0]); o1 = sorted(E, key=lambda k: -E[k][1.15]); chk('P3', o0 == o1, f"order f=1.00: {o0}; f=1.15: {o1}")
beat = lambda f: sorted(k for k in E if E[k][f] >= 40)
chk('P4', beat(1.15) == ['AFW-TOY'], f"routes with peak E* >= 40 min: f=1.00 {beat(1.0)}, f=1.15 {beat(1.15)}")
FL = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
def need(m, f):
    out = []
    for s in range(1, 11):
        got = 99
        for n in FL:
            rr = [x for x in rows if x['part'] == 'B' and x['metro'] == m and x['f'] == f and x['n'] == n and x['seed'] == s]
            if rr:
                N_, S_, _, w = rr[0]['tot']
                if N_ and S_ / N_ >= 0.95 and w is not None and w <= 600: got = n; break
        out.append(got)
    return med(out), (min(out), max(out))
fleet = {(m, f): need(m, f) for m in ('DFW', 'HOU') for f in (1.0, 1.15)}
chk('P5', all(abs(fleet[(m, 1.15)][0] - fleet[(m, 1.0)][0]) <= 1 for m in ('DFW', 'HOU')), '; '.join(f"{m}: {fleet[(m,1.0)][0]} -> {fleet[(m,1.15)][0]}" for m in ('DFW', 'HOU')))
for k in E:
    if k in NET1: chk('P6 ' + k, abs(E[k][1.0] - NET1[k]) <= 1.0, f"f=1.00 peak E* {E[k][1.0]:.1f} vs NET1 {NET1[k]:.1f}")
    else: chk('P6 ' + k, False, 'NET1 value not found in table')
npass = sum(1 for _, ok, _ in P if ok)
L = ['# AIRTAXI_ROUTE1 results (' + datetime.date.today().isoformat() + '): flight time on a path 15% longer than the straight line', 'Registration: planned/AIRTAXI_ROUTE1_PREREG.md. Runner planned/airtaxi_route1_run.js, analysis planned/airtaxi_route1_analyze.py.', '',
     f"**{npass} of {len(P)} predictions passed.**", '', '## Peak break-even E* (minutes of access time at which air = driving), fleet 24, r = 1.5', '| Route | f=1.00 | f=1.15 | f=1.30 |', '|---|---|---|---|']
for k in E: L.append(f"| {k} | {E[k][1.0]:.1f} | {E[k][1.15]:.1f} | {E[k][1.3]:.1f} |")
L += ['', '## Required fleet (95% served, median wait <= 10 min), r = 1.5, median over 10 seeds (min-max)', '| Metro | f=1.00 | f=1.15 |', '|---|---|---|']
for m in ('DFW', 'HOU'): L.append(f"| {m} | {fleet[(m,1.0)][0]} ({fleet[(m,1.0)][1][0]}-{fleet[(m,1.0)][1][1]}) | {fleet[(m,1.15)][0]} ({fleet[(m,1.15)][1][0]}-{fleet[(m,1.15)][1][1]}) |")
L += ['', '## Predictions', '| Prediction | Result | Verdict |', '|---|---|---|'] + [f"| {n} | {t} | {'PASS' if ok else '**FAIL**'} |" for n, ok, t in P]
open('planned/AIRTAXI_ROUTE1_RESULTS_2026-10-29.md', 'w').write('\n'.join(L) + '\n'); print('\n'.join(L))
