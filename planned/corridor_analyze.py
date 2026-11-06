"""Analysis for CORRIDOR_PREREG.md part B; committed before runs. Straight-route reference = HOUREAL runs."""
import glob, json
from collections import defaultdict
def load(pat):
    A = {}
    for r in [json.loads(l) for f in glob.glob(pat) for l in open(f) if l.strip()]:
        a = A.setdefault(r['arm'], dict(n=0, w=0, c=0, pr=defaultdict(int)))
        a['n'] += 1; a['w'] += r['cross_wide']; a['c'] += r['cross_close']
        for k, v in r['pairs'].items(): a['pr'][k] += v
    return A
C, S = load('out/corridor/runs_*.jsonl'), load('out/houreal/runs_*.jsonl')
print('| Arm | straight wide / close (HOUREAL) | corridors wide / close | corridor pairs |\n|---|---|---|---|')
for arm in ['A0', 'R', 'A2']: print(f"| {arm} | {S[arm]['w']} / {S[arm]['c']} | {C[arm]['w']} / {C[arm]['c']} | {dict(C[arm]['pr'])} |")
cut = lambda A, x, k='w': 1 - A['A2'][k] / A[x][k]
for nm, A in [('straight', S), ('corridors', C)]: print(nm, f"A2 cut vs A0 wide {100*cut(A,'A0'):.0f} % close {100*cut(A,'A0','c'):.0f} %; vs R wide {100*cut(A,'R'):.0f} % close {100*cut(A,'R','c'):.0f} %")
ratio = C['A0']['w'] / S['A0']['w']
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, res, ok in [('RB1 corridors: A2 cut vs A0 >= 65 %', f"{100*cut(C,'A0'):.0f} %", cut(C, 'A0') >= 0.65), ('RB2 A0 corridors / straight in 0.7–1.3', f'{ratio:.2f}', 0.7 <= ratio <= 1.3),
                   ('RB3 corridors: A2 cut vs R <= 50 %', f"{100*cut(C,'R'):.0f} %", cut(C, 'R') <= 0.50)]:
    print(f"| {n} | {res} | {'**PASS**' if ok else '**FAIL**'} |")
print('runs', sum(a['n'] for a in C.values()), '(expected 9)')
