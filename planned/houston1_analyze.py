# HOUSTON1_PREREG.md analysis (written before the study ran)
import json, glob, os
B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'houston1')
def load(s, pk): return [json.load(open(f)) for f in sorted(glob.glob(f'{B}/{s}_[0-9]*_{pk}.json'))]
def tot(rs, k): return sum(r.get(k, 0) for r in rs)
for pk in ('1', '1.5'):
    print(f'\n### Peak factor {pk}\n| Scenario | Runs | Flights (4 h) | Cross-op wide / h | Cross-op close / h | Same-op wide / h | Wide: Wing-Zipline | Wide: Amazon-Wing | Wide: Amazon-Zipline | Zipline-Amazon inbound share | Cross wide near sites | Overflights / km2 / day: max (median) |')
    print('|' + '---|' * 12)
    for s in ('S0', 'S1', 'S2'):
        rs = load(s, pk)
        if not rs: continue
        h = sum(r['hours'] for r in rs); cw = tot(rs, 'wide|cross')
        zs = tot(rs, 'wide|cross|zipline-amazonIn') / cw if cw else float('nan')
        print(f"| {s} | {len(rs)} | {tot(rs,'flights_measured')/len(rs):.0f} | {cw/h:.2f} | {tot(rs,'close|cross')/h:.2f} | {tot(rs,'wide|same')/h:.2f} | {tot(rs,'wide|pair|wing-zipline')/h:.2f} | {tot(rs,'wide|pair|amazon-wing')/h:.2f} | {tot(rs,'wide|pair|amazon-zipline')/h:.2f} | {100*zs:.0f} % | {tot(rs,'wide|cross|site')/h:.2f} | {sum(r['overflight_max_per_km2_day'] for r in rs)/len(rs):.0f} ({sum(r['overflight_median_per_km2_day'] for r in rs)/len(rs):.0f}) |")
    print('\nPhase split of wide cross-operator encounters per hour (vertical = at least one climbing/descending; hover = at least one hovering, none vertical):')
    for s in ('S0', 'S1', 'S2'):
        rs = load(s, pk); h = sum(r['hours'] for r in rs) if rs else 1
        for pair in ('wing-zipline', 'amazon-wing', 'amazon-zipline'):
            v = [tot(rs, f'wide|pair|{pair}|{ph}') / h for ph in ('cruise', 'hover', 'vertical')]
            if sum(v) > 0: print(f'- {s} {pair}: cruise {v[0]:.2f}, hover {v[1]:.2f}, vertical {v[2]:.2f}')
# verdicts (peak 1)
V = []
S = {s: load(s, '1') for s in ('S0', 'S1', 'S2')}
if all(len(S[s]) == 5 for s in S):
    sh = [tot(S[s], 'wide|cross|zipline-amazonIn') / tot(S[s], 'wide|cross') for s in ('S1', 'S2')]
    V.append(('P1 Zipline + Amazon inbound > 50 % of wide cross-operator encounters in S1 and S2', ', '.join(f'{100*x:.0f} %' for x in sh), all(x > 0.5 for x in sh)))
    wz = tot(S['S0'], 'wide|pair|wing-zipline')
    if wz: x = tot(S['S0'], 'wide|pair|wing-zipline|vertical') / wz; V.append(('P2 S0: >= 80 % of wide Wing-Zipline encounters have a climbing/descending aircraft', f'{100*x:.0f} % of {wz}', x >= 0.8))
    else: V.append(('P2', 'not evaluable (0 Wing-Zipline wide encounters in S0)', None))
    h1 = sum(r['hours'] for r in S['S1']); h2 = sum(r['hours'] for r in S['S2']); rr = []
    for pair in ('wing-zipline', 'amazon-zipline'):
        a, b = tot(S['S1'], f'wide|pair|{pair}') / h1, tot(S['S2'], f'wide|pair|{pair}') / h2; rr.append((pair, a, b, b / a if a else float('nan')))
    V.append(('P3 S1 -> S2 growth of Wing-Zipline and Amazon-Zipline wide encounters within [2.0, 3.0]', '; '.join(f'{p}: {a:.2f} -> {b:.2f} /h (x{q:.2f})' for p, a, b, q in rr), all(2.0 <= q <= 3.0 for *_, q in rr)))
print('\n| Prediction | Value | Verdict |\n|---|---|---|')
for a, b, c in V: print(f"| {a} | {b} | {'PASS' if c else ('not evaluable' if c is None else 'FAIL')} |")
