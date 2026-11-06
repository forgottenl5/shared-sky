"""Analysis for PRELAUNCH_PREREG.md. Reads out/prelaunch/runs_*.jsonl, prints tables and verdicts (markdown).
Written and committed before any study run."""
import glob, json, sys
from collections import defaultdict
from scipy.stats import chi2, binomtest

R = [json.loads(l) for f in sorted(glob.glob('out/prelaunch/runs_*.jsonl')) for l in open(f) if l.strip()]
def ci(k):
    lo = 0.0 if k == 0 else chi2.ppf(0.025, 2 * k) / 2
    return lo, chi2.ppf(0.975, 2 * k + 2) / 2
def sel(**kw):
    out = []
    for r in R:
        if all((json.dumps(r.get(k)) == json.dumps(v)) for k, v in kw.items()): out.append(r)
    return out
def pool(rows, key='cross_wide'): return sum(r[key] for r in rows)
def cut(a, b): return None if a == 0 else 1 - b / a
def pct(x): return '—' if x is None else f'{100 * x:.0f} %'
def pairs(rows):
    p = defaultdict(int)
    for r in rows:
        for k, v in r['pairs'].items(): p[k] += v
    return dict(p)
def V(ok): return '**PASS**' if ok else '**FAIL**'
out = []; P = out.append

# ---- S1
P('## S1 Amazon heights (d = 3 + 4, seeds 1–3)\n')
P('| Arm | wide [95 %] | close [95 %] | A2 wide cut vs this | A2 close cut vs this | amazon-wing / amazon-zipline / wing-zipline (wide) |')
P('|---|---|---|---|---|---|')
s1 = {}
a2 = sel(study='S1', arm='A2'); a2w, a2c = pool(a2), pool(a2, 'cross_close')
for arm in ['B61_105', 'B61_111', 'B61_115', 'B61_122', 'B69_105', 'B69_111', 'B69_115', 'B69_122', 'A2']:
    rows = sel(study='S1', arm=arm)
    if not rows: continue
    w, c = pool(rows), pool(rows, 'cross_close'); s1[arm] = (w, c, pairs(rows))
    lw, hw = ci(w); lc, hc = ci(c); pr = pairs(rows)
    P(f'| {arm} | {w} [{lw:.0f}–{hw:.0f}] | {c} [{lc:.0f}–{hc:.0f}] | {pct(cut(w, a2w)) if arm != "A2" else "—"} | {pct(cut(c, a2c)) if arm != "A2" else "—"} | {pr.get("amazon-wing", 0)} / {pr.get("amazon-zipline", 0)} / {pr.get("wing-zipline", 0)} |')
P(f'\nRuns: {len(sel(study="S1"))} (expected 54).\n')
v = []
if {'B61_105', 'B61_111', 'B69_122', 'B69_105'} <= set(s1):
    b0 = s1['B61_105'][0]
    r1 = s1['B61_111'][0] / b0; v.append(('P1 B(61,111) <= 45 % of B(61,105) wide', f'{100 * r1:.0f} %', r1 <= 0.45))
    r2 = s1['B69_122'][0] / b0; v.append(('P2 B(69,122) <= 30 % of B(61,105) wide', f'{100 * r2:.0f} %', r2 <= 0.30))
    c3 = cut(s1['B69_122'][0], a2w); v.append(('P3 A2 wide cut vs B(69,122) < 50 %', pct(c3), c3 is not None and c3 < 0.50))
    wa0, wa1 = s1['B61_105'][2].get('amazon-wing', 0), s1['B69_105'][2].get('amazon-wing', 0)
    ch = None if wa0 == 0 else abs(wa1 - wa0) / wa0; v.append(('P4 Wing–Amazon wide change 61→69 m outbound (i = 105) < 25 %', f'{wa0} → {wa1} ({pct(ch)})', ch is not None and ch < 0.25))
    P(f'Consequence rule: A2 wide cut vs B(69,122) = {pct(c3)} → ' + ('page headline must lead with this smaller number.' if c3 is not None and c3 < 0.5 else 'headline wording stands, with the reported-heights result shown beside it.') + '\n')

# ---- S2
P('## S2 Height-keeping error (d = 3 + 4, seeds 1–3)\n')
P('| zsig | A0 wide / close | A2 wide / close | wide cut | close cut |'); P('|---|---|---|---|---|')
base0 = [r for r in sel(study='S1', arm='B61_105')]; base2 = a2
rowsZ = {0: (base0, base2)}
for z in [3, 5]: rowsZ[z] = (sel(study='S2', arm='A0', zsig=z), sel(study='S2', arm='A2', zsig=z))
for z, (r0, r2) in rowsZ.items():
    if not r0 or not r2: continue
    w0, c0, w2, c2 = pool(r0), pool(r0, 'cross_close'), pool(r2), pool(r2, 'cross_close')
    P(f'| {z} m | {w0} / {c0} | {w2} / {c2} | {pct(cut(w0, w2))} | {pct(cut(c0, c2))} |')
    if z == 3: v.append(('E1 A2 wide cut >= 65 % at zsig 3 m', pct(cut(w0, w2)), cut(w0, w2) is not None and cut(w0, w2) >= 0.65))
    if z == 5: v.append(('E2 A2 wide cut >= 50 % at zsig 5 m', pct(cut(w0, w2)), cut(w0, w2) is not None and cut(w0, w2) >= 0.50))
P('')

# ---- S3a
P('## S3a Layout spread\n')
P('| d | seeds | A0 wide | A2 wide | pooled cut [95 %] | per-seed cuts (A0 >= 10): n, p10, median, min–max |'); P('|---|---|---|---|---|---|')
def seedrows(d, seeds):
    a0, a2_ = {}, {}
    for r in R:
        if r['d'] != d or r['seed'] not in seeds or r.get('boxes') or r.get('zsig'): continue
        if r['study'] in ('S3a',) or (r['study'] == 'S1' and r['arm'] in ('B61_105', 'A2')):
            arm = 'A0' if r['arm'] in ('A0', 'B61_105') else 'A2'
            (a0 if arm == 'A0' else a2_)[r['seed']] = r
    return a0, a2_
def quant(xs, q):
    xs = sorted(xs); i = max(0, min(len(xs) - 1, int(round(q * (len(xs) - 1))))); return xs[i]
for d, seeds in [(4, range(1, 31)), (3, range(1, 16)), (6, range(1, 31))]:
    a0, a2_ = seedrows(d, set(seeds)); common = sorted(set(a0) & set(a2_))
    if not common: continue
    w0 = sum(a0[s]['cross_wide'] for s in common); w2 = sum(a2_[s]['cross_wide'] for s in common)
    t = binomtest(w2, w0 + w2, 0.5).proportion_ci(0.95, 'exact') if w0 + w2 else None
    rr = lambda p: p / (1 - p) if p < 1 else float('inf')
    cut_ci = '' if not t else f' [{100 * (1 - rr(t.high)):.0f}–{100 * (1 - rr(t.low)):.0f} %]'
    per = [1 - a2_[s]['cross_wide'] / a0[s]['cross_wide'] for s in common if a0[s]['cross_wide'] >= 10]
    perS = f'{len(per)}, {pct(quant(per, 0.1))}, {pct(quant(per, 0.5))}, {pct(min(per))}–{pct(max(per))}' if per else '0'
    P(f'| {d} km | {len(common)} | {w0} | {w2} | {pct(cut(w0, w2))}{cut_ci} | {perS} |')
    pc = cut(w0, w2)
    if d == 4: v.append(('L1 d = 4 pooled cut >= 70 % and p10 >= 50 %', f'{pct(pc)}, p10 {pct(quant(per, 0.1)) if per else "—"}', pc is not None and pc >= 0.70 and per and quant(per, 0.1) >= 0.50))
    if d == 3: v.append(('L2 d = 3 (15 seeds) pooled cut >= 70 %', pct(pc), pc is not None and pc >= 0.70))
    if d == 6: v.append(('L3 d = 6 pooled cut < 60 %', pct(pc), pc is not None and pc < 0.60))
P('')

# ---- S3b
P('## S3b Zipline drop-box layout (d = 3, seeds 1–3)\n')
P('| boxes | A0 wide | A2 wide | cut | difference from default (points) |'); P('|---|---|---|---|---|')
d0, d2 = seedrows(3, {1, 2, 3}); dc = cut(sum(r['cross_wide'] for r in d0.values()), sum(r['cross_wide'] for r in d2.values())) if d0 and d2 else None
P(f'| 20 within 5 km (default) | {sum(r["cross_wide"] for r in d0.values())} | {sum(r["cross_wide"] for r in d2.values())} | {pct(dc)} | — |')
diffs = []
for n in [5, 40]:
    for rad in [2000, 5000]:
        r0 = sel(study='S3b', arm='A0', boxes={'n': n, 'r': rad}); r2 = sel(study='S3b', arm='A2', boxes={'n': n, 'r': rad})
        if not r0 or not r2: continue
        c = cut(pool(r0), pool(r2)); df = None if c is None or dc is None else 100 * (c - dc); diffs.append(df)
        P(f'| {n} within {rad // 1000} km | {pool(r0)} | {pool(r2)} | {pct(c)} | {"—" if df is None else f"{df:+.0f}"} |')
if len(diffs) == 4: v.append(('L4 every box layout within ±10 points of default', ', '.join('—' if x is None else f'{x:+.0f}' for x in diffs), all(x is not None and abs(x) <= 10 for x in diffs)))
P('')

P('## Verdicts\n'); P('| Prediction | Result | Verdict |'); P('|---|---|---|')
for name, res, ok in v: P(f'| {name} | {res} | {V(ok)} |')
P(f'\nTotal runs read: {len(R)}.')
print('\n'.join(out))
