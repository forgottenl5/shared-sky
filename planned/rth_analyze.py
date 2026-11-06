"""RTH_PREREG.md analysis (committed before any study run). d = 3 and 4 pooled, seeds 19-21."""
import json, os
H = os.path.dirname(os.path.abspath(__file__)); S = (19, 20, 21); D = (3, 4)
ld = lambda a, d, s: json.load(open(os.path.join(H, '..', 'out', 'rth', f'{a}_d{d}_{s}.json')))
tot = lambda a, k, ds=D: sum(ld(a, d, s)[k] for d in ds for s in S)
L = ['| Arm | events (deviations or held flights) | cross wide | cross close | per 100 events (wide) | d 4 / d 3 cross wide |', '|---|---|---|---|---|---|']
for a in ('RTH-OWN', 'RTH-120', 'OUT-A2', 'OUT-A0'):
    e = tot(a, 'events'); L.append(f"| {a} | {e} | {tot(a, 'cross_wide')} | {tot(a, 'cross_close')} | {100*tot(a, 'cross_wide')/e:.2f} | {tot(a, 'cross_wide', (4,))} / {tot(a, 'cross_wide', (3,))} |")
o, t = tot('RTH-OWN', 'cross_wide') / tot('RTH-OWN', 'events'), tot('RTH-120', 'cross_wide') / tot('RTH-120', 'events')
a2, a0 = tot('OUT-A2', 'cross_wide'), tot('OUT-A0', 'cross_wide')
Sc = ['| Prediction | Result | Verdict |', '|---|---|---|',
      f"| G1 RTH-120 >= 5x RTH-OWN per deviation and >= 10 total | {tot('RTH-120','cross_wide')} vs {tot('RTH-OWN','cross_wide')}; ratio {(t/o if o else float('inf')):.1f} | **{'PASS' if tot('RTH-120','cross_wide') >= 10 and (o == 0 or t / o >= 5) else 'FAIL'}** |",
      f"| G2 RTH-OWN <= 1 per 100 deviations | {100*o:.2f} | **{'PASS' if 100*o <= 1 else 'FAIL'}** |",
      f"| G3 OUT-A0 >= 5x OUT-A2 and >= 10 total | {a0} vs {a2} | **{'PASS' if a0 >= 10 and (a2 == 0 or a0 / a2 >= 5) else 'FAIL'}** |"]
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(H, 'rth_results_table.md'), 'w').write(txt + '\n')
