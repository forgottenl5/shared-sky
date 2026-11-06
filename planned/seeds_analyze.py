"""Analysis for SEEDS_PREREG.md; committed before runs. Pools seeds 1-3 (registered runs) with seeds 4-10."""
import glob, json, random
B = [json.loads(l) for p in ['out/buildout/runs_*.jsonl', 'out/seeds_buildout/runs_*.jsonl'] for f in glob.glob(p) for l in open(f) if l.strip()]
D = [json.loads(l) for p in ['out/dfwreal/runs_*.jsonl', 'out/seeds_dfwreal/runs_*.jsonl'] for f in glob.glob(p) for l in open(f) if l.strip()]
def boot(pairs, n=2000):   # pairs = [(base, treated)] per seed; 90 % bootstrap interval of the pooled cut
    rng = random.Random(7); cs = []
    for _ in range(n):
        s = [rng.choice(pairs) for _ in pairs]; a = sum(x for x, _ in s); cs.append(1 - sum(y for _, y in s) / a if a else 0)
    cs.sort(); return cs[int(0.05 * n)], cs[int(0.95 * n)]
def bo(st, arm, v, key='noCheck'): return {r['seed']: r[key]['w'] for r in B if r['stage'] == st and r['arm'] == arm and r['variant'] == v}
print('## Houston build-out, seeds 1-10 (mid and full; still-air and ±30 s wind variants)')
print('| Stage | Omaha per hour: mean (seed range) | A2 cut vs A0 [90 % interval] | A2 cut vs R | ±30 s wind check removes (A0) | delayed share A0 / A2 (±30 s wind) |\n|---|---|---|---|---|---|')
res = {}
for st in ['mid', 'full']:
    a0, r_, a2 = bo(st, 'A0', 'still5'), bo(st, 'R', 'still5'), bo(st, 'A2', 'still5'); seeds = sorted(set(a0) & set(a2) & set(r_))
    c = 1 - sum(a2[s] for s in seeds) / sum(a0[s] for s in seeds); lo, hi = boot([(a0[s], a2[s]) for s in seeds]); cr = 1 - sum(a2[s] for s in seeds) / max(1, sum(r_[s] for s in seeds))
    nw, aw = bo(st, 'A0', 'wind30'), bo(st, 'A0', 'wind30', 'afterCheck'); sw = sorted(set(nw) & set(aw)); rem = 1 - sum(aw[s] for s in sw) / max(1, sum(nw[s] for s in sw))
    dl = {arm: sum(r['check']['delayed'] for r in B if r['stage'] == st and r['arm'] == arm and r['variant'] == 'wind30') / max(1, sum(r['check']['checked'] for r in B if r['stage'] == st and r['arm'] == arm and r['variant'] == 'wind30')) for arm in ['A0', 'A2']}
    per = [a0[s] / 2 for s in seeds]; res[st] = dict(c=c, lo=lo, rem=rem, dl=dl, ph=sum(per) / len(per), n=len(seeds))
    print(f"| {st} ({len(seeds)} seeds) | {res[st]['ph']:.1f} ({min(per):.1f}–{max(per):.1f}) | {100*c:.0f} % [{100*lo:.0f}–{100*hi:.0f}] | {100*cr:.0f} % | {100*rem:.0f} % | {100*dl['A0']:.1f} % / {100*dl['A2']:.1f} % |")
print('\n## DFW real layout, seeds 1-10')
def dv(arm): return {r['seed']: r['cross_wide'] for r in D if r['arm'] == arm}
d0, dt, dr, d2 = dv('A0'), dv('T'), dv('R'), dv('A2'); ss = sorted(set(d0) & set(d2) & set(dt) & set(dr))
cut = lambda base: 1 - sum(d2[s] for s in ss) / max(1, sum(base[s] for s in ss))
am = sum(v for r in D if r['arm'] == 'A0' for k, v in r['pairs'].items() if 'amazon' in k) / max(1, sum(r['cross_wide'] for r in D if r['arm'] == 'A0'))
lo, hi = boot([(d0[s], d2[s]) for s in ss])
print(f"| seeds | A2 cut vs A0 [90 %] | vs T | vs R | Amazon share of A0 |\n|---|---|---|---|---|\n| {len(ss)} | {100*cut(d0):.0f} % [{100*lo:.0f}–{100*hi:.0f}] | {100*cut(dt):.0f} % | {100*cut(dr):.0f} % | {100*am:.0f} % |")
P = [('S-B1 mid still below 10 an hour (B1 FAIL persists)', f"{res['mid']['ph']:.1f}", res['mid']['ph'] < 10),
     ('S-B2 sharing-out cut >= 65 % at mid and full', f"{100*res['mid']['c']:.0f} / {100*res['full']['c']:.0f} %", res['mid']['c'] >= 0.65 and res['full']['c'] >= 0.65),
     ('S-B3 full ±30 s wind check still removes < 80 % (B3 FAIL persists)', f"{100*res['full']['rem']:.0f} %", res['full']['rem'] < 0.80),
     ('S-B4 delayed share with sharing out <= half (full)', f"{100*res['full']['dl']['A2']:.1f} vs {100*res['full']['dl']['A0']:.1f} %", res['full']['dl']['A2'] <= 0.5 * res['full']['dl']['A0']),
     ('S-F DFW: Amazon >= 60 %, cut vs A0 >= 45 %, vs R <= 50 %, vs T >= 40 %', f"{100*am:.0f} / {100*cut(d0):.0f} / {100*cut(dr):.0f} / {100*cut(dt):.0f} %", am >= 0.6 and cut(d0) >= 0.45 and cut(dr) <= 0.5 and cut(dt) >= 0.4)]
print('\n| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in P: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print(f"Runs read: build-out {len(B)}, DFW {len(D)} (expected 108 + 84 = 192, and 12 + 28 = 40).")
