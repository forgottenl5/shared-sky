"""AIRTAXI_NOISE1 analysis (registration planned/AIRTAXI_NOISE1_PREREG.md). Run from the repo root after the runner:
   python3 planned/airtaxi_noise1_analyze.py     (needs out/airtaxi_noise1_<shard>.json)
Writes planned/AIRTAXI_NOISE1_RESULTS_2026-10-26.md."""
import glob, json, re, statistics, sys
R = [x for f in sorted(glob.glob('out/airtaxi_noise1_*.json')) if re.search(r'airtaxi_noise1_\d+\.json$', f) for x in json.load(open(f))]
if not R: sys.exit('no out/airtaxi_noise1_<shard>.json: run planned/airtaxi_noise1_run.js first')
def med(a): return statistics.median(a)
def sel(m, r, off=0): return [x for x in R if x['metro'] == m and x['r'] == r and x['off'] == off]
def mm(a, f='{:.1f}'): return f.format(med(a)) + ' (' + f.format(min(a)) + '–' + f.format(max(a)) + ')'
P = []
def chk(n, ok, t): P.append((n, ok, t))
base = [x for x in R if x['off'] == 0]
chk('N1', all(x['dnlOffsiteMax'] < 60 for x in base), f"highest off-site DNL over all {len(base)} base runs: {max(x['dnlOffsiteMax'] for x in base):.1f} dB (predicted < 60; FAA threshold 65)")
chk('N2', all(x['reach'] <= 3000 for x in base), f"largest reach of any N55 >= 1 point: {max(x['reach'] for x in base) / 1000:.2f} km (predicted <= 3 km)")
pd = med([x['probe']['n55'] for x in sel('DFW', 1.5)]); ph = med([x['probe']['n55'] for x in sel('HOU', 1.5)])
chk('N3', 20 <= pd <= 80 and 10 <= ph <= 60, f"N55 in 12 h 1 km out: DFW Corporate Aviation toward Alliance {pd:g} (predicted 20-80); IAH toward Hobby {ph:g} (predicted 10-60)")
ad = med([x['area55_10'] for x in sel('DFW', 1.5)]); ah = med([x['area55_10'] for x in sel('HOU', 1.5)])
chk('N4', 2 <= ad <= 12 and 1 <= ah <= 8, f"area with N55 >= 10 at r 1.5: DFW {ad:.2f} km² (predicted 2-12), Houston {ah:.2f} km² (predicted 1-8)")
q5 = {m: med([x['area55_10'] for x in sel(m, 6)]) / med([x['area55_10'] for x in sel(m, 1.5)]) for m in ('DFW', 'HOU')}
chk('N5', all(1.0 <= v <= 1.6 for v in q5.values()), 'area growth r 1.5 -> 6: ' + ', '.join(f'{m} {v:.2f}x' for m, v in q5.items()) + ' (predicted 1.0-1.6)')
p5 = [x for x in R if x['off'] == 5]
chk('N6', all(x['reach'] <= 5000 for x in p5) and all(x['dnlOffsiteMax'] < 65 for x in p5 if x['r'] == 1.5), '+5 dB: reach ' + ', '.join(f"{x['metro']} r{x['r']:g} {x['reach'] / 1000:.2f} km" for x in p5) + '; off-site DNL at r 1.5: ' + ', '.join(f"{x['metro']} {x['dnlOffsiteMax']:.1f}" for x in p5 if x['r'] == 1.5))
L = ['# AIRTAXI_NOISE1 results (run 2026-10-26; registration planned/AIRTAXI_NOISE1_PREREG.md)', '',
     'Scenario model: point-source spreading from two manufacturer-reported levels, flat ground, no buildings, wind or air absorption, no population data. Not a noise assessment.', '',
     '## Predictions', '', '| # | Result | Detail |', '|---|---|---|'] + [f'| {n} | {"pass" if ok else "**FAIL**"} | {t} |' for n, ok, t in P]
L += ['', f'{sum(1 for x in P if x[1])} of {len(P)} passed.', '',
      '## By metro and demand (12 h, 06:00-18:00; median over 5 seeds, min-max)', '',
      '| Metro | Trips an hour | Flights | Area N55 >= 10 (km²) | Area N65 >= 1 (km²) | Reach of N55 (km) | Highest off-site DNL (dB) | Highest DNL anywhere (dB) | N55 1 km out on busiest route |', '|---|---|---|---|---|---|---|---|---|']
for m in ('DFW', 'HOU'):
    for r in (1.5, 3, 6):
        s = sel(m, r); trips = r * (8 if m == 'DFW' else 4)
        L.append(f"| {m} | {trips:g} | {mm([x['flights'] for x in s], '{:.0f}')} | {mm([x['area55_10'] for x in s], '{:.2f}')} | {mm([x['area65_1'] for x in s], '{:.2f}')} | {mm([x['reach'] / 1000 for x in s], '{:.2f}')} | {mm([x['dnlOffsiteMax'] for x in s])} | {mm([x['dnlMax'] for x in s])} | {mm([x['probe']['n55'] for x in s], '{:.0f}')} |")
L += ['', '## Sensitivity: both source levels −5 / 0 / +5 dB (seed 1)', '', '| Metro | Trips an hour | Area N55 >= 10 (km²) | Reach (km) | Highest off-site DNL (dB) |', '|---|---|---|---|---|']
for m in ('DFW', 'HOU'):
    for r in (1.5, 6):
        g = {o: [x for x in R if x['metro'] == m and x['r'] == r and x['off'] == o and x['seed'] == 1][0] for o in (-5, 0, 5)}
        L.append(f"| {m} | {r * (8 if m == 'DFW' else 4):g} | " + ' / '.join(f"{g[o]['area55_10']:.2f}" for o in (-5, 0, 5)) + ' | ' + ' / '.join(f"{g[o]['reach'] / 1000:.2f}" for o in (-5, 0, 5)) + ' | ' + ' / '.join(f"{g[o]['dnlOffsiteMax']:.1f}" for o in (-5, 0, 5)) + ' |')
open('planned/AIRTAXI_NOISE1_RESULTS_2026-10-26.md', 'w').write('\n'.join(L) + '\n'); print('\n'.join(L))
