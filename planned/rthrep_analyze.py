"""Analysis for RTHREP_PREREG.md; committed before runs."""
import glob, json
from scipy.stats import binomtest
R = [json.loads(l) for f in glob.glob('out/rthrep/runs_*.jsonl') for l in open(f) if l.strip()]
def agg(a): rows = [r for r in R if r['arm'] == a]; return len(rows), sum(r['events'] for r in rows), sum(r['cross_wide'] for r in rows), sum(r['cross_close'] for r in rows)
n1, e1, w1, c1 = agg('rth-120'); n0, e0, w0, c0 = agg('rth-own')
print(f'R-RTH120: runs {n1}, events {e1}, wide {w1} ({100*w1/e1:.2f} per 100), close {c1}')
print(f'R-RTHOWN: runs {n0}, events {e0}, wide {w0} ({100*w0/e0:.2f} per 100), close {c0}')
rr = (w1 / e1) / max(1e-9, w0 / e0) if w0 else float('inf')
if w0 and w1:
    t = binomtest(w1, w1 + w0, e1 / (e1 + e0)).proportion_ci(0.95, 'exact'); k = e0 / e1; f = lambda p: p / (1 - p) * k
    print(f'ratio {rr:.1f} [{f(t.low):.1f}–{f(t.high):.1f}]')
else: print(f'ratio {rr}')
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, res, ok in [('H1 R-RTH120 >= 5x R-RTHOWN per 100', f'{rr:.1f}x', rr >= 5), ('H2 R-RTH120 rate >= A2 RTH-120 rate 1.54 per 100', f'{100*w1/e1:.2f}', 100 * w1 / e1 >= 1.54)]:
    print(f"| {n} | {res} | {'**PASS**' if ok else '**FAIL**'} |")
