"""Analysis for HOUTODAY_PREREG.md; committed before runs."""
import glob, json
from collections import defaultdict
from scipy.stats import chi2
R = [json.loads(l) for f in glob.glob('out/houtoday/runs_*.jsonl') for l in open(f) if l.strip()]
def ci(k):  # exact Poisson 95 % interval for a count
    return (0.0 if k == 0 else chi2.ppf(0.025, 2 * k) / 2, chi2.ppf(0.975, 2 * k + 2) / 2)
A = {}
for arm in ['A0', 'T', 'R', 'A2']:
    for vol in ['cap', 'v20']:
        rows = [r for r in R if r['arm'] == arm and r['vol'] == vol]; pr = defaultdict(int)
        for r in rows:
            for k, v in r['pairs'].items(): pr[k] += v
        A[arm, vol] = dict(n=len(rows), w=sum(r['cross_wide'] for r in rows), c=sum(r['cross_close'] for r in rows), pr=dict(pr))
hours = 2
print('| Arm | volume | runs | cross wide [95 %] | cross close | wide per hour | per operating day (x15 h) | pairs (wide) |\n|---|---|---|---|---|---|---|---|')
for (arm, vol), a in A.items():
    ph = a['w'] / max(1, a['n']) / hours; lo, hi = ci(a['w'])
    print(f"| {arm} | {vol} | {a['n']} | {a['w']} [{lo:.0f}–{hi:.0f}] | {a['c']} | {ph:.2f} | {15 * ph:.0f} | {a['pr']} |")
cut = lambda x, v='cap': 1 - A['A2', v]['w'] / A[x, v]['w'] if A[x, v]['w'] else float('nan')
cutc = lambda x, v='cap': 1 - A['A2', v]['c'] / A[x, v]['c'] if A[x, v]['c'] else float('nan')
for v in ['cap', 'v20']:
    for x in ['A0', 'T', 'R']: print(f'{v}: A2 cut vs {x}: wide {100*cut(x, v):.0f} %, close {100*cutc(x, v):.0f} %')
az = sum(r['pairs'].get('amazon-zipline', 0) + r['pairs'].get('zipline-amazon', 0) for r in R)
a0 = A['A0', 'cap']; wa = sum(v for k, v in a0['pr'].items() if 'amazon' in k and 'wing' in k) / max(1, a0['w'])
ph = lambda x, v: A[x, v]['w'] / max(1, A[x, v]['n']) / hours
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, res, ok in [('D1 Amazon–Zipline wide = 0 in all runs', f'{az}', az == 0),
                   ('D2 Wing–Amazon >= 60 % of A0 cap wide', f'{100*wa:.0f} %', wa >= 0.60),
                   ('D3 A2 cut vs R (cap) >= 50 %', f'{100*cut("R"):.0f} %', cut('R') >= 0.50),
                   ('D4 A2 cut vs A0 (cap) >= 50 %', f'{100*cut("A0"):.0f} %', cut('A0') >= 0.50),
                   ('D5 A0 cap per hour <= 5.25 (10 % of HOUREAL)', f'{ph("A0", "cap"):.2f}', ph('A0', 'cap') <= 5.25),
                   ('D6 R v20 per hour <= 10 % of R cap', f'{100*ph("R", "v20")/max(1e-9, ph("R", "cap")):.1f} %', ph('R', 'v20') <= 0.10 * ph('R', 'cap'))]:
    print(f"| {n} | {res} | {'**PASS**' if ok else '**FAIL**'} |")
print(f'Runs read: {len(R)} (expected 240).')
