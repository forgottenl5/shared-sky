"""COUNTFIX_PREREG.md analysis (committed before the re-runs). Exact Poisson 95 % intervals; ratio intervals by the conditional binomial (Clopper-Pearson) method."""
import json, os, glob
from scipy.stats import chi2, beta
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, '..', 'out', 'countfix'); R = {}
for f in glob.glob(os.path.join(OUT, '*.json')):
    r = json.load(open(f)); R[(r['job'], r['arm'], r['d'], r['seed'])] = r
def tot(job, arm, k, seeds, ds=(3, 4)): return sum(R[(job, arm, d, s)][k] for d in ds for s in seeds)
def pci(k): return (0.0 if k == 0 else chi2.ppf(0.025, 2 * k) / 2, chi2.ppf(0.975, 2 * k + 2) / 2)
def rci(k1, e1, k2, e2):   # rate ratio (k1/e1)/(k2/e2)
    if k2 == 0: return (float('inf'),) * 3
    n = k1 + k2; lo = beta.ppf(0.025, k1, n - k1 + 1) if k1 > 0 else 0.0; hi = beta.ppf(0.975, k1 + 1, n - k1) if k1 < n else 1.0
    f = e2 / e1; tr = lambda p: f * p / (1 - p) if p < 1 else float('inf'); return (f * k1 / k2, tr(lo), tr(hi))
fmt = lambda k: f"{k} [{pci(k)[0]:.1f}–{pci(k)[1]:.1f}]"
L, Sc = [], ['| Prediction | Result | Verdict |', '|---|---|---|']
conv = json.load(open(os.path.join(H, 'countfix_converge.json'))); sub = conv['chosen']
L += [f"## Sampling convergence (VALLOC A0, d = 3, seeds 1–3): chosen sub = {sub}", '', '| checks per second | cross wide | cross close |', '|---|---|---|'] + [f"| {k} | {v['wide']} | {v['close']} |" for k, v in conv.items() if k != 'chosen'] + ['']
S1, S2 = (1, 2, 3), (19, 20, 21)
try:
    w0, w2, c0, c2 = (tot('valloc', a, k, S1) for a, k in (('A0', 'cross_wide'), ('A2', 'cross_wide'), ('A0', 'cross_close'), ('A2', 'cross_close')))
    L += ['## R-VALLOC (no plan check), d = 3 + 4, seeds 1–3', '', '| Heights | cross wide [95 %] | cross close [95 %] |', '|---|---|---|', f"| A0 filed | {fmt(w0)} | {fmt(c0)} |", f"| A2 allocation | {fmt(w2)} | {fmt(c2)} |", '']
    rw, rc = rci(w2, 1, w0, 1), rci(c2, 1, c0, 1)
    Sc.append(f"| U1 A2 cuts wide >= 65 % and close >= 80 % | wide cut {100*(1-rw[0]):.0f} % [{100*(1-rw[2]):.0f}–{100*(1-rw[1]):.0f}]; close cut {100*(1-rc[0]):.0f} % [{100*(1-rc[2]):.0f}–{100*(1-rc[1]):.0f}] | **{'PASS' if 1-rw[0] >= 0.65 and 1-rc[0] >= 0.80 else 'FAIL'}** |")
    pw = tot('proc', 'P2', 'cross_wide', S1); L += ['## R-PROC (A2 + plan check), d = 3 + 4, seeds 1–3', '', f"Cross-operator wide meetings after the check: {fmt(pw)}; close: {fmt(tot('proc', 'P2', 'cross_close', S1))}", '']
    Sc.append(f"| U2 after the plan check, wide <= 2 % of A2 unchecked | {pw} vs {w2} ({100*pw/w2:.1f} %) | **{'PASS' if pw <= 0.02 * w2 else 'FAIL'}** |")
except KeyError as e: L.append(f'(R-VALLOC/R-PROC incomplete: {e})')
try:
    k0, e0, k2_, e2 = tot('dev', 'HOLD-A0', 'cross_wide', S2), tot('dev', 'HOLD-A0', 'events', S2), tot('dev', 'HOLD-A2', 'cross_wide', S2), tot('dev', 'HOLD-A2', 'events', S2)
    r = rci(k0, e0, k2_, e2); rate2 = 100 * k2_ / e2
    L += ['## R-DEV (in-zone 120 s holds, plan check), d = 3 + 4, seeds 19–21', '', '| Heights | holds | cross wide [95 %] | per 100 holds | cross close |', '|---|---|---|---|---|',
          f"| A0 filed | {e0} | {fmt(k0)} | {100*k0/e0:.2f} | {fmt(tot('dev','HOLD-A0','cross_close',S2))} |", f"| A2 allocation | {e2} | {fmt(k2_)} | {rate2:.2f} | {fmt(tot('dev','HOLD-A2','cross_close',S2))} |", '']
    Sc.append(f"| U3 A0 >= 5x A2 per hold (lower 95 % > 1), A0 >= 30, A2 rate 0.1–2 per 100 | ratio {r[0]:.1f} [{r[1]:.1f}–{r[2]:.1f}]; A0 {k0}; A2 {rate2:.2f} per 100 | **{'PASS' if r[0] >= 5 and r[1] > 1 and k0 >= 30 and 0.1 <= rate2 <= 2 else 'FAIL'}** |")
    k1, e1, k3, e3 = tot('rth', 'RTH-120', 'cross_wide', S2), tot('rth', 'RTH-120', 'events', S2), tot('rth', 'RTH-OWN', 'cross_wide', S2), tot('rth', 'RTH-OWN', 'events', S2)
    r = rci(k1, e1, k3, e3)
    L += ['## R-RTH (in-zone return-to-home, A2), d = 3 + 4, seeds 19–21', '', '| Return height | events | cross wide [95 %] | per 100 | cross close |', '|---|---|---|---|---|',
          f"| 120 m | {e1} | {fmt(k1)} | {100*k1/e1:.2f} | {fmt(tot('rth','RTH-120','cross_close',S2))} |", f"| own height | {e3} | {fmt(k3)} | {100*k3/e3:.2f} | {fmt(tot('rth','RTH-OWN','cross_close',S2))} |", '']
    Sc.append(f"| U4 RTH-120 >= 5x RTH-OWN, >= 30 at 120 m | ratio {r[0]:.1f} [{r[1]:.1f}–{r[2]:.1f}]; {k1} at 120 m | **{'PASS' if r[0] >= 5 and k1 >= 30 else 'FAIL'}** |")
except KeyError as e: L.append(f'(R-DEV/R-RTH incomplete: {e})')
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(H, 'countfix_results_table.md'), 'w').write(txt + '\n')
