"""AIRTAXI_NET2 analysis (registration: planned/AIRTAXI_NET2_PREREG.md). Run from the repo root after the runner:
   python3 planned/airtaxi_net2_analyze.py    (needs out/airtaxi_net2_fleet_*.json and out/airtaxi_net2_pads_*.json)
Writes planned/AIRTAXI_NET2_RESULTS_2026-10-26.md."""
import glob, json, statistics, sys
FL = [x for f in sorted(glob.glob('out/airtaxi_net2_fleet_*.json')) for x in json.load(open(f))]
PD = [x for f in sorted(glob.glob('out/airtaxi_net2_pads_*.json')) for x in json.load(open(f))]
if not FL or not PD: sys.exit('missing out/airtaxi_net2_fleet_*.json or out/airtaxi_net2_pads_*.json: run planned/airtaxi_net2_run.js first')
def med(a): return statistics.median(a) if a else None
def mm(a): return f'{med(a):g} ({min(a):g}-{max(a):g})'
RATES, PADS, OCC = (1.5, 3, 6, 12), (1, 2, 4), (60, 90, 180)
BUSY = {'DFW': ('DFWc', 6), 'HOU': ('IAH', 4)}
SITES = {'DFW': ['AFW', 'DFWc', 'TOY', '49T'], 'HOU': ['IAH', 'HOU', 'EFD']}
NAME = {'DFWc': 'DFW Airport (Corporate Aviation)', 'AFW': 'Alliance', 'TOY': 'Toyota HQ', '49T': 'Downtown Dallas (49T)', 'IAH': 'IAH', 'HOU': 'Hobby', 'EFD': 'Ellington'}
def fl(metro, c, r): return [x['fleet'] for x in FL if x['metro'] == metro and x['c'] == c and x['r'] == r]
def pd(metro, r, pads, occ): return [x for x in PD if x['metro'] == metro and x['r'] == r and x['pads'] == pads and x['occ'] == occ]
P = []
def chk(n, ok, t): P.append((n, ok, t))
# K2, K3
k2 = {m: med(fl(m, 3.2, 1.5)) for m in ('DFW', 'HOU')}
chk('K2', abs(k2['DFW'] - 8) <= 2 and abs(k2['HOU'] - 6) <= 2, f"v2 base fleet at r 1.5: DFW {k2['DFW']} (NET1 8), Houston {k2['HOU']} (NET1 6)")
chk('K3', all(x['k3'] for x in PD), f"{sum(1 for x in PD if x['k3'])} of {len(PD)} runs consistent")
# pads needed
def need_seed(rows):
    out = {}
    for x in rows:
        ok = all(v['holdP95'] <= 120 and v['depP95'] <= 120 for v in x['sites'].values())
        if ok: out[x['s']] = min(out.get(x['s'], 99), x['pads'])
        else: out.setdefault(x['s'], 99)
    return [out[s] for s in sorted(out)]
need = {}
for m in ('DFW', 'HOU'):
    for r in RATES:
        for o in OCC: need[(m, r, o)] = need_seed([x for x in PD if x['metro'] == m and x['r'] == r and x['occ'] == o])
Q2 = {'DFW': {1.5: (1,), 3: (1, 2), 6: (2,), 12: (4,)}, 'HOU': {1.5: (1,), 3: (1,), 6: (2,), 12: (2,)}}
for m in ('DFW', 'HOU'):
    for r in RATES:
        v = med(need[(m, r, 90)]); chk(f'Q2 {m} r {r}', v in Q2[m][r], f'pads needed at 90 s: {mm(need[(m, r, 90)])} (predicted {" or ".join(map(str, Q2[m][r]))}; 99 = more than 4)')
q3 = []
for m in ('DFW', 'HOU'):
    for r in (3, 6, 12):
        a, b = med(need[(m, r, 90)]), med(need[(m, r, 180)]); q3.append((m, r, a, b, b > a or (a >= 99 and b >= 99)))
chk('Q3', all(x[4] for x in q3), '; '.join(f'{m} r {r}: 90 s {a:g} -> 180 s {b:g}' for m, r, a, b, _ in q3))
# Q1 queue law at the busiest site
lo, hi = [], []
for m in ('DFW', 'HOU'):
    site, k = BUSY[m]
    for r in RATES:
        for p in PADS:
            for o in OCC:
                rho = k * r * o / (3600 * p); h = med([x['sites'][site]['holdP95'] for x in pd(m, r, p, o)])
                if rho <= 0.35: lo.append((m, r, p, o, rho, h))
                if p == 1 and o >= 90 and rho >= 0.6: hi.append((m, r, p, o, rho, h))
bad_lo = [x for x in lo if x[5] > 120]; bad_hi = [x for x in hi if x[5] <= 120]
chk('Q1a', not bad_lo, f'{len(lo)} light-load cases; exceptions: ' + (', '.join(f'{m} r{r} {p} pad {o}s rho {rho:.2f} p95 {h:.0f}s' for m, r, p, o, rho, h in bad_lo) or 'none'))
chk('Q1b', not bad_hi, f'{len(hi)} heavy one-pad cases; exceptions: ' + (', '.join(f'{m} r{r} {o}s rho {rho:.2f} p95 {h:.0f}s' for m, r, p, o, rho, h in bad_hi) or 'none'))
# Q4 stands (2 pads, 90 s)
def standmax(m, r): return med([max(v['standMax'] for v in x['sites'].values()) for x in pd(m, r, 2, 90)])
chk('Q4', standmax('DFW', 1.5) <= 6 and standmax('HOU', 1.5) <= 6 and standmax('DFW', 12) >= 12, f"busiest-site max stands at r 1.5: DFW {standmax('DFW', 1.5):g}, Houston {standmax('HOU', 1.5):g}; DFW r 12: {standmax('DFW', 12):g}")
q5 = {m: med(fl(m, 1.5, 1.5)) for m in ('DFW', 'HOU')}
chk('Q5', q5['DFW'] <= 12 and q5['HOU'] <= 8, f"slow-charging fleet, v2: DFW {mm(fl('DFW', 1.5, 1.5))} (v1 12), Houston {mm(fl('HOU', 1.5, 1.5))} (v1 8)")
q6 = {m: med([x['net']['dead'] / x['net']['flights'] for x in pd(m, 1.5, 2, 90)]) for m in ('DFW', 'HOU')}
chk('Q6', all(0.02 <= v <= 0.25 for v in q6.values()), 'repositioning share of flights: ' + ', '.join(f'{m} {v:.1%}' for m, v in q6.items()))
# ---- output
L = ['# AIRTAXI_NET2 results (run 2026-10-26; registration planned/AIRTAXI_NET2_PREREG.md)', '', 'Scenario model, engine taxi/net2.js. Pad counts, pad occupancy times, stands and demand are assumptions (none are public). Not a forecast.', '',
     '## Checks and predictions', '', '| # | Result | Detail |', '|---|---|---|'] + [f'| {n} | {"pass" if ok else "**FAIL**"} | {t} |' for n, ok, t in P]
pp = [x for x in P if x[0].startswith('Q')]
L += ['', f'{sum(1 for x in pp if x[1])} of {len(pp)} predictions passed.', '', '## Fleet used (smallest meeting >= 95 % served, median wait <= 10 min, with ample ground; median over 10 seeds, min-max)', '',
      '| Metro | r = 1.5 | r = 3 | r = 6 | r = 12 |', '|---|---|---|---|---|']
for m in ('DFW', 'HOU'):
    L.append(f'| {m} ({"trips an hour: 12 / 24 / 48 / 96" if m == "DFW" else "trips an hour: 6 / 12 / 24 / 48"}) | ' + ' | '.join(mm(fl(m, 3.2, r)) for r in RATES) + ' |')
L += ['', '## Pads needed at every site (p95 air hold and p95 pad wait both <= 2 min; median over seeds, min-max; 99 = more than 4)', '', '| Metro | Pad occupancy | r = 1.5 | r = 3 | r = 6 | r = 12 |', '|---|---|---|---|---|---|']
for m in ('DFW', 'HOU'):
    for o in OCC: L.append(f'| {m} | {o} s | ' + ' | '.join(mm(need[(m, r, o)]) for r in RATES) + ' |')
L += ['', '## Per site, 2 pads, 90 s occupancy (median over seeds)', '', '| Metro | r | Site | Movements an hour (busiest hour) | p95 air hold (s) | p95 pad wait (s) | Stands: max (p95 of time) |', '|---|---|---|---|---|---|---|']
for m in ('DFW', 'HOU'):
    for r in RATES:
        rows = pd(m, r, 2, 90)
        for s in SITES[m]:
            g = lambda k: med([x['sites'][s][k] for x in rows])
            L.append(f'| {m} | {r:g} | {NAME[s]} | {g("mov") / 12:.1f} ({g("busiest"):g}) | {g("holdP95"):.0f} | {g("depP95"):.0f} | {g("standMax"):g} ({g("standP95"):g}) |')
L += ['', '## Network service with the pads available (median over seeds; served share / median wait in min)', '', '| Metro | Pad occupancy | Pads | r = 1.5 | r = 3 | r = 6 | r = 12 |', '|---|---|---|---|---|---|---|']
for m in ('DFW', 'HOU'):
    for o in OCC:
        for p in PADS:
            cell = lambda r: f"{med([x['net']['served'] / x['net']['n'] for x in pd(m, r, p, o)]):.0%} / {med([x['net']['medWait'] or 0 for x in pd(m, r, p, o)]) / 60:.1f}"
            L.append(f'| {m} | {o} s | {p} | ' + ' | '.join(cell(r) for r in RATES) + ' |')
open('planned/AIRTAXI_NET2_RESULTS_2026-10-26.md', 'w').write('\n'.join(L) + '\n')
print('\n'.join(L))
