#!/usr/bin/env python3
"""VERTIPORT1 analysis (planned/VERTIPORT1_PREREG.md). Reads out/vertiport1.jsonl; prints the comparison and V1-V5 verdicts."""
import json
R = [json.loads(l) for l in open('out/vertiport1.jsonl') if l.strip()]
F14 = [33, 58, 83, 90, 98, 98, 98, 98]; F15 = [23, 48, 63, 78, 83, 88, 93, 100]
TT = [30, 60, 90, 120, 180, 240, 300, 450, 600]
F17 = {1: [15, 12, 10, 9, 7, 5, 5, 3, 3], 2: [20, 20, 19, 16, 13, 10, 10, 6, 6], 4: [20, 20, 20, 20, 19, 18, 16, 12, 10], 6: [20, 20, 20, 20, 20, 20, 18, 15, 12], 8: [20, 20, 20, 20, 20, 20, 20, 17, 14]}
def get(fig, G, T=300): return next(r for r in R if r['fig'] == fig and r['G'] == G and r['turn'] == T)
V = []
def verdict(n, t, ok, d): V.append(ok); print('%s %s: %s -- %s' % ('PASS' if ok else 'FAIL', n, t, d))
for fig, ref, name in [('fig14', F14, 'Fig. 14 (75 s pad)'), ('fig15', F15, 'Fig. 15 (45 s pad)')]:
    print('\n## %s: TLOF pad utilization, engine vs Vascik & Hansman\n| stands | engine | Vascik | difference | engine ops / 15 min |\n|---|---|---|---|---|' % name)
    for G in range(1, 9):
        r = get(fig, G); print('| %d | %.0f %% | %d %% | %+.0f | %d |' % (G, 100 * r['use'], ref[G - 1], 100 * r['use'] - ref[G - 1], r['ops']))
print('\n## Fig. 17 sweep (45 s pad): engine ops vs digitised values')
print('| stands | ' + ' | '.join('%d s' % t for t in TT) + ' |\n|---|' + '---|' * len(TT))
n17 = h17 = 0
for G, ref in F17.items():
    cells = []
    for T, v in zip(TT, ref):
        e = get('fig17', G, T)['ops']; n17 += 1; h17 += abs(e - v) <= 2; cells.append('%d (%d)' % (e, v))
    print('| %d | ' % G + ' | '.join(cells) + ' |')
print('(engine (Vascik))\n')
for fig, ref, n in [('fig14', F14, 'V1'), ('fig15', F15, 'V2')]:
    d = [100 * get(fig, G)['use'] - ref[G - 1] for G in range(1, 9)]; k = sum(abs(x) <= 10 for x in d)
    verdict(n, '%s within 10 points in >= 7 of 8' % fig, k >= 7, '%d of 8; differences %s' % (k, ', '.join('%+.0f' % x for x in d)))
def first95(fig): return next((G for G in range(1, 9) if get(fig, G)['use'] >= 0.95), None)
a, b = first95('fig14'), first95('fig15')
verdict('V3', 'first stand count with >= 95 %% use is 5+-1 (fig14) and 8+-1 (fig15)', a is not None and b is not None and abs(a - 5) <= 1 and abs(b - 8) <= 1, 'fig14 %s, fig15 %s' % (a, b))
verdict('V4', 'Fig. 17 within 2 ops in >= 80 % of 45 points', h17 >= 0.8 * n17, '%d of %d' % (h17, n17))
mx = max(100 * get(f, G)['use'] - ref[G - 1] for f, ref in [('fig14', F14), ('fig15', F15)] for G in range(1, 9))
verdict('V5', 'engine never above Vascik by more than 5 points', mx <= 5, 'largest excess %+.0f' % mx)
print('\n%d of %d predictions passed' % (sum(V), len(V)))
