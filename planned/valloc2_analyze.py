# VALLOC2_PREREG.md analysis (written before the A3 runs)
import json, glob, os
B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'valloc'); DS = [4, 3, 2]
def L(a, d): return [json.load(open(f)) for f in sorted(glob.glob(f'{B}/{a}_d{d}_[0-9]*.json'))]
def T(rs, k): return sum(r.get(k, 0) for r in rs)
print('| Spacing | Arm | Cross-op wide / h | Change vs filed | Cross-op close / h | Amazon-Zipline | Amazon-Wing | Wing-Zipline | Same-op wide / h |'); print('|' + '---|' * 9)
for d in DS:
    base = T(L('A0', d), 'wide|cross')
    for a in ['A0', 'A3', 'A1', 'A2']:
        rs = L(a, d)
        if not rs: continue
        h = sum(r['hours'] for r in rs); cw = T(rs, 'wide|cross')
        print(f"| {d} km | {a} | {cw/h:.1f} | {100*(cw/base-1):+.0f} % | {T(rs,'close|cross')/h:.1f} | {T(rs,'wide|pair|amazon-zipline')/h:.1f} | {T(rs,'wide|pair|amazon-wing')/h:.1f} | {T(rs,'wide|pair|wing-zipline')/h:.1f} | {T(rs,'wide|same')/h:.0f} |")
V = []
if all(len(L('A3', d)) == 3 for d in DS):
    c = lambda a, d: T(L(a, d), 'wide|cross')
    cut3 = [1 - c('A3', d) / c('A0', d) for d in (4, 3)]
    V.append(('W1 A3 cuts cross-operator wide meetings by < 50 % at d = 4 and 3 km', ', '.join(f'{100*x:.0f} %' for x in cut3), all(x < 0.5 for x in cut3)))
    rat = [c('A2', d) / c('A3', d) for d in (4, 3)]
    V.append(('W2 A2 has <= half the meetings of A3 at d = 4 and 3 km', ', '.join(f'{x:.2f}x' for x in rat), all(x <= 0.5 for x in rat)))
print('\n| Prediction | Value | Verdict |\n|---|---|---|')
for a, b, v in V: print(f"| {a} | {b} | {'PASS' if v else 'FAIL'} |")
