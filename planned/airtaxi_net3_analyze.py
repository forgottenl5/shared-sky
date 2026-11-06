"""AIRTAXI_NET3 analysis (registration planned/AIRTAXI_NET3_PREREG.md). Run from the repo root after the runner:
   python3 planned/airtaxi_net3_analyze.py > planned/airtaxi_net3_results_table.md"""
import glob, json, statistics, sys
FL = [x for f in sorted(glob.glob('out/airtaxi_net3_fleet_*.json')) for x in json.load(open(f))]
PD = [x for f in sorted(glob.glob('out/airtaxi_net3_pads_*.json')) for x in json.load(open(f))]
if not FL or not PD: sys.exit('missing out/airtaxi_net3_fleet_*.json or _pads_*.json')
med = statistics.median
RATES, PADS, OCC, ARMS, MET = (1.5, 3, 6, 12), (1, 2, 4), (60, 90, 180), ['OLD', 'U60', 'U100', 'U160', 'U100-30'], ('DFW', 'HOU')
LIST = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96]
NET2 = {'DFW': {1.5: 8, 3: 14, 6: 24, 12: 48}, 'HOU': {1.5: 5, 3: 8, 6: 14, 12: 28}}
fl = lambda a, m, r: [x['fleet'] for x in FL if x['arm'] == a and x['metro'] == m and x['r'] == r]
def step(v):   # index in the fleet list (medians may fall between two entries)
    return min(range(len(LIST)), key=lambda i: abs(LIST[i] - v))
print('## Required fleet, median (min-max) over 10 seeds; 96 = not reached\n')
print('| metro | r | NET2 | ' + ' | '.join(ARMS) + ' |\n|---|---|---|' + '---|' * len(ARMS))
for m in MET:
    for r in RATES:
        print(f'| {m} | {r} | {NET2[m][r]} | ' + ' | '.join(f'{med(fl(a, m, r)):g} ({min(fl(a, m, r))}-{max(fl(a, m, r))})' for a in ARMS) + ' |')
print('\n## Infeasible requests (route energy + reserve > battery), share of requests, at the found fleet\n')
for a in ARMS:
    print(f'- {a}: ' + '; '.join(f"{m} {100 * sum(x['net']['infeasible'] for x in FL if x['arm'] == a and x['metro'] == m) / max(1, sum(x['net']['n'] for x in FL if x['arm'] == a and x['metro'] == m)):.0f} %" for m in MET))
def need_seed(rows):
    out = {}
    for x in rows:
        ok = all(v['holdP95'] <= 120 and v['depP95'] <= 120 for v in x['sites'].values())
        out.setdefault(x['s'], 99)
        if ok: out[x['s']] = min(out[x['s']], x['pads'])
    return [out[s] for s in sorted(out)]
print('\n## Pads needed (p95 hold and departure wait <= 2 min at every site), median over seeds; 99 = more than 4\n')
print('| arm | metro | r | 60 s | 90 s | 180 s |\n|---|---|---|---|---|---|')
for a in ('OLD', 'U100'):
    for m in MET:
        for r in RATES:
            print(f'| {a} | {m} | {r} | ' + ' | '.join(f"{med(need_seed([x for x in PD if x['arm'] == a and x['metro'] == m and x['r'] == r and x['occ'] == o])):g}" for o in OCC) + ' |')
print('\n## Landings below reserve (share of all landings in the run) and 5th-percentile reserve left at those landings (min of cruise)\n')
print('| arm | metro | r | pads | occ | meets pad criterion (seeds) | below reserve | reserve left p05 |\n|---|---|---|---|---|---|---|---|')
for a in ('OLD', 'U100'):
    for m in MET:
        for r in RATES:
            for p in PADS:
                for o in OCC:
                    rows = [x for x in PD if x['arm'] == a and x['metro'] == m and x['r'] == r and x['pads'] == p and x['occ'] == o]
                    okn = sum(all(v['holdP95'] <= 120 and v['depP95'] <= 120 for v in x['sites'].values()) for x in rows)
                    L = sum(x['net']['landings'] for x in rows); B = sum(x['net']['below'] for x in rows); lefts = [x['net']['belowP05Min'] for x in rows if x['net']['belowP05Min'] is not None]
                    print(f'| {a} | {m} | {r} | {p} | {o} | {okn}/10 | {100 * B / max(1, L):.1f} % | {min(lefts) / 1:.1f} |' if lefts else f'| {a} | {m} | {r} | {p} | {o} | {okn}/10 | {100 * B / max(1, L):.1f} % | - |')
V = []
def verdict(n, t, ok, d): V.append((n, ok)); print(f"{'PASS' if ok else 'FAIL'} {n}: {t} -- {d}")
print('\n## Checks and predictions\n')
k2 = {m: med(fl('OLD', m, 1.5)) for m in MET}
verdict('K2', 'OLD at r 1.5 within 2 of NET2', abs(k2['DFW'] - 8) <= 2 and abs(k2['HOU'] - 5) <= 2, k2)
verdict('K3', 'pad-grid consistency', all(x['k3'] for x in PD), f"{sum(x['k3'] for x in PD)} of {len(PD)}")
cells = [(m, r) for m in MET for r in RATES]
n1 = sum(med(fl('OLD', m, r)) <= NET2[m][r] for m, r in cells)
verdict('F1', 'OLD on v3 needs no more aircraft than NET2 in >= 6 of 8 cells', n1 >= 6, f'{n1} of 8: ' + '; '.join(f"{m} {r}: {med(fl('OLD', m, r)):g} vs {NET2[m][r]}" for m, r in cells))
bad = []
for m in MET:
    for r in RATES:
        for p in PADS:
            for o in OCC:
                for x in PD:
                    if x['arm'] == 'OLD' and x['metro'] == m and x['r'] == r and x['pads'] == p and x['occ'] == o and all(v['holdP95'] <= 120 and v['depP95'] <= 120 for v in x['sites'].values()):
                        sh = x['net']['below'] / max(1, x['net']['landings'])
                        if sh > 0.05: bad.append((m, r, p, o, x['s'], round(100 * sh, 1)))
verdict('F2', 'OLD: runs meeting the pad criterion have <= 5 % of landings below reserve', not bad, f'{len(bad)} runs over 5 %' + (f'; worst {max(bad, key=lambda z: z[-1])}' if bad else ''))
ok3 = all(med(fl('U60', m, r)) >= med(fl('OLD', m, r)) for m, r in cells) and med(fl('U60', 'HOU', 3)) >= 1.25 * med(fl('OLD', 'HOU', 3))
verdict('F3', 'U60 >= OLD everywhere and >= 1.25 x OLD at Houston r 3', ok3, '; '.join(f"{m} {r}: {med(fl('U60', m, r)):g} vs {med(fl('OLD', m, r)):g}" for m, r in cells))
ok4 = all(abs(step(med(fl('U160', m, r))) - step(med(fl('OLD', m, r)))) <= 1 for m, r in cells)
verdict('F4', 'U160 within one fleet step of OLD everywhere', ok4, '; '.join(f"{m} {r}: {med(fl('U160', m, r)):g} vs {med(fl('OLD', m, r)):g}" for m, r in cells))
ok5 = all(med(fl('U100-30', m, r)) >= med(fl('U100', m, r)) for m, r in cells)
verdict('F5', 'U100-30 needs no fewer aircraft than U100 anywhere', ok5, '; '.join(f"{m} {r}: {med(fl('U100-30', m, r)):g} vs {med(fl('U100', m, r)):g}" for m, r in cells))
print(f"\n{sum(o for n, o in V if n.startswith('F'))} of 5 predictions passed")
