"""Analysis for AMZBAND_PREREG.md; committed before runs. A2 and B values from PRELAUNCH S1 runs (out/prelaunch)."""
import glob, json
from collections import defaultdict
T = [json.loads(l) for l in open('out/amzband/runs.jsonl') if l.strip()]
P = [json.loads(l) for f in glob.glob('out/prelaunch/runs_*.jsonl') for l in open(f) if l.strip()]
A2 = [r for r in P if r['study'] == 'S1' and r['arm'] == 'A2']
def pool(rows, k='cross_wide'): return sum(r[k] for r in rows)
pr = defaultdict(int)
for r in T:
    for k, v in r['pairs'].items(): pr[k] += v
tw, tc, aw, ac = pool(T), pool(T, 'cross_close'), pool(A2), pool(A2, 'cross_close')
print(f'T runs {len(T)} (expected 6): wide {tw}, close {tc}; pairs {dict(pr)}')
print(f'A2 runs {len(A2)}: wide {aw}, close {ac}')
cut, cutc = 1 - aw / tw, 1 - ac / tc
print(f'A2 cut vs T: wide {100*cut:.0f} %, close {100*cutc:.0f} %')
big = max(pr, key=pr.get)
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, res, ok in [('B1 T wide in 400–800', str(tw), 400 <= tw <= 800), ('B2 A2 cut vs T >= 65 %', f'{100*cut:.0f} %', cut >= 0.65), ('B3 Amazon–Zipline largest pair in T', big, big == 'amazon-zipline')]:
    print(f"| {n} | {res} | {'**PASS**' if ok else '**FAIL**'} |")
