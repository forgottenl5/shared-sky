#!/usr/bin/env python3
"""COORD2 analysis (planned/COORD2_PREREG.md). G20 from out/coord2, A0/A2 from out/coord1 (reused). Means over seeds 1-3."""
import json, glob, collections, sys
R = collections.defaultdict(list)
for d in ('coord1', 'coord2'):
    for f in sorted(glob.glob('out/%s/*.jsonl' % d)):
        for l in open(f):
            if l.strip():
                r = json.loads(l)
                if r['arm'] in ('NONE', 'V2'): R[(r['metro'], r['heights'], r['arm'])].append(r)
MET = ['houston', 'dfw']; HK = ['A0', 'A2', 'G20']
if any(len(R[(m, h, a)]) != 3 for m in MET for h in HK for a in ('NONE', 'V2')): print('INCOMPLETE'); sys.exit(1)
mean = lambda v: sum(v) / len(v)
hr = lambda m, h, a, k: mean([r[k] / 2.0 for r in R[(m, h, a)]])
def share(m, h, key='delayed', op='all'):
    rs = R[(m, h, 'V2')]; n = sum(r['cost'].get(op, {}).get('n', 0) for r in rs); d = sum(r['cost'].get(op, {}).get(key, 0) for r in rs); return d / n if n else 0.0
conf = lambda m, h: mean([r['conformance']['anyShare'] for r in R[(m, h, 'V2')] if r['conformance']])
print('| metro | heights | NONE planned/h | V2 planned/h | V2 tight/h | delayed | cancelled | amazon delayed | wing delayed | zipline delayed | leave window |\n|---|---|---|---|---|---|---|---|---|---|---|')
for m in MET:
    for h in HK:
        print('| %s | %s | %.1f | %.2f | %.2f | %.1f%% | %.2f%% | %.1f%% | %.1f%% | %.1f%% | %.1f%% |' % (m, h, hr(m, h, 'NONE', 'wide'), hr(m, h, 'V2', 'wide'), hr(m, h, 'V2', 'close'),
              100 * share(m, h), 100 * share(m, h, 'cancelled'), 100 * share(m, h, 'delayed', 'amazon'), 100 * share(m, h, 'delayed', 'wing'), 100 * share(m, h, 'delayed', 'zipline'), 100 * conf(m, h)))
V = []
def verdict(n, t, ok, d): V.append(ok); print('%s %s: %s -- %s' % ('PASS' if ok else 'FAIL', n, t, d))
g = lambda f: all(f(m) for m in MET); dd = lambda f: '; '.join('%s %s' % (m, f(m)) for m in MET)
verdict('G1', 'G20 delays <= 7% and <= half of A2', g(lambda m: share(m, 'G20') <= .07 and share(m, 'G20') <= .5 * share(m, 'A2')), dd(lambda m: 'G20 %.1f%% A2 %.1f%%' % (100 * share(m, 'G20'), 100 * share(m, 'A2'))))
verdict('G2', 'Amazon delayed 30-60%', g(lambda m: .30 <= share(m, 'G20', 'delayed', 'amazon') <= .60), dd(lambda m: '%.1f%%' % (100 * share(m, 'G20', 'delayed', 'amazon'))))
verdict('G3', 'Wing and Zipline each <= 5%', g(lambda m: share(m, 'G20', 'delayed', 'wing') <= .05 and share(m, 'G20', 'delayed', 'zipline') <= .05), dd(lambda m: 'wing %.1f%% zipline %.1f%%' % (100 * share(m, 'G20', 'delayed', 'wing'), 100 * share(m, 'G20', 'delayed', 'zipline'))))
verdict('G4', 'G20+V2 flown planned conflicts <= 0.5/h', g(lambda m: hr(m, 'G20', 'V2', 'wide') <= .5), dd(lambda m: '%.2f/h' % hr(m, 'G20', 'V2', 'wide')))
verdict('G5', 'leave-window share within 3 points of A2', g(lambda m: abs(conf(m, 'G20') - conf(m, 'A2')) <= .03), dd(lambda m: 'G20 %.1f%% A2 %.1f%%' % (100 * conf(m, 'G20'), 100 * conf(m, 'A2'))))
verdict('G6', 'NONE: G20 conflicts <= A2', g(lambda m: hr(m, 'G20', 'NONE', 'wide') <= hr(m, 'A2', 'NONE', 'wide')), dd(lambda m: 'G20 %.1f A2 %.1f /h' % (hr(m, 'G20', 'NONE', 'wide'), hr(m, 'A2', 'NONE', 'wide'))))
print('%d of %d passed' % (sum(V), len(V)))
