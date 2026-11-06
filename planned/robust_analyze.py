# ROBUST_PREREG.md analysis (written before the study ran)
import json, glob, os
B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'robust'); TH = ['h15v5', 'h30v10', 'h50v10', 'h30v15', 'h30v20']
def L(mix, arm, d, pk): return [json.load(open(f)) for f in sorted(glob.glob(f'{B}/{mix}_{arm}_d{d}_[0-9]*_p{pk}.json'))]
def T(rs, k): return sum(r.get(k, 0) for r in rs)
def cut(mix, arm, d, pk, th): a, b = T(L(mix, 'A0', d, pk), f'{th}|cross'), T(L(mix, arm, d, pk), f'{th}|cross'); return (1 - b / a) if a else float('nan'), a, b
print('### R-a thresholds (Houston mix, peak 1): cut vs filed baselines (A0 count -> arm count, pooled 3 seeds x 2 h)\n| Spacing | Threshold (h / v m) | A1 Amazon top of band | A2 full allocation |\n|---|---|---|---|')
for d in (4, 3):
    for th in TH:
        c1, a, b1 = cut('HOU', 'A1', d, '1', th); c2, _, b2 = cut('HOU', 'A2', d, '1', th)
        print(f'| {d} km | {th[1:3]} / {th[4:]} | {100*c1:.0f} % ({a} -> {b1}) | {100*c2:.0f} % ({a} -> {b2}) |')
print('\n### R-b busiest hour (x1.5), 30 m / 10 m\n| Spacing | A0 per h | A2 per h | Cut |\n|---|---|---|---|')
for d in (4, 3):
    a, b = L('HOU', 'A0', d, '1.5'), L('HOU', 'A2', d, '1.5'); h = sum(r['hours'] for r in a) or 1
    print(f"| {d} km | {T(a,'h30v10|cross')/h:.1f} | {T(b,'h30v10|cross')/h:.1f} | {100*(1-T(b,'h30v10|cross')/max(T(a,'h30v10|cross'),1)):.0f} % |")
print('\n### R-c Dallas-Fort Worth mix (75 : 75 : 4, Zipline 400/day), 30 m / 10 m\n| Spacing | Arm | Cross-op per h | Close (15/5) per h | Amazon share | Wing-Zipline | Amazon-Wing | Amazon-Zipline |\n|---|---|---|---|---|---|---|---|')
for d in (4, 3):
    for arm in ('A0', 'A1', 'A2'):
        rs = L('DFW', arm, d, '1'); h = sum(r['hours'] for r in rs) or 1; cw = T(rs, 'h30v10|cross')
        sh = (T(rs, 'h30v10|pair|amazon-wing') + T(rs, 'h30v10|pair|amazon-zipline')) / cw if cw else float('nan')
        print(f"| {d} km | {arm} | {cw/h:.1f} | {T(rs,'h15v5|cross')/h:.1f} | {100*sh:.0f} % | {T(rs,'h30v10|pair|wing-zipline')/h:.1f} | {T(rs,'h30v10|pair|amazon-wing')/h:.1f} | {T(rs,'h30v10|pair|amazon-zipline')/h:.1f} |")
V = []
ok = lambda: all(len(L(m, a, d, p)) == 3 for (m, a, p) in [('HOU', 'A0', '1'), ('HOU', 'A1', '1'), ('HOU', 'A2', '1'), ('HOU', 'A0', '1.5'), ('HOU', 'A2', '1.5'), ('DFW', 'A0', '1'), ('DFW', 'A1', '1'), ('DFW', 'A2', '1')] for d in (4, 3))
if ok():
    c = [cut('HOU', 'A2', d, '1', th)[0] for d in (4, 3) for th in ('h15v5', 'h30v10', 'h50v10')]
    V.append(('R1 A2 cuts >= 70 % for every threshold with vertical <= 10 m at 4 and 3 km', ', '.join(f'{100*x:.0f} %' for x in c), all(x >= 0.7 for x in c)))
    c15 = [cut('HOU', 'A2', d, '1', 'h30v15')[0] for d in (4, 3)]; c20 = [cut('HOU', 'A2', d, '1', 'h30v20')[0] for d in (4, 3)]
    V.append(('R2 A2 cut < 50 % at vertical 15 m and < 30 % at vertical 20 m', f"v15: {', '.join(f'{100*x:.0f} %' for x in c15)}; v20: {', '.join(f'{100*x:.0f} %' for x in c20)}", all(x < 0.5 for x in c15) and all(x < 0.3 for x in c20)))
    cp = [cut('HOU', 'A2', d, '1.5', 'h30v10')[0] for d in (4, 3)]
    V.append(('R3 at peak x1.5 A2 cuts >= 75 % at 4 and 3 km', ', '.join(f'{100*x:.0f} %' for x in cp), all(x >= 0.75 for x in cp)))
    sh, cd = [], []
    for d in (4, 3):
        rs = L('DFW', 'A0', d, '1'); cw = T(rs, 'h30v10|cross'); sh.append((T(rs, 'h30v10|pair|amazon-wing') + T(rs, 'h30v10|pair|amazon-zipline')) / cw if cw else float('nan')); cd.append(cut('DFW', 'A2', d, '1', 'h30v10')[0])
    V.append(('R4 DFW: Amazon in >= 60 % of A0 meetings and A2 cuts >= 60 % at 4 and 3 km', f"Amazon share {', '.join(f'{100*x:.0f} %' for x in sh)}; A2 cut {', '.join(f'{100*x:.0f} %' for x in cd)}", all(x >= 0.6 for x in sh) and all(x >= 0.6 for x in cd)))
print('\n| Prediction | Value | Verdict |\n|---|---|---|')
for a, b, v in V: print(f"| {a} | {b} | {'PASS' if v else 'FAIL'} |")
