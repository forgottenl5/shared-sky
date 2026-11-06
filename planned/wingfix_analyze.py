"""WINGFIX_PREREG.md analysis (committed before any study run). d = 3 + 4, seeds 1-3, pooled; exact Poisson / conditional-binomial 95 % intervals."""
import json, os
from scipy.stats import beta, chi2
H = os.path.dirname(os.path.abspath(__file__)); S = (1, 2, 3); D = (3, 4)
ld = lambda a, d, s: json.load(open(os.path.join(H, '..', 'out', 'wingfix', f'{a}_d{d}_{s}.json')))
tot = lambda a, k: sum(ld(a, d, s)[k] for d in D for s in S)
pair = lambda a, k: sum(ld(a, d, s)['pairs'].get(k, 0) for d in D for s in S)
def cut(k2, k0):
    n = k2 + k0; lo = beta.ppf(0.025, k2, n - k2 + 1) if k2 > 0 else 0.0; hi = beta.ppf(0.975, k2 + 1, n - k2)
    r = lambda p: p / (1 - p); return 1 - k2 / k0, 1 - r(hi), 1 - r(lo)
L = ['| Wing level | A0 wide / close | A2 wide / close | cut wide [95 %] | cut close [95 %] | A0 Wing–Amazon wide | A0 Amazon–Zipline wide | Wing–Wing wide A0 / A2 |', '|---|---|---|---|---|---|---|---|']
ok1 = True; wa = {}
for lv in ('46', '61', '76', 'U'):
    a0, a2 = 'A0-' + lv, 'A2-' + lv; w0, c0, w2, c2 = tot(a0, 'cross_wide'), tot(a0, 'cross_close'), tot(a2, 'cross_wide'), tot(a2, 'cross_close')
    cw, cc = cut(w2, w0), cut(c2, c0); ok1 = ok1 and cw[0] >= 0.65 and cc[0] >= 0.80; wa[lv] = pair(a0, 'wide|amazon-wing')
    L.append(f"| {lv if lv != 'U' else 'uniform'} | {w0} / {c0} | {w2} / {c2} | {100*cw[0]:.0f} % [{100*cw[1]:.0f}–{100*cw[2]:.0f}] | {100*cc[0]:.0f} % [{100*cc[1]:.0f}–{100*cc[2]:.0f}] | {wa[lv]} | {pair(a0, 'wide|amazon-zipline')} | {pair(a0, 'wide|wing-wing')} / {pair(a2, 'wide|wing-wing')} |")
Sc = ['| Prediction | Result | Verdict |', '|---|---|---|',
      f"| W1 cut >= 65 % wide and >= 80 % close at every Wing level | see table | **{'PASS' if ok1 else 'FAIL'}** |",
      f"| W2 A0 Wing–Amazon meetings highest at Wing 61 m among fixed levels | 46: {wa['46']}, 61: {wa['61']}, 76: {wa['76']} | **{'PASS' if wa['61'] > max(wa['46'], wa['76']) else 'FAIL'}** |"]
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(H, 'wingfix_results_table.md'), 'w').write(txt + '\n')
