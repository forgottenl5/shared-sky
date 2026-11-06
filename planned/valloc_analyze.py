# VALLOC_PREREG.md analysis (written before the study ran)
import json, glob, os
B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'valloc'); ARMS = ['A0', 'A1', 'A2']; DS = [4, 3, 2]
def L(a, d): return [json.load(open(f)) for f in sorted(glob.glob(f'{B}/{a}_d{d}_[0-9]*.json'))]
def T(rs, k): return sum(r.get(k, 0) for r in rs)
R = {(a, d): L(a, d) for a in ARMS for d in DS}
print('| Spacing | Arm | Cross-op wide / h | Cross-op close / h | Wing-Zipline | Amazon-Wing | Amazon-Zipline | Remaining with a climbing/descending aircraft | Same-op wide / h | Amazon mean flight s |'); print('|' + '---|' * 10)
for d in DS:
    for a in ARMS:
        rs = R[(a, d)]
        if not rs: continue
        h = sum(r['hours'] for r in rs); cw = T(rs, 'wide|cross'); vert = sum(T(rs, f'wide|pair|{p}|vertical') for p in ('wing-zipline', 'amazon-wing', 'amazon-zipline'))
        am = [r['amazon_mean_flight_s'] for r in rs if r.get('amazon_mean_flight_s')]
        print(f"| {d} km | {a} | {cw/h:.1f} | {T(rs,'close|cross')/h:.1f} | {T(rs,'wide|pair|wing-zipline')/h:.1f} | {T(rs,'wide|pair|amazon-wing')/h:.1f} | {T(rs,'wide|pair|amazon-zipline')/h:.1f} | {100*vert/cw if cw else float('nan'):.0f} % | {T(rs,'wide|same')/h:.0f} | {sum(am)/len(am):.0f} |")
V = []
if all(len(R[k]) == 3 for k in R):
    cut = lambda a, d: 1 - T(R[(a, d)], 'wide|cross') / T(R[('A0', d)], 'wide|cross')
    V.append(('V1 A1 cuts cross-operator wide meetings >= 60 % at d = 4 and 3 km', f"{100*cut('A1',4):.0f} %, {100*cut('A1',3):.0f} %", cut('A1', 4) >= 0.6 and cut('A1', 3) >= 0.6))
    V.append(('V2 A2 cuts them >= 80 % at d = 4 and 3 km', f"{100*cut('A2',4):.0f} %, {100*cut('A2',3):.0f} %", cut('A2', 4) >= 0.8 and cut('A2', 3) >= 0.8))
    rem = sum(T(R[('A2', d)], 'wide|cross') for d in (3, 2)); vr = sum(T(R[('A2', d)], f'wide|pair|{p}|vertical') for d in (3, 2) for p in ('wing-zipline', 'amazon-wing', 'amazon-zipline'))
    V.append(('V3 in A2 >= 80 % of remaining meetings involve a climbing/descending aircraft (d = 3, 2 pooled)', f'{100*vr/rem:.0f} % of {rem}' if rem else 'none remaining', (vr / rem >= 0.8) if rem else None))
print('\n| Prediction | Value | Verdict |\n|---|---|---|')
for a, b, c in V: print(f"| {a} | {b} | {'PASS' if c else ('not evaluable' if c is None else 'FAIL')} |")
