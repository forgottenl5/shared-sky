"""Analysis for DFWREAL_PREREG.md; committed before runs."""
import glob, json
from collections import defaultdict
R = [json.loads(l) for f in glob.glob('out/dfwreal/runs_*.jsonl') for l in open(f) if l.strip()]
A = {}
for arm in ['A0', 'T', 'R', 'A2']:
    rows = [r for r in R if r['arm'] == arm]; pr = defaultdict(int)
    for r in rows:
        for k, v in r['pairs'].items(): pr[k] += v
    A[arm] = dict(n=len(rows), w=sum(r['cross_wide'] for r in rows), c=sum(r['cross_close'] for r in rows), pr=dict(pr))
import re; Z = int(re.search(r'const ZONE = (\d+)', open('planned/dfwreal_run.js').read()).group(1)); area, hours = (2 * Z / 1000) ** 2, 2
print('| Arm | runs | cross wide | cross close | wide per hour (per run) | per 1,000 km² per hour | pairs (wide) |\n|---|---|---|---|---|---|---|')
for arm, a in A.items():
    ph = a['w'] / max(1, a['n']) / hours
    print(f"| {arm} | {a['n']} | {a['w']} | {a['c']} | {ph:.1f} | {1000 * ph / area:.2f} | {a['pr']} |")
cut = lambda x: 1 - A['A2']['w'] / A[x]['w'] if A[x]['w'] else float('nan')
cutc = lambda x: 1 - A['A2']['c'] / A[x]['c'] if A[x]['c'] else float('nan')
for x in ['A0', 'T', 'R']: print(f'A2 cut vs {x}: wide {100*cut(x):.0f} %, close {100*cutc(x):.0f} %')
am = sum(v for k, v in A['A0']['pr'].items() if 'amazon' in k) / max(1, A['A0']['w'])
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, res, ok in [('F1 Amazon in >= 60 % of A0 wide', f'{100*am:.0f} %', am >= 0.60), ('F2 A2 cut vs A0 >= 45 %', f'{100*cut("A0"):.0f} %', cut('A0') >= 0.45),
                   ('F3 A2 cut vs R <= 50 %', f'{100*cut("R"):.0f} %', cut('R') <= 0.50), ('F4 A2 cut vs T >= 40 %', f'{100*cut("T"):.0f} %', cut('T') >= 0.40)]:
    print(f"| {n} | {res} | {'**PASS**' if ok else '**FAIL**'} |")
print(f'Runs read: {len(R)} (expected 12).')
