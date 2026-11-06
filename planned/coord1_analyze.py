#!/usr/bin/env python3
"""COORD1 analysis (registration planned/COORD1_PREREG.md). Reads out/coord1/*.jsonl, prints tables and C1-C6 verdicts.
Interpretation fixed before the data: where a prediction does not name heights, it is judged on A2 and A0 is shown beside it.
Means are over seeds 1-3 (min-max shown); delayed/cancelled shares pool all checked flights over the seeds."""
import json, glob, sys, collections
R = collections.defaultdict(list)
for f in sorted(glob.glob('out/coord1/*.jsonl')):
    for l in open(f):
        if l.strip():
            r = json.loads(l); R[(r['metro'], r['heights'], r['arm'])].append(r)
ARMS = ['NONE', 'MIN', 'V1', 'V2', 'V3']; MET = ['houston', 'dfw']; HK = ['A0', 'A2']
need = len(MET) * len(HK) * len(ARMS)
if len(R) < need or any(len(v) != 3 for v in R.values()):
    print('INCOMPLETE: %d cells, runs per cell %s' % (len(R), sorted(set(len(v) for v in R.values())))); sys.exit(1)
def mean(v): return sum(v) / len(v)
def hr(m, h, a, k): v = [r[k] / 2.0 for r in R[(m, h, a)]]; return mean(v), min(v), max(v)   # per hour (2 h window)
def share(m, h, a, key='delayed', op='all'):
    n = sum(r['cost'].get(op, {}).get('n', 0) for r in R[(m, h, a)]); d = sum(r['cost'].get(op, {}).get(key, 0) for r in R[(m, h, a)])
    return d / n if n else 0.0
def conf(m, h, a, k):
    v = [r['conformance'][k] for r in R[(m, h, a)] if r['conformance']]; return mean(v) if v else None
print('## Flown cross-company conflicts per hour, mean [min-max] over seeds 1-3 (wide = 30 m / 10 m, close = 15 m / 5 m)')
print('| metro | heights | arm | planned conflicts/h | tight conflicts/h |\n|---|---|---|---|---|')
for m in MET:
    for h in HK:
        for a in ARMS:
            w, c = hr(m, h, a, 'wide'), hr(m, h, a, 'close')
            print('| %s | %s | %s | %.1f [%.1f-%.1f] | %.1f [%.1f-%.1f] |' % ((m, h, a) + w + c))
print('\n## Cost of coordination (share of checked flights in the measured window, pooled over seeds)')
print('| metro | heights | arm | checked | delayed | cancelled | mean delay s | p95 delay s (mean of seeds) | wing delayed | amazon delayed | zipline delayed | leave own window (flights) | block-time outside |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for m in MET:
    for h in HK:
        for a in ARMS[1:]:
            rs = R[(m, h, a)]; n = sum(r['cost']['all']['n'] for r in rs)
            md = mean([r['cost']['all']['meanD'] for r in rs]); p95 = mean([r['cost']['all']['p95D'] for r in rs])
            cf = conf(m, h, a, 'anyShare'); ct = conf(m, h, a, 'timeShare')
            print('| %s | %s | %s | %d | %.2f%% | %.2f%% | %.0f | %.0f | %.2f%% | %.2f%% | %.2f%% | %s | %s |' % (m, h, a, n, 100 * share(m, h, a), 100 * share(m, h, a, 'cancelled'), md, p95,
                  100 * share(m, h, a, 'delayed', 'wing'), 100 * share(m, h, a, 'delayed', 'amazon'), 100 * share(m, h, a, 'delayed', 'zipline'),
                  '-' if cf is None else '%.1f%%' % (100 * cf), '-' if ct is None else '%.2f%%' % (100 * ct)))
print('\n## Wind used');
for m in MET:
    print(m, [(r['seed'], r['windHour'], r['wind120']) for r in sorted(R[(m, 'A2', 'NONE')], key=lambda r: r['seed'])])
V = []
def verdict(name, text, ok, detail): V.append((name, ok)); print('%s %s: %s -- %s' % ('PASS' if ok else 'FAIL', name, text, detail))
print('\n## Predictions (registered thresholds; judged on A2 unless the prediction names both)')
d = []; ok = True
for m in MET:
    n = hr(m, 'A2', 'NONE', 'wide')[0]; v = hr(m, 'A2', 'V2', 'wide')[0]; cut = 1 - v / n if n else float('nan'); d.append('%s NONE %.1f -> V2 %.1f/h (cut %.0f%%)' % (m, n, v, 100 * cut)); ok &= (n > 0 and cut >= 0.90)
verdict('C1', 'V2 cuts flown planned conflicts >= 90%', ok, '; '.join(d))
d = []; ok = True
for m in MET:
    n = hr(m, 'A2', 'NONE', 'wide')[0]; mi = hr(m, 'A2', 'MIN', 'wide')[0]; d.append('%s MIN keeps %.0f%% (A0 %.0f%%)' % (m, 100 * mi / n, 100 * hr(m, 'A0', 'MIN', 'wide')[0] / hr(m, 'A0', 'NONE', 'wide')[0])); ok &= (mi >= 0.25 * n)
verdict('C2', 'MIN leaves >= 25% of NONE conflicts', ok, '; '.join(d))
d = []; ok = True
for m in MET:
    s2, s0 = share(m, 'A2', 'V2'), share(m, 'A0', 'V2'); d.append('%s A2 %.2f%% A0 %.2f%% ratio %.2f' % (m, 100 * s2, 100 * s0, s0 / s2 if s2 else float('inf'))); ok &= (s2 <= 0.05 and s0 >= 1.5 * s2)
verdict('C3', 'V2 A2 delays <= 5%, A0 share >= 1.5 x A2', ok, '; '.join(d))
d = []; ok = True
for m in MET:
    s2, s0 = share(m, 'A2', 'V3'), share(m, 'A0', 'V3'); ratio = s0 / s2 if s2 else float('inf'); d.append('%s A2 %.1f%% A0 %.1f%% ratio %.2f' % (m, 100 * s2, 100 * s0, ratio))
    ok &= (ratio <= 1.3) and (m != 'houston' or s2 >= 0.15)
verdict('C4', 'V3 A2 delays >= 15% in Houston; A0/A2 ratio <= 1.3 in both', ok, '; '.join(d))
d = []; ok = True
for m in MET:
    c1, c2 = conf(m, 'A2', 'V1', 'anyShare'), conf(m, 'A2', 'V2', 'anyShare'); d.append('%s V1 %.1f%% V2 %.1f%%' % (m, 100 * c1, 100 * c2)); ok &= (c1 >= 0.20 and c2 <= 0.10)
verdict('C5', 'V1 >= 20% and V2 <= 10% of flights leave windows', ok, '; '.join(d))
d = []; ok = True
for m in MET:
    n = hr(m, 'A2', 'NONE', 'close')[0]; v = hr(m, 'A2', 'V2', 'close')[0]; d.append('%s NONE %.1f V2 %.1f/h (%.0f%%)' % (m, n, v, 100 * v / n if n else float('nan'))); ok &= (n > 0 and v <= 0.10 * n)
verdict('C6', 'V2 tight conflicts <= 10% of NONE', ok, '; '.join(d))
print('\n%d of %d predictions passed' % (sum(1 for _, o in V if o), len(V)))
