"""DEVIATE_PREREG.md analysis (committed before any study run). Pooled over seeds 19-21."""
import json, os, glob
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'deviate'); S = (19, 20, 21); R = {}
for f in glob.glob(os.path.join(OUT, '*.json')):
    r = json.load(open(f)); R[(r['arm'], r['d'], r['seed'])] = r
have = lambda a, d: all((a, d, s) in R for s in S)
tot = lambda a, d, k: sum(R[(a, d, s)][k] for s in S)
per100 = lambda a, d, k: 100 * tot(a, d, k) / tot(a, d, 'deviations') if tot(a, d, 'deviations') else 0
ARMS = ('BASE', 'N-HOLD', 'S-HOLD', 'N-LAND', 'S-LAND')
L = ['| d | Arm | deviations | cross wide (per 100 deviations) | cross close (per 100) | same-operator wide | delayed flights | total delay (h) | cancelled |', '|---|---|---|---|---|---|---|---|---|']
for d in (4, 3):
    for a in ARMS:
        if not have(a, d): continue
        L.append(f"| {d} km | {a} | {tot(a, d, 'deviations')} | {tot(a, d, 'cross_wide')} ({per100(a, d, 'cross_wide'):.1f}) | {tot(a, d, 'cross_close')} ({per100(a, d, 'cross_close'):.1f}) | {tot(a, d, 'same_wide')} | {tot(a, d, 'delayed')} | {tot(a, d, 'total_delay_s')/3600:.1f} | {tot(a, d, 'cancelled')} |")
Sc = ['| Prediction | Result | Verdict |', '|---|---|---|']
if all(have(a, 3) for a in ARMS):
    l, h = per100('N-LAND', 3, 'cross_wide'), per100('N-HOLD', 3, 'cross_wide')
    Sc.append(f"| C1 d 3: LAND causes more cross wide meetings per deviation than HOLD | LAND {l:.1f} vs HOLD {h:.1f} per 100 | **{'PASS' if l > h else 'FAIL'}** |")
    cl = 1 - tot('S-LAND', 3, 'cross_wide') / tot('N-LAND', 3, 'cross_wide') if tot('N-LAND', 3, 'cross_wide') else float('nan')
    ch = 1 - tot('S-HOLD', 3, 'cross_wide') / tot('N-HOLD', 3, 'cross_wide') if tot('N-HOLD', 3, 'cross_wide') else float('nan')
    Sc.append(f"| C2 d 3: sharing removes < 30 % of LAND's cross wide meetings | {cl*100:.0f} % | **{'PASS' if cl < 0.30 else 'FAIL'}** |")
    Sc.append(f"| C3 d 3: sharing removes < 50 % of HOLD's cross wide meetings | {ch*100:.0f} % | **{'PASS' if ch < 0.50 else 'FAIL'}** |")
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'deviate_results_table.md'), 'w').write(txt + '\n')
