"""DEVA0_PREREG.md analysis (committed before any study run). Pools d = 3 and 4, seeds 19-21; A2 numbers from out/deviate (DEVIATE N-arms)."""
import json, os
H = os.path.dirname(os.path.abspath(__file__)); S = (19, 20, 21)
ld = lambda sub, a, d, s: json.load(open(os.path.join(H, '..', 'out', sub, f'{a}_d{d}_{s}.json')))
def tot(sub, a, k, ds=(3, 4)): return sum(ld(sub, a, d, s)[k] for d in ds for s in S)
rows = [('A2 allocation (DEVIATE)', 'deviate', 'N-HOLD', 'N-LAND', 'BASE'), ('A0 filed heights', 'deva0', 'F-HOLD', 'F-LAND', 'F-BASE')]
L = ['| Heights | HOLD: cross wide / close (per 100 deviations) | LAND: cross wide / close (per 100) | deviations | plan-check delayed flights (no deviations) | total delay (h) |', '|---|---|---|---|---|---|']
for name, sub, h, l, b in rows:
    n = tot(sub, h, 'deviations')
    L.append(f"| {name} | {tot(sub, h, 'cross_wide')} / {tot(sub, h, 'cross_close')} ({100*tot(sub, h, 'cross_wide')/n:.2f}) | {tot(sub, l, 'cross_wide')} / {tot(sub, l, 'cross_close')} ({100*tot(sub, l, 'cross_wide')/n:.2f}) | {n} | {tot(sub, b, 'delayed')} | {tot(sub, b, 'total_delay_s')/3600:.1f} |")
fh, ah = tot('deva0', 'F-HOLD', 'cross_wide'), tot('deviate', 'N-HOLD', 'cross_wide'); nf, na = tot('deva0', 'F-HOLD', 'deviations'), tot('deviate', 'N-HOLD', 'deviations')
ratio = (fh / nf) / (ah / na) if ah else float('inf'); fl = tot('deva0', 'F-LAND', 'cross_wide')
Sc = ['| Prediction | Result | Verdict |', '|---|---|---|',
      f"| D1 F-HOLD >= 10 cross wide and >= 5x A2 per deviation (d 3+4) | {fh} meetings; {ratio:.1f}x | **{'PASS' if fh >= 10 and ratio >= 5 else 'FAIL'}** |",
      f"| D2 F-LAND <= 10 cross wide (d 3+4) | {fl} | **{'PASS' if fl <= 10 else 'FAIL'}** |"]
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(H, 'deva0_results_table.md'), 'w').write(txt + '\n')
