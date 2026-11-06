"""Analysis for HOUREAL_PREREG.md; committed before runs."""
import glob, json
from collections import defaultdict
R = [json.loads(l) for f in glob.glob('out/houreal/runs_*.jsonl') for l in open(f) if l.strip()]
A = {}
for arm in ['A0', 'T', 'R', 'A2']:
    rows = [r for r in R if r['arm'] == arm]; pr = defaultdict(int)
    for r in rows:
        for k, v in r['pairs'].items(): pr[k] += v
    A[arm] = dict(n=len(rows), w=sum(r['cross_wide'] for r in rows), c=sum(r['cross_close'] for r in rows), pr=dict(pr))
area, hours = 4624, 2
print('| Arm | runs | cross wide | cross close | wide per hour (per run) | per 1,000 km² per hour | pairs (wide) |\n|---|---|---|---|---|---|---|')
for arm, a in A.items():
    ph = a['w'] / max(1, a['n']) / hours
    print(f"| {arm} | {a['n']} | {a['w']} | {a['c']} | {ph:.1f} | {1000 * ph / area:.2f} | {a['pr']} |")
cut = lambda x: 1 - A['A2']['w'] / A[x]['w'] if A[x]['w'] else float('nan')
cutc = lambda x: 1 - A['A2']['c'] / A[x]['c'] if A[x]['c'] else float('nan')
for x in ['A0', 'T', 'R']: print(f'A2 cut vs {x}: wide {100*cut(x):.0f} %, close {100*cutc(x):.0f} %')
am = sum(v for k, v in A['A0']['pr'].items() if 'amazon' in k) / max(1, A['A0']['w'])
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, res, ok in [('G1 Amazon in >= 70 % of A0 wide', f'{100*am:.0f} %', am >= 0.70), ('G2 A2 cut vs A0 >= 65 %', f'{100*cut("A0"):.0f} %', cut('A0') >= 0.65),
                   ('G3 A2 cut vs R <= 50 %', f'{100*cut("R"):.0f} %', cut('R') <= 0.50), ('G4 A2 cut vs T >= 55 %', f'{100*cut("T"):.0f} %', cut('T') >= 0.55)]:
    print(f"| {n} | {res} | {'**PASS**' if ok else '**FAIL**'} |")
print(f'Runs read: {len(R)} (expected 12).')
