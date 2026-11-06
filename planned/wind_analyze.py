"""Analysis for WIND_PREREG.md; committed before runs."""
import glob, json
R = [json.loads(l) for f in glob.glob('out/wind/runs_*.jsonl') for l in open(f) if l.strip()]
def agg(d, arm, wind, key, k='w'):
    return sum(r[key][k] for r in R if r['d'] == d and r['arm'] == arm and r['wind'] == wind)
print('| d | wind | A0 no check | A2 no check | A2 cut | A0 after check (share of no-check) | A2 after check |\n|---|---|---|---|---|---|---|')
cut = {}; share = {}
for d in [4, 3]:
    for w in ['W0', 'p50', 'p90', 'p99']:
        a0, a2, a0c, a2c = agg(d, 'A0', w, 'noCheck'), agg(d, 'A2', w, 'noCheck'), agg(d, 'A0', w, 'afterCheck'), agg(d, 'A2', w, 'afterCheck')
        cut[d, w] = 1 - a2 / a0 if a0 else float('nan'); share[d, w] = a0c / a0 if a0 else float('nan')
        print(f"| {d} km | {w} | {a0} ({agg(d,'A0',w,'noCheck','c')}) | {a2} ({agg(d,'A2',w,'noCheck','c')}) | {100*cut[d,w]:.0f} % | {a0c} ({100*share[d,w]:.0f} %) | {a2c} |")
tot = {w: sum(agg(d, 'A0', w, 'afterCheck') for d in [4, 3]) for w in ['p50', 'p90', 'p99']}
print('(close meetings in brackets)')
print('| Prediction | Result | Verdict |\n|---|---|---|')
w1 = all(abs(cut[d, 'p90'] - cut[d, 'W0']) <= 0.05 for d in [4, 3])
w2 = all(share[d, 'p50'] >= 0.50 for d in [4, 3])
w3 = tot['p50'] < tot['p90'] < tot['p99']
print(f"| W1 A2 cut under p90 within 5 points of still air | d4 {100*cut[4,'p90']:.0f} vs {100*cut[4,'W0']:.0f} %; d3 {100*cut[3,'p90']:.0f} vs {100*cut[3,'W0']:.0f} % | {'**PASS**' if w1 else '**FAIL**'} |")
print(f"| W2 still-air check in p50 wind leaves >= 50 % | d4 {100*share[4,'p50']:.0f} %; d3 {100*share[3,'p50']:.0f} % | {'**PASS**' if w2 else '**FAIL**'} |")
print(f"| W3 after-check rises p50 < p90 < p99 | {tot['p50']} / {tot['p90']} / {tot['p99']} | {'**PASS**' if w3 else '**FAIL**'} |")
print(f'Runs read: {len(R)} (expected 48).')
