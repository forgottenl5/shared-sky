"""FLEET_PREREG.md analysis. NOTE: written after the runs (deviation log); scoring follows the registered criteria exactly."""
import json, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'fleet'); S = (10, 11, 12)
R = {(a, d, s): json.load(open(os.path.join(OUT, f'{a}_d{d}_{s}.json'))) for a in ('B0', 'B1') for d in (4, 3) for s in S}
def share(a, d, o): n = sum(R[(a, d, s)]['byOp'][o]['n'] for s in S); return sum(R[(a, d, s)]['byOp'][o]['delayed'] for s in S) / n, n
def ratio(a, d): m = (share(a, d, 'wing')[0] + share(a, d, 'zipline')[0]) / 2; return share(a, d, 'amazon')[0] / m
def pairs(a, d):
    P = {}
    for s in S:
        for k, v in R[(a, d, s)]['pairs'].items():
            for o, c in v.items(): P.setdefault(k, {}).setdefault(o, 0); P[k][o] += c
    return P
L = ['| d | Arm | flights checked: wing / amazon / zipline | delayed: wing / amazon / zipline | ratio | pair splits (share borne by first-named side) |', '|---|---|---|---|---|---|']
e1 = True
for d in (4, 3):
    for a in ('B0', 'B1'):
        sp = []
        for k, v in sorted(pairs(a, d).items()):
            x, y = k.split('-'); t = v.get(x, 0) + v.get(y, 0); f = v.get(x, 0) / t if t else float('nan'); sp.append(f"{k} {v.get(x,0)}/{v.get(y,0)} ({f*100:.0f} %)")
            if a == 'B0' and t and not (0.35 <= f <= 0.65): e1 = False
        L.append(f"| {d} km | {a} | {' / '.join(str(share(a, d, o)[1]) for o in ('wing','amazon','zipline'))} | {' / '.join(f'{share(a, d, o)[0]*100:.1f} %' for o in ('wing','amazon','zipline'))} | {ratio(a, d):.1f} | {'; '.join(sp)} |")
Sc = ['| Prediction | Result | Verdict |', '|---|---|---|',
      f"| E1 B0: each side bears 35-65 % of each pair's delays (d 4, 3) | see splits | **{'PASS' if e1 else 'FAIL'}** |",
      f"| E2 B1 ratio <= 2 at d 3 and 4 | {ratio('B1',3):.2f} / {ratio('B1',4):.2f} (d 3 / 4) | **{'PASS' if max(ratio('B1',3), ratio('B1',4)) <= 2 else 'FAIL'}** |",
      f"| E3 B1 ratio <= half of B0's at d 3 and 4 | d 3: {ratio('B1',3):.2f} vs {ratio('B0',3):.2f}; d 4: {ratio('B1',4):.2f} vs {ratio('B0',4):.2f} | **{'PASS' if all(ratio('B1',d) <= ratio('B0',d)/2 for d in (3,4)) else 'FAIL'}** |"]
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fleet_results_table.md'), 'w').write(txt + '\n')
