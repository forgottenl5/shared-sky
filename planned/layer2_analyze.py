#!/usr/bin/env python3
"""LAYER2 analysis (planned/LAYER2_PREREG.md). Reads out/layer2/*.jsonl; pooled over seeds 1-6; prints tables and Q1-Q6."""
import json, glob, collections, sys
R = collections.defaultdict(list)
for f in glob.glob('out/layer2/*.jsonl'):
    for l in open(f):
        if l.strip(): r = json.loads(l); R[(r['metro'], r['heights'], r['check'])].append(r)
MET = ['houston', 'dfw']; CELLS = [(h, c) for h in ['A2', 'WAZ'] for c in ['NONE', 'V2', 'V2v5']]
if len(R) != 12 or any(len(v) != 6 for v in R.values()): print('INCOMPLETE', {k: len(v) for k, v in R.items()}); sys.exit(1)
def tot(m, h, c, k): return sum(r[k] for r in R[(m, h, c)])
def share(m, h, c, op='all', key='delayed'): n = sum(r['cost'].get(op, {}).get('n', 0) for r in R[(m, h, c)]); return sum(r['cost'].get(op, {}).get(key, 0) for r in R[(m, h, c)]) / n if n else 0
def meanD(m, h, c): d = sum(r['cost']['all']['delayed'] for r in R[(m, h, c)]); return sum(r['cost']['all']['sumD'] for r in R[(m, h, c)]) / d if d else 0
for m in MET:
    print('\n## %s (pooled seeds 1-6, 2 measured hours each)\n| heights | check | flown wide | flown close | delayed | cancelled | mean delay s | Amazon delayed | Wing delayed | Zipline delayed |\n|---|---|---|---|---|---|---|---|---|---|' % m)
    for h, c in CELLS:
        if c == 'NONE': print('| %s | NONE | %d | %d | - | - | - | - | - | - |' % (h, tot(m, h, c, 'wide'), tot(m, h, c, 'close'))); continue
        print('| %s | %s | %d | %d | %.1f %% | %.2f %% | %.0f | %.1f %% | %.1f %% | %.1f %% |' % (h, c, tot(m, h, c, 'wide'), tot(m, h, c, 'close'), 100 * share(m, h, c), 100 * share(m, h, c, key='cancelled'), meanD(m, h, c), 100 * share(m, h, c, 'amazon'), 100 * share(m, h, c, 'wing'), 100 * share(m, h, c, 'zipline')))
V = []
def v(n, t, ok, d): V.append(ok); print('%s %s: %s -- %s' % ('PASS' if ok else 'FAIL', n, t, d))
print()
v('Q1', 'WAZ+V2v5 delayed <= 0.7 x A2+V2v5', all(share(m, 'WAZ', 'V2v5') <= 0.7 * share(m, 'A2', 'V2v5') for m in MET), '; '.join('%s %.1f vs %.1f %%' % (m, 100 * share(m, 'WAZ', 'V2v5'), 100 * share(m, 'A2', 'V2v5')) for m in MET))
v('Q2', 'A2+V2v5 delayed <= 0.6 x A2+V2', all(share(m, 'A2', 'V2v5') <= 0.6 * share(m, 'A2', 'V2') for m in MET), '; '.join('%s %.1f vs %.1f %%' % (m, 100 * share(m, 'A2', 'V2v5'), 100 * share(m, 'A2', 'V2')) for m in MET))
v('Q3', 'WAZ+V2v5 Amazon delayed <= 0.5 x A2+V2 Amazon delayed', all(share(m, 'WAZ', 'V2v5', 'amazon') <= 0.5 * share(m, 'A2', 'V2', 'amazon') for m in MET), '; '.join('%s %.1f vs %.1f %%' % (m, 100 * share(m, 'WAZ', 'V2v5', 'amazon'), 100 * share(m, 'A2', 'V2', 'amazon')) for m in MET))
v('Q4', 'flown wide WAZ+V2v5 <= A2+V2', all(tot(m, 'WAZ', 'V2v5', 'wide') <= tot(m, 'A2', 'V2', 'wide') for m in MET), '; '.join('%s %d vs %d' % (m, tot(m, 'WAZ', 'V2v5', 'wide'), tot(m, 'A2', 'V2', 'wide')) for m in MET))
v('Q5', 'flown wide WAZ+V2v5 <= 0.15 x WAZ+NONE', all(tot(m, 'WAZ', 'V2v5', 'wide') <= 0.15 * tot(m, 'WAZ', 'NONE', 'wide') for m in MET), '; '.join('%s %d vs %d' % (m, tot(m, 'WAZ', 'V2v5', 'wide'), tot(m, 'WAZ', 'NONE', 'wide')) for m in MET))
v('Q6', 'WAZ+V2v5 cancelled <= 0.5 %', all(share(m, 'WAZ', 'V2v5', key='cancelled') <= 0.005 for m in MET), '; '.join('%s %.2f %%' % (m, 100 * share(m, 'WAZ', 'V2v5', key='cancelled')) for m in MET))
print('\n%d of %d predictions passed' % (sum(V), len(V)))
