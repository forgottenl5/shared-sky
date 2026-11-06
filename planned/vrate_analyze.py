"""VRATE_PREREG.md analysis (written before results). Pooled over seeds 7-9."""
import json, glob, os
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'out', 'vrate'); R = {}
for f in glob.glob(os.path.join(OUT, '*.json')):
    r = json.load(open(f)); R[(r['arm'], r['d'], r['seed'])] = r
SEEDS = (7, 8, 9); OPS = ('wing', 'amazon', 'zipline'); NAMES = {'V0': 'V0 filed', 'V1': 'V1 in place, filed durations', 'V2': 'V2 in place, 5 m/s'}
have = lambda a, d: all((a, d, s) in R for s in SEEDS)
op = lambda a, d, o, k: sum(R[(a, d, s)]['byOp'].get(o, {}).get(k, 0) for s in SEEDS)
share = lambda a, d, o: op(a, d, o, 'delayed') / max(1, op(a, d, o, 'n'))
def ratio(a, d): m = (share(a, d, 'wing') + share(a, d, 'zipline')) / 2; return share(a, d, 'amazon') / m if m else float('nan')
cross = lambda a, d, o: sum(R[(a, d, s)]['crossing_s'].get(o, 0) for s in SEEDS) / 3
L = ['## Results (pooled, seeds 7-9)', '', '| d | Arm | delayed: wing / amazon / zipline | asymmetry ratio | crossing time per flight (s): wing / amazon / zipline | total delay (h) | Amazon flight time (s) | cross meetings, no check | after check |', '|---|---|---|---|---|---|---|---|---|']
for d in (4, 3, 2):
    for a in ('V0', 'V1', 'V2'):
        if not have(a, d): continue
        L.append(f"| {d} km | {NAMES[a]} | {' / '.join(f'{share(a, d, o)*100:.1f} %' for o in OPS)} | {ratio(a, d):.1f} | {' / '.join(f'{cross(a, d, o):.0f}' for o in OPS)} | {sum(R[(a, d, s)]['tot']['total_s'] for s in SEEDS)/3600:.1f} | {sum(R[(a, d, s)]['amazon_mean_flight_s'] for s in SEEDS)/3:.0f} | {sum(R[(a, d, s)]['nocheck_cross_wide'] for s in SEEDS)} | {sum(R[(a, d, s)]['cross_wide'] for s in SEEDS)} |")
S = ['## Predictions', '', '| Prediction | Result | Verdict |', '|---|---|---|']
if all(have(a, d) for a in ('V0', 'V2') for d in (4, 3)):
    cut = lambda d: 1 - share('V2', d, 'amazon') / share('V0', d, 'amazon')
    S.append(f"| H1 V2 cuts Amazon's delayed share >= 50 % at d 4 and 3 | {cut(4)*100:.0f} % / {cut(3)*100:.0f} % | **{'PASS' if min(cut(4), cut(3)) >= 0.5 else 'FAIL'}** |")
    S.append(f"| H2 V2 ratio <= 3 at d 4 and 3 | {ratio('V2',4):.1f} / {ratio('V2',3):.1f} | **{'PASS' if max(ratio('V2',4), ratio('V2',3)) <= 3 else 'FAIL'}** |")
    rs, rc = share('V2', 3, 'amazon') / share('V0', 3, 'amazon'), cross('V2', 3, 'amazon') / cross('V0', 3, 'amazon'); q = rs / rc
    S.append(f"| H3 at d 3, Amazon's share ratio V2/V0 within 0.7-1.3x its crossing-time ratio | share ratio {rs:.2f}, crossing ratio {rc:.2f}, quotient {q:.2f} | **{'PASS' if 0.7 <= q <= 1.3 else 'FAIL'}** |")
txt = '\n'.join(S + [''] + L); print(txt); open(os.path.join(HERE, 'vrate_results_table.md'), 'w').write(txt + '\n')
