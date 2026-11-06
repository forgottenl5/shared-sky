"""Analysis for WIND20_PREREG.md; committed before runs. Usage: python3 planned/wind20_analyze.py hou|dfw"""
import glob, json, sys
m = sys.argv[1]; R = [json.loads(l) for f in glob.glob(f'out/wind20/{m}_*.jsonl') for l in open(f) if l.strip()]
def rows(arm, b): return [r for r in R if r['arm'] == arm and r['band'] == b]
def tot(arm, b, key, k='w'): return sum(r[key][k] for r in rows(arm, b))
print(f'## {m}: d = 4 km, 20 hours (seeds) per band')
print('| Wind band (120 m) | A0 no check | A2 no check | sharing-out cut (wide / very close) | A0 still-air ±5 s check flown in this wind: left |\n|---|---|---|---|---|')
cut, share, per = {}, {}, {}
for b in ['still', 'p50', 'p90', 'p99']:
    a0, a2, a0c, a2c, left = tot('A0', b, 'noCheck'), tot('A2', b, 'noCheck'), tot('A0', b, 'noCheck', 'c'), tot('A2', b, 'noCheck', 'c'), tot('A0', b, 'afterCheck')
    cut[b] = 1 - a2 / a0 if a0 else float('nan'); share[b] = left / a0 if a0 else float('nan')
    per[b] = [r2['afterCheck']['w'] / r1['noCheck']['w'] for r1 in rows('A0', b) for r2 in rows('A0', b) if r1['k'] == r2['k'] and r1['noCheck']['w'] > 0]
    sp = [r['w120'] for r in rows('A0', b)]
    print(f"| {b} ({min(sp):.1f}–{max(sp):.1f} m/s) | {a0} | {a2} | {100*cut[b]:.0f} % / {100*(1-a2c/a0c) if a0c else float('nan'):.0f} % | {left} ({100*share[b]:.0f} %) |")
P = [('Wn1 sharing-out cut in each wind band within 5 points of still air', ', '.join(f"{b} {100*cut[b]:.0f} %" for b in ['still', 'p50', 'p90', 'p99']), all(abs(cut[b] - cut['still']) <= 0.05 for b in ['p50', 'p90', 'p99'])),
     ('Wn2 still-air ±5 s check flown in median-band wind leaves >= 50 % (pooled)', f"{100*share['p50']:.0f} %", share['p50'] >= 0.5),
     ('Wn3 in at least 18 of 20 median-band hours the check leaves >= 30 %', f"{sum(1 for x in per['p50'] if x >= 0.3)} of {len(per['p50'])}", sum(1 for x in per['p50'] if x >= 0.3) >= 18)]
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in P: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print(f'Runs read: {len(R)} (expected 160).')
