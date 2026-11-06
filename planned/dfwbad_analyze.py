"""Analysis for DFWBAD_PREREG.md; committed before the study runs."""
import glob, json
from scipy.stats import binomtest
R = [json.loads(l) for f in sorted(glob.glob('out/dfwbad/runs_*.jsonl')) for l in open(f) if l.strip()]
def agg(kind, arm):
    rows = [r for r in R if r['kind'] == kind and r['arm'] == arm]
    return dict(n=len(rows), ev=sum(r['events'] for r in rows), w=sum(r['cross_wide'] for r in rows), c=sum(r['cross_close'] for r in rows))
def ratio(a, b):
    if a['w'] == 0 or b['w'] == 0: return (a['w'] / a['ev']) / max(1e-9, b['w'] / b['ev']), None, None
    p0 = a['ev'] / (a['ev'] + b['ev']); t = binomtest(a['w'], a['w'] + b['w'], p0).proportion_ci(0.95, 'exact'); k = b['ev'] / a['ev']
    f = lambda p: p / (1 - p) * k if p < 1 else float('inf'); return (a['w'] / a['ev']) / (b['w'] / b['ev']), f(t.low), f(t.high)
fmt = lambda r: f'{r[0]:.1f}×' + (f' [{r[1]:.1f}–{r[2]:.1f}]' if r[1] else '')
P = print
P('| Test | Arm | runs | events | close calls (wide) | per 100 events | very close |'); P('|---|---|---|---|---|---|---|')
G = {}
for kind, arms in [('hold', ['A0', 'R', 'A2']), ('outage', ['A0', 'R', 'A2']), ('rth-120', ['A2', 'R']), ('rth-own', ['A2', 'R'])]:
    for arm in arms:
        a = agg(kind, arm); G[(kind, arm)] = a; P(f"| {kind} | {arm} | {a['n']} | {a['ev']} | {a['w']} | {100 * a['w'] / max(1, a['ev']):.2f} | {a['c']} |")
b1 = ratio(G[('hold', 'A0')], G[('hold', 'A2')]); b2 = ratio(G[('hold', 'A0')], G[('hold', 'R')]); b3 = ratio(G[('rth-120', 'A2')], G[('rth-own', 'A2')])
b4 = ratio(G[('rth-120', 'R')], G[('rth-own', 'R')]); b5 = ratio(G[('outage', 'A0')], G[('outage', 'A2')]); b6 = 100 * G[('hold', 'A0')]['w'] / G[('hold', 'A0')]['ev']
extra = ratio(G[('hold', 'R')], G[('hold', 'A2')])
P(f"\nHover R vs A2: {fmt(extra)}")
P('\n| Prediction | Result [95 %] | Verdict |\n|---|---|---|')
for n, r, ok in [('B1 hover A0 vs A2 >= 4× [Houston 9.4×]', fmt(b1), b1[0] >= 4), ('B2 hover A0 vs R >= 3× [6.8×]', fmt(b2), b2[0] >= 3),
                 ('B3 return home A2: 120 m vs own >= 5× [10.7×]', fmt(b3), b3[0] >= 5), ('B4 return home R: 120 m vs own >= 4× [8.6×]', fmt(b4), b4[0] >= 4),
                 ('B5 area hold A0 vs A2 >= 3× [7.0×]', fmt(b5), b5[0] >= 3), ('B6 hover A0 per 100 below 3.93', f'{b6:.2f}', b6 < 3.93)]:
    P(f"| {n} | {r} | **{'PASS' if ok else 'FAIL'}** |")
P(f'\nRuns read: {len(R)} (expected 51).')
