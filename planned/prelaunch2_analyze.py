"""Analysis for PRELAUNCH2_PREREG.md; committed before any run."""
import glob, json
from scipy.stats import binomtest, chi2
R = [json.loads(l) for f in sorted(glob.glob('out/prelaunch2/runs_*.jsonl')) for l in open(f) if l.strip()]
def agg(kind, arm):
    rows = [r for r in R if r['kind'] == kind and r['arm'] == arm]
    return dict(n=len(rows), ev=sum(r['events'] for r in rows), w=sum(r['cross_wide'] for r in rows), c=sum(r['cross_close'] for r in rows),
                chk=sum(r['delays']['checked'] for r in rows), dl=sum(r['delays']['delayed'] for r in rows), ts=sum(r['delays']['total_s'] for r in rows))
def ratio(a, b):  # rate ratio a/b per event, exact conditional binomial interval
    if a['w'] == 0 or b['w'] == 0: return a['w'] / a['ev'] / max(1e-9, b['w'] / b['ev']), None, None
    p0 = a['ev'] / (a['ev'] + b['ev']); t = binomtest(a['w'], a['w'] + b['w'], p0).proportion_ci(0.95, 'exact'); k = b['ev'] / a['ev']
    f = lambda p: p / (1 - p) * k if p < 1 else float('inf'); return (a['w'] / a['ev']) / (b['w'] / b['ev']), f(t.low), f(t.high)
out = []; P = out.append; v = []
for kind, unit in [('hold', 'holds'), ('outage', 'held drones')]:
    P(f'## {kind}s\n'); P(f'| Arm | runs | {unit} | cross wide | wide per 100 | cross close |' + (' plan-check delayed / checked | delay h |' if kind == 'hold' else '')); P('|---|---|---|---|---|---|' + ('---|---|' if kind == 'hold' else ''))
    A = {arm: agg(kind, arm) for arm in ['A0', 'R', 'A2']}
    for arm, a in A.items():
        P(f"| {arm} | {a['n']} | {a['ev']} | {a['w']} | {100 * a['w'] / max(1, a['ev']):.2f} | {a['c']} |" + (f" {a['dl']} / {a['chk']} | {a['ts'] / 3600:.1f} |" if kind == 'hold' else ''))
    for x, y in [('A0', 'R'), ('R', 'A2'), ('A0', 'A2')]:
        rr, lo, hi = ratio(A[x], A[y]); P(f'\n{x} vs {y} per event: {rr:.1f}' + (f' [{lo:.1f}–{hi:.1f}]' if lo else ''))
    if kind == 'hold':
        r1 = ratio(A['A0'], A['R'])[0]; v.append(('Q1 A0 >= 3x R per 100 holds', f'{r1:.1f}x', r1 >= 3))
        r2 = ratio(A['R'], A['A2'])[0]; v.append(('Q2 R < 3x A2 per 100 holds', f'{r2:.1f}x', r2 < 3))
        q3 = A['R']['dl'] / max(1, A['A0']['dl']); v.append(('Q3 R delayed flights <= 50 % of A0', f"{A['R']['dl']} vs {A['A0']['dl']} ({100 * q3:.0f} %)", q3 <= 0.5))
        P(f"\nDelay: A0 vs A2 flights {A['A0']['dl'] / max(1, A['A2']['dl']):.1f}x, time {A['A0']['ts'] / max(1, A['A2']['ts']):.1f}x; R vs A2 flights {A['R']['dl'] / max(1, A['A2']['dl']):.1f}x, time {A['R']['ts'] / max(1, A['A2']['ts']):.1f}x")
    else:
        r4 = ratio(A['R'], A['A2'])[0]; v.append(('Q4 R < 3x A2 per 100 held drones (outages)', f'{r4:.1f}x', r4 < 3))
    P('')
P('## Verdicts\n'); P('| Prediction | Result | Verdict |'); P('|---|---|---|')
for n, r, ok in v: P(f"| {n} | {r} | {'**PASS**' if ok else '**FAIL**'} |")
P(f'\nRuns read: {len(R)} (expected 27).'); print('\n'.join(out))
