"""FAIR_PREREG.md analysis (written before results). Pooled over seeds 4-6."""
import json, glob, os
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'out', 'fair')
R = {}
for f in glob.glob(os.path.join(OUT, '*.json')):
    r = json.load(open(f)); R[(r['arm'], r['d'], r['seed'])] = r
SEEDS = (4, 5, 6)
def have(a, d): return all((a, d, s) in R for s in SEEDS)
def op(a, d, o, k): return sum(R[(a, d, s)]['byOp'].get(o, {}).get(k, 0) for s in SEEDS)
def share(a, d, o): n = op(a, d, o, 'n'); return op(a, d, o, 'delayed') / n if n else 0
def ratio(a, d): m = (share(a, d, 'wing') + share(a, d, 'zipline')) / 2; return share(a, d, 'amazon') / m if m else float('nan')
def tot(a, d, k): return sum(R[(a, d, s)]['tot'][k] for s in SEEDS)
L = ['## Delay by operator (pooled, seeds 4-6)', '', '| d | Arm | delayed: wing / amazon / zipline | mean delay per flight (s): wing / amazon / zipline | asymmetry ratio | delayed flights | total delay (h) | cancelled | cross meetings after check |', '|---|---|---|---|---|---|---|---|---|']
NAMES = {'F0': 'F0 first filed', 'F1': 'F1 Amazon in place', 'F2': 'F2 Amazon first', 'F3': 'F3 rotating'}
for d in (4, 3, 2):
    for a in ('F0', 'F1', 'F2', 'F3'):
        if not have(a, d): continue
        sh = ' / '.join(f"{share(a, d, o)*100:.1f} %" for o in ('wing', 'amazon', 'zipline')); md = ' / '.join(f"{op(a, d, o, 'total_s')/max(1, op(a, d, o, 'n')):.1f}" for o in ('wing', 'amazon', 'zipline'))
        L.append(f"| {d} km | {NAMES[a]} | {sh} | {md} | {ratio(a, d):.1f} | {tot(a, d, 'delayed')} | {tot(a, d, 'total_s')/3600:.1f} | {tot(a, d, 'cancelled')} | {sum(R[(a, d, s)]['cross_wide'] for s in SEEDS)} |")
L += ['', '## F1 without any plan check (Amazon in place vs filed profile under A2 only)', '', '| d | cross wide (F1, no check) | Amazon extra flight time (s) |', '|---|---|---|']
for d in (4, 3, 2):
    if have('F1', d): L.append(f"| {d} km | {sum(R[('F1', d, s)]['nocheck_cross_wide'] for s in SEEDS)} | {sum(R[('F1', d, s)]['amazon_extra_flight_s'] for s in SEEDS)/3:.0f} |")
S = ['## Predictions', '', '| Prediction | Result | Verdict |', '|---|---|---|']
if have('F0', 4) and have('F0', 3): S.append(f"| G1 F0 ratio >= 3 at d 4 and 3 | {ratio('F0',4):.1f} / {ratio('F0',3):.1f} | **{'PASS' if min(ratio('F0',4), ratio('F0',3)) >= 3 else 'FAIL'}** |")
if all(have(a, d) for a in ('F0', 'F1') for d in (4, 3)):
    cut = lambda d: 1 - share('F1', d, 'amazon') / share('F0', d, 'amazon'); okk = all(cut(d) >= 0.5 and ratio('F1', d) <= 2 for d in (4, 3))
    S.append(f"| G2 F1 cuts Amazon's delayed share >= 50 % and ratio <= 2 at d 4 and 3 | cut {cut(4)*100:.0f} % / {cut(3)*100:.0f} %; ratio {ratio('F1',4):.1f} / {ratio('F1',3):.1f} | **{'PASS' if okk else 'FAIL'}** |")
if have('F0', 3) and have('F2', 3): x = tot('F2', 3, 'total_s') / tot('F0', 3, 'total_s') - 1; S.append(f"| G3 F2 total delay within +-25 % of F0 at d 3 | {x*100:+.0f} % | **{'PASS' if abs(x) <= 0.25 else 'FAIL'}** |")
if have('F3', 3): S.append(f"| G4 F3 ratio stays >= 3 at d 3 | {ratio('F3',3):.1f} | **{'PASS' if ratio('F3',3) >= 3 else 'FAIL'}** |")
txt = '\n'.join(S + [''] + L); print(txt); open(os.path.join(HERE, 'fair_results_table.md'), 'w').write(txt + '\n')
