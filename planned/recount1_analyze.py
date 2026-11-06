"""RECOUNT1 analysis (registration planned/RECOUNT1_PREREG.md). Run from the repo root after:
   node planned/recount1_run.js 1 22 24 ; node planned/recount1_run.js 4 22 31
Writes planned/RECOUNT1_RESULTS_2026-10-29.md"""
import json
from scipy.stats import beta
def load(f): return json.load(open(f))
def pool(rows, arm, seeds): r = [x for x in rows if x['arm'] == arm and x['seed'] in seeds]; return sum(x['cross_wide'] for x in r), sum(x['holds'] for x in r)
def ratio(a, ea, b, eb):
    # rate ratio (a/ea)/(b/eb) with an exact conditional (Clopper-Pearson) 95 % interval
    n = a + b; lo = beta.ppf(0.025, a, b + 1) if a > 0 else 0.0; hi = beta.ppf(0.975, a + 1, b) if b > 0 else float('inf')
    f = eb / ea; return (a / ea) / (b / eb), lo / (1 - lo) * f, hi / (1 - hi) * f
r1 = load('out/recount1_sub1_22-24.json'); r4 = load('out/recount1_sub4_22-31.json')
S3, S10 = range(22, 25), range(22, 32)
k1 = pool(r1, 'OUT-A0', S3), pool(r1, 'OUT-A2', S3)
a1, e1 = k1[0]; b1, f1 = k1[1]
a4, e4 = pool(r4, 'OUT-A0', S3); b4, f4 = pool(r4, 'OUT-A2', S3)
A, EA = pool(r4, 'OUT-A0', S10); B, EB = pool(r4, 'OUT-A2', S10)
R1 = ratio(a1, e1, b1, f1); R3 = ratio(a4, e4, b4, f4); R10 = ratio(A, EA, B, EB)
K1 = (a1 == 106 and b1 == 15 and e1 == 2208)
P = [('K1', K1, f'sub 1, seeds 22-24: OUT-A0 {a1} cross wide over {e1} held, OUT-A2 {b1} over {f1} (OUTAGE: 106 over 2208, 15)'),
     ('R1', R3[0] >= 3, f'sub 4, seeds 22-24: ratio {R3[0]:.1f} (95 % {R3[1]:.1f}-{R3[2]:.1f}); {a4} vs {b4}'),
     ('R2', 4 <= R10[0] <= 14, f'sub 4, seeds 22-31: ratio {R10[0]:.1f} (95 % {R10[1]:.1f}-{R10[2]:.1f}); {A} over {EA} held vs {B} over {EB}'),
     ('R3', a4 / e4 > a1 / e1 and b4 / f4 > b1 / f1, f'per 100 held, sub 1 -> sub 4 (seeds 22-24): OUT-A0 {100*a1/e1:.2f} -> {100*a4/e4:.2f}, OUT-A2 {100*b1/f1:.2f} -> {100*b4/f4:.2f}')]
n = sum(1 for p in P[1:] if p[1])
L = ['# RECOUNT1 results (2026-10-29): Houston area-outage ratio at 4 checks per second', 'Registration planned/RECOUNT1_PREREG.md; runner planned/recount1_run.js; analysis planned/recount1_analyze.py.', '',
     f'**{n} of 3 predictions passed.** K1 {"passed" if K1 else "FAILED"}. Old figure (1 check per second, seeds 22-24): {R1[0]:.1f}x (95 % {R1[1]:.1f}-{R1[2]:.1f}).', '',
     '| Check | Result | Verdict |', '|---|---|---|'] + [f'| {a} | {c} | {"PASS" if b else "**FAIL**"} |' for a, b, c in P]
open('planned/RECOUNT1_RESULTS_2026-10-29.md', 'w').write('\n'.join(L) + '\n'); print('\n'.join(L))
