"""OUTAGE_PREREG.md analysis (committed before any study run). Seeds 22-24 pooled, d = 3."""
import json, os
H = os.path.dirname(os.path.abspath(__file__)); S = (22, 23, 24)
ld = lambda a, s: json.load(open(os.path.join(H, '..', 'out', 'outage', f'{a}_{s}.json')))
tot = lambda a, k: sum(ld(a, s)[k] for s in S)
per = lambda a, k='cross_wide': 100 * tot(a, k) / tot(a, 'holds')
L = ['| Arm | held drones | phase mix (cruise / hover / vertical) | cross wide | cross close | wide per 100 held |', '|---|---|---|---|---|---|']
for a in ('OUT-A0', 'OUT-A2', 'ISO-R', 'ISO-C'):
    ph = {}; [ph.__setitem__(k, ph.get(k, 0) + v) for s in S for k, v in ld(a, s)['phases'].items()]
    L.append(f"| {a} | {tot(a, 'holds')} | {ph.get('cruise',0)} / {ph.get('hover',0)} / {ph.get('vertical',0)} | {tot(a, 'cross_wide')} | {tot(a, 'cross_close')} | {per(a):.2f} |")
r1 = per('OUT-A0') / per('OUT-A2') if per('OUT-A2') else float('inf'); r2 = per('OUT-A2') / per('ISO-R') if per('ISO-R') else float('inf'); r3 = per('ISO-R') / per('ISO-C') if per('ISO-C') else float('inf')
Sc = ['| Prediction | Result | Verdict |', '|---|---|---|',
      f"| O1 OUT-A0 >= 3x OUT-A2 per held drone, >= 20 total | {tot('OUT-A0','cross_wide')} vs {tot('OUT-A2','cross_wide')}; ratio {r1:.1f} | **{'PASS' if r1 >= 3 and tot('OUT-A0','cross_wide') >= 20 else 'FAIL'}** |",
      f"| O2 OUT-A2 within 0.5-2x ISO-R per held drone | {per('OUT-A2'):.2f} vs {per('ISO-R'):.2f}; ratio {r2:.2f} | **{'PASS' if 0.5 <= r2 <= 2 else 'FAIL'}** |",
      f"| O3 ISO-R >= 3x ISO-C per held drone | {per('ISO-R'):.2f} vs {per('ISO-C'):.2f}; ratio {r3:.1f} | **{'PASS' if r3 >= 3 else 'FAIL'}** |"]
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(H, 'outage_results_table.md'), 'w').write(txt + '\n')
