"""Analysis for TODAYVOL_PREREG.md; committed before runs."""
import glob, json, math, os
R = [json.loads(l) for f in glob.glob('out/todayvol/runs_*.jsonl') for l in open(f) if l.strip()]
if not R: raise SystemExit('No runs in out/todayvol/: run `node planned/todayvol_run.js <shard> <n>` first.')
def rows(m, st, arm, v): return [r for r in R if (r['metro'], r['stage'], r['arm'], r['vol']) == (m, st, arm, v)]
def tot(m, st, arm, v, f=lambda r: r['w']): return sum(f(r) for r in rows(m, st, arm, v))
def hrs(m, st, arm, v): return 2 * len(rows(m, st, arm, v))
def pois(k):
    """Exact (Garwood) 95 % interval for a Poisson count, by bisection on the CDF."""
    def cdf(x, mu): return sum(math.exp(-mu + i * math.log(mu) - math.lgamma(i + 1)) for i in range(x + 1)) if mu > 0 else 1.0
    def bis(f, lo, hi):
        for _ in range(100):
            mid = (lo + hi) / 2
            if f(mid): lo = mid
            else: hi = mid
        return (lo + hi) / 2
    lo = 0.0 if k == 0 else bis(lambda mu: (1 - cdf(k - 1, mu)) < 0.025, 0, k + 1)
    hi = bis(lambda mu: cdf(k, mu) > 0.025, k, 10 * k + 20)
    return lo, hi
def cell(k, h): lo, hi = pois(k); return f"{k/h:.2f} ({k}; {lo:.0f}-{hi:.0f})"
M = ['dfw', 'houston']; ST = ['early', 'mid', 'full']
for m in M:
    print(f"\n## {m.upper()}: wide meetings per hour between companies (count and exact 95 % interval in brackets, 12 measured hours per cell)")
    print('| Stage | Heights | Amazon at cap | Amazon at 20 % (v20) | v20 / cap |\n|---|---|---|---|---|')
    for st in ST:
        for arm in ['A0', 'R', 'A2']:
            a, b = tot(m, st, arm, 'cap'), tot(m, st, arm, 'v20'); ha, hb = hrs(m, st, arm, 'cap'), hrs(m, st, arm, 'v20')
            print(f"| {st} | {arm} | {cell(a, ha)} | {cell(b, hb)} | " + (f"{100*(b/hb)/(a/ha):.0f} % |" if a else "- |"))
    print(f"\nSharing out (A2 vs A0), cut in wide meetings:")
    for st in ST:
        for v in ['cap', 'v20']:
            a0, a2 = tot(m, st, 'A0', v), tot(m, st, 'A2', v); print(f"- {st} {v}: {a0} -> {a2}" + (f" ({100*(1-a2/a0):.0f} % cut)" if a0 else ''))
    print('\nPairs at full, Omaha profile (A0), wide meetings:')
    for v in ['cap', 'v20']:
        P = {}
        for r in rows(m, 'full', 'A0', v):
            for k, x in r['pairs'].items(): P[k] = P.get(k, 0) + x
        print(f"- {v}: " + ', '.join(f"{k} {x}" for k, x in sorted(P.items(), key=lambda t: -t[1])))
def pairsum(m, st, arm, v, pred):
    return sum(x for r in rows(m, st, arm, v) for k, x in r['pairs'].items() if pred(k))
res = []
for m in M:
    a0c, a0v = tot(m, 'full', 'A0', 'cap'), tot(m, 'full', 'A0', 'v20')
    T1 = a0v <= 0.5 * a0c
    wzc, wzv = pairsum(m, 'full', 'A0', 'cap', lambda k: k in ('wing-zipline', 'zipline-wing')), pairsum(m, 'full', 'A0', 'v20', lambda k: k in ('wing-zipline', 'zipline-wing'))
    T2 = wzc > 0 and abs(wzv - wzc) <= 0.15 * wzc
    a2v = tot(m, 'full', 'A2', 'v20'); T3 = a0v > 0 and (1 - a2v / a0v) >= 0.5
    amv = pairsum(m, 'full', 'A0', 'v20', lambda k: 'amazon' in k); T4 = a0v > 0 and amv / a0v < 0.5
    midv = tot(m, 'mid', 'A0', 'v20') / hrs(m, 'mid', 'A0', 'v20'); lim = 1.5 if m == 'dfw' else 3.0; T5 = midv <= lim
    res += [(f'T1 {m}: A0 full v20 <= 50 % of cap', f"{a0v} vs {a0c}", T1), (f'T2 {m}: Wing-Zipline same within 15 %', f"cap {wzc}, v20 {wzv}", T2),
            (f'T3 {m}: A2 cuts A0 >= 50 % at v20', f"{a0v} -> {a2v}", T3), (f'T4 {m}: Amazon pairs < 50 % of A0 at v20', f"{amv} of {a0v}", T4), (f'T5 {m}: mid A0 v20 <= {lim}/h', f"{midv:.2f}/h", T5)]
print('\n| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in res: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print(f"\nRuns read: {len(R)} (expected 216).")
