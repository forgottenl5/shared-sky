#!/usr/bin/env python3
"""DENS1 analysis (planned/DENS1_PREREG.md). k=1 from out/coord1 (A2) and out/coord2 (G20); other k from out/dens1. Means over seeds 1-3."""
import json, glob, collections, math, sys
R = collections.defaultdict(list)
for d in ('coord1', 'coord2', 'dens1'):
    for f in sorted(glob.glob('out/%s/*.jsonl' % d)):
        for l in open(f):
            if not l.strip(): continue
            r = json.loads(l); k = r.get('k', 1)
            if r['heights'] in ('A2', 'G20') and r['arm'] in ('NONE', 'V2'):
                key = (r['metro'], r['heights'], r['arm'], k)
                R[key] = [x for x in R[key] if x['seed'] != r['seed']] + [r]   # deviation 1: a later file (out/dens1) replaces the same seed from coord2
MET = ['houston', 'dfw']; HK = ['A2', 'G20']; KS = [0.25, 0.5, 1, 1.5, 2]
if any(len(R[(m, h, a, k)]) != 3 for m in MET for h in HK for a in ('NONE', 'V2') for k in KS): print('INCOMPLETE'); sys.exit(1)
mean = lambda v: sum(v) / len(v)
cph = lambda m, h, a, k: mean([r['wide'] / 2.0 for r in R[(m, h, a, k)]])
def share(m, h, k, key):
    rs = R[(m, h, 'V2', k)]; n = sum(r['cost']['all']['n'] for r in rs); return sum(r['cost']['all'][key] for r in rs) / n
meanD = lambda m, h, k: (lambda rs: sum(r['cost']['all']['meanD'] * r['cost']['all']['delayed'] for r in rs) / max(1, sum(r['cost']['all']['delayed'] for r in rs)))(R[(m, h, 'V2', k)])
def slope(m, h):
    xs = [math.log(k) for k in KS]; ys = [math.log(max(cph(m, h, 'NONE', k), 1e-9)) for k in KS]; mx, my = mean(xs), mean(ys)
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
print('| metro | heights | k | NONE planned/h | V2 planned/h | V2 delayed | V2 cancelled | V2 mean delay s |\n|---|---|---|---|---|---|---|---|')
for m in MET:
    for h in HK:
        for k in KS:
            print('| %s | %s | %g | %.1f | %.2f | %.1f%% | %.2f%% | %.0f |' % (m, h, k, cph(m, h, 'NONE', k), cph(m, h, 'V2', k), 100 * share(m, h, k, 'delayed'), 100 * share(m, h, k, 'cancelled'), meanD(m, h, k)))
V = []
def verdict(n, t, ok, d): V.append(ok); print('%s %s: %s -- %s' % ('PASS' if ok else 'FAIL', n, t, d))
cells = [(m, h) for m in MET for h in HK]
verdict('D1', 'NONE exponent b in [1.7, 2.3]', all(1.7 <= slope(m, h) <= 2.3 for m, h in cells), '; '.join('%s %s b=%.2f' % (m, h, slope(m, h)) for m, h in cells))
verdict('D2', 'V2 A2 delayed(k=2) >= 2 x delayed(k=1)', all(share(m, 'A2', 2, 'delayed') >= 2 * share(m, 'A2', 1, 'delayed') for m in MET), '; '.join('%s %.1f%% -> %.1f%%' % (m, 100 * share(m, 'A2', 1, 'delayed'), 100 * share(m, 'A2', 2, 'delayed')) for m in MET))
verdict('D3', 'G20 delayed < A2 at every k', all(share(m, 'G20', k, 'delayed') < share(m, 'A2', k, 'delayed') for m in MET for k in KS), '; '.join('%s %s' % (m, ' '.join('%g:%.1f/%.1f' % (k, 100 * share(m, 'G20', k, 'delayed'), 100 * share(m, 'A2', k, 'delayed')) for k in KS)) for m in MET))
verdict('D4', 'Houston V2 A2 cancelled at k=2 >= 3%', share('houston', 'A2', 2, 'cancelled') >= 0.03, '%.2f%%' % (100 * share('houston', 'A2', 2, 'cancelled')))
verdict('D5', 'mean delay monotone in k', all(all(meanD(m, h, KS[i + 1]) > meanD(m, h, KS[i]) for i in range(len(KS) - 1)) for m, h in cells), '; '.join('%s %s %s' % (m, h, ' '.join('%.0f' % meanD(m, h, k) for k in KS)) for m, h in cells))
verdict('D6', 'V2 flown planned conflicts <= 1/h at k=2', all(cph(m, h, 'V2', 2) <= 1 for m, h in cells), '; '.join('%s %s %.2f' % (m, h, cph(m, h, 'V2', 2)) for m, h in cells))
print('%d of %d passed' % (sum(V), len(V)))
