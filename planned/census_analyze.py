"""Analysis for CENSUS_PREREG.md; committed before runs. U rows are the HOUREAL runs (out/houreal)."""
import glob, json
from collections import defaultdict
R = [json.loads(l) for f in glob.glob('out/census/runs_*.jsonl') for l in open(f) if l.strip()]
U = [dict(json.loads(l), mode='U') for f in glob.glob('out/houreal/runs_*.jsonl') for l in open(f) if l.strip()]
A = {}
for mode, rows_all in [('U', U), ('P', R), ('PA', R)]:
    for arm in ['A0', 'T', 'R', 'A2']:
        rows = [r for r in rows_all if r['arm'] == arm and r['mode'] == mode]; pr = defaultdict(int)
        for r in rows:
            for k, v in r['pairs'].items(): pr[k] += v
        A[mode, arm] = dict(n=len(rows), w=sum(r['cross_wide'] for r in rows), c=sum(r['cross_close'] for r in rows), pr=dict(pr), rows=rows)
print('| Customers | Heights | runs | cross wide | cross close | pairs (wide) |\n|---|---|---|---|---|---|')
for (mode, arm), a in A.items(): print(f"| {mode} | {arm} | {a['n']} | {a['w']} | {a['c']} | {a['pr']} |")
cut = lambda m, x, k='w': 1 - A[m, 'A2'][k] / A[m, x][k] if A[m, x][k] else float('nan')
for m in ['U', 'P', 'PA']: print(m, ' '.join(f"A2 cut vs {x}: wide {100*cut(m, x):.0f} % close {100*cut(m, x, 'c'):.0f} %;" for x in ['A0', 'T', 'R']))
for m in ['P', 'PA']:
    rows = A[m, 'A0']['rows']; md = defaultdict(list)
    for r in rows:
        for op, v in r['meanDist'].items(): md[op].append(v)
    st = defaultdict(int)
    for r in rows:
        for k, v in (r['stats'] or {}).items(): st[k] += v
    print(m, 'mean customer distance m', {op: round(sum(v) / len(v)) for op, v in md.items()}, '| dropped sites', [r['dropped'] for r in rows], '| stats', dict(st))
print('U mean customer distance (uniform disc, analytic 2/3 radius): wing 6437, amazon 8047, zipline 10729')
st = defaultdict(int)
for r in A['PA', 'A0']['rows']:
    for k, v in r['stats'].items(): st[k] += v
rej = st['rej_amazon'] / max(1, st['rej_amazon'] + st['draws_amazon'])
ratio = A['P', 'A0']['w'] / A['U', 'A0']['w']
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, res, ok in [('C1 P: A2 cut vs A0 >= 65 %', f'{100*cut("P", "A0"):.0f} %', cut('P', 'A0') >= 0.65), ('C2 P: A2 cut vs R <= 50 %', f'{100*cut("P", "R"):.0f} %', cut('P', 'R') <= 0.50),
                   ('C3 A0 wide P/U in 0.7–1.3', f'{ratio:.2f}', 0.7 <= ratio <= 1.3), ('C4 PA cut vs A0 within 10 points of P', f'{100*cut("PA", "A0"):.0f} % vs {100*cut("P", "A0"):.0f} %', abs(cut('PA', 'A0') - cut('P', 'A0')) <= 0.10),
                   ('C5 PA Amazon draws rejected < 15 %', f'{100*rej:.1f} %', rej < 0.15)]:
    print(f"| {n} | {res} | {'**PASS**' if ok else '**FAIL**'} |")
print(f'Runs read: {len(R)} new (expected 24), {len(U)} HOUREAL (expected 12).')
