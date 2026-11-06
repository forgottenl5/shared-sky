#!/usr/bin/env python3
"""LAYER1 analysis (planned/LAYER1_PREREG.md). Reads out/layer1/*.jsonl; pooled over seeds 1-3; prints tables and P1-P7."""
import json, glob, collections, sys
R = collections.defaultdict(list)
for f in glob.glob('out/layer1/*.jsonl'):
    for l in open(f):
        if l.strip(): r = json.loads(l); R[(r['metro'], r['arm'])].append(r)
ARMS = ['A2', 'A2u', 'WAZ', 'AWZ']; MET = ['houston', 'dfw']
if len(R) != 8 or any(len(v) != 3 for v in R.values()): print('INCOMPLETE', {k: len(v) for k, v in R.items()}); sys.exit(1)
def tot(m, a, k): return sum(r[k] for r in R[(m, a)])
def pr(m, a, p): return sum(r['pair'].get(p, 0) for r in R[(m, a)])
def share(m, a, op='all', key='delayed'): n = sum(r['cost'].get(op, {}).get('n', 0) for r in R[(m, a)]); return sum(r['cost'].get(op, {}).get(key, 0) for r in R[(m, a)]) / n if n else 0
def meanD(m, a): d = sum(r['cost']['all']['delayed'] for r in R[(m, a)]); return sum(r['cost']['all']['sumD'] for r in R[(m, a)]) / d if d else 0
for m in MET:
    print('\n## %s (pooled seeds 1-3, 2 measured hours each)\n| arm | wide | close | Amazon-Zipline | Amazon-Wing | Wing-Zipline | cruise+cruise | delayed | cancelled | mean delay s | Amazon delayed | Wing delayed | Zipline delayed |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|' % m)
    for a in ARMS:
        cc = sum(r['phase'].get('cruise+cruise', 0) for r in R[(m, a)])
        print('| %s | %d | %d | %d | %d | %d | %d | %.1f %% | %.2f %% | %.0f | %.1f %% | %.1f %% | %.1f %% |' % (a, tot(m, a, 'wide'), tot(m, a, 'close'), pr(m, a, 'amazon-zipline'), pr(m, a, 'amazon-wing'), pr(m, a, 'wing-zipline'), cc,
              100 * share(m, a), 100 * share(m, a, key='cancelled'), meanD(m, a), 100 * share(m, a, 'amazon'), 100 * share(m, a, 'wing'), 100 * share(m, a, 'zipline')))
    ph = collections.Counter()
    for a in ARMS:
        ph = collections.Counter();
        for r in R[(m, a)]: ph.update(r['phase'])
        print('- %s phases: %s' % (a, ', '.join('%s %d' % kv for kv in ph.most_common())))
V = []
def v(n, t, ok, d): V.append(ok); print('%s %s: %s -- %s' % ('PASS' if ok else 'FAIL', n, t, d))
print()
d = ['%s %.2f' % (m, tot(m, 'WAZ', 'wide') / tot(m, 'A2', 'wide')) for m in MET]; v('P1', 'WAZ wide <= 0.75 x A2', all(tot(m, 'WAZ', 'wide') <= 0.75 * tot(m, 'A2', 'wide') for m in MET), '; '.join(d))
d = ['%s %.2f' % (m, tot(m, 'A2u', 'wide') / tot(m, 'A2', 'wide')) for m in MET]; v('P2', 'A2u within +-20 % of A2', all(abs(tot(m, 'A2u', 'wide') / tot(m, 'A2', 'wide') - 1) <= 0.2 for m in MET), '; '.join(d))
d = ['%s %d vs %d' % (m, pr(m, 'WAZ', 'amazon-zipline'), pr(m, 'A2', 'amazon-zipline')) for m in MET]; v('P3', 'WAZ Amazon-Zipline <= 0.5 x A2', all(pr(m, 'WAZ', 'amazon-zipline') <= 0.5 * pr(m, 'A2', 'amazon-zipline') for m in MET), '; '.join(d))
d = ['%s %d vs %d' % (m, pr(m, 'WAZ', 'wing-zipline'), pr(m, 'A2', 'wing-zipline')) for m in MET]; v('P4', 'WAZ Wing-Zipline within +-25 % of A2', all(pr(m, 'A2', 'wing-zipline') > 0 and abs(pr(m, 'WAZ', 'wing-zipline') / pr(m, 'A2', 'wing-zipline') - 1) <= 0.25 for m in MET), '; '.join(d))
d = ['%s all %.1f vs %.1f %%, Amazon %.1f vs %.1f %%' % (m, 100 * share(m, 'WAZ'), 100 * share(m, 'A2'), 100 * share(m, 'WAZ', 'amazon'), 100 * share(m, 'A2', 'amazon')) for m in MET]
v('P5', 'WAZ delayed share and Amazon delayed share <= 0.8 x A2', all(share(m, 'WAZ') <= 0.8 * share(m, 'A2') and share(m, 'WAZ', 'amazon') <= 0.8 * share(m, 'A2', 'amazon') for m in MET), '; '.join(d))
d = ['%s AWZ %d vs WAZ %d' % (m, tot(m, 'AWZ', 'wide'), tot(m, 'WAZ', 'wide')) for m in MET]; v('P6', 'AWZ wide > WAZ', all(tot(m, 'AWZ', 'wide') > tot(m, 'WAZ', 'wide') for m in MET), '; '.join(d))
ok = True; d = []
for m in MET:
    a1 = min(ARMS, key=lambda a: tot(m, a, 'wide')); a2 = min(ARMS, key=lambda a: share(m, a)); ok &= a1 == a2; d.append('%s fewest conflicts %s, lowest delay %s' % (m, a1, a2))
v('P7', 'fewest conflicts = lowest delayed share', ok, '; '.join(d))
print('\n%d of %d predictions passed' % (sum(V), len(V)))
