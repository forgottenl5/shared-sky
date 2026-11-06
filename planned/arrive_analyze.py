"""Analysis for ARRIVE_PREREG.md; committed before runs."""
import glob, json
R = [json.loads(l) for f in glob.glob('out/arrive/runs_*.jsonl') for l in open(f) if l.strip()]
PR = ['none', 'D20', 'A20', 'D20A20', 'M20', 'M10']
def g(op, m, s, p, k): rows = [r for r in R if (r['op'], r['mult'], r['spread'], r['proc']) == (op, m, s, p)]; return sum(r[k] for r in rows), rows
def mean(op, m, s, p, k): _, rows = g(op, m, s, p, k); return sum(r[k] for r in rows) / max(1, len(rows))
print('| Site | traffic | pads | ' + ' | '.join(PR) + ' |\n|---|---|---|' + '---|' * len(PR))
for op in ['amazon', 'wing', 'zipline']:
    for m in [1, 2]:
        for s in [30, 120]:
            print(f"| {op} | {m}x | {s} m | " + ' | '.join(f"{g(op,m,s,p,'near300')[0]} (w {mean(op,m,s,p,'depWait'):.0f}/{mean(op,m,s,p,'arrHold'):.0f} s)" for p in PR) + ' |')
print('(near-site same-company wide meetings within 300 m, 3 seeds x 2 h; in brackets mean departure wait / arrival hold)')
cut = lambda op, m, s, p: 1 - g(op, m, s, p, 'near300')[0] / max(1, g(op, m, s, 'none', 'near300')[0])
P = []
c1 = {op: cut(op, 1, 30, 'M20') for op in ['amazon', 'wing', 'zipline']}; P.append(('P1 shared 20 s slot cuts >= 80 % at 1x, 30 m pads, each site', ', '.join(f'{k} {100*v:.0f} %' for k, v in c1.items()), all(v >= 0.8 for v in c1.values())))
c2 = {op: (cut(op, 1, 30, 'D20A20'), cut(op, 1, 30, 'M20')) for op in ['amazon', 'wing', 'zipline']}; P.append(('P2 separate 20 s slots cut less than one shared 20 s slot, each site', ', '.join(f'{k} {100*a:.0f} vs {100*b:.0f} %' for k, (a, b) in c2.items()), all(a < b for a, b in c2.values())))
w = max(mean('amazon', 2, 30, 'M20', 'depWait'), mean('amazon', 2, 30, 'M20', 'arrHold')); P.append(('P3 Amazon 2x with a shared 20 s slot (cap 180 movements/h for ~242) has mean wait or hold > 600 s', f'{w:.0f} s', w > 600))
c4 = {op: (1 - g(op, 2, 120, 'M10', 'near300')[0] / max(1, g(op, 2, 30, 'none', 'near300')[0]), max(mean(op, 2, 120, 'M10', 'depWait'), mean(op, 2, 120, 'M10', 'arrHold'))) for op in ['amazon', 'wing', 'zipline']}
P.append(('P4 120 m pads + shared 10 s slot at 2x: >= 90 % cut vs 30 m none, mean wait/hold <= 60 s, each site', ', '.join(f'{k} {100*a:.0f} % / {b:.0f} s' for k, (a, b) in c4.items()), all(a >= 0.9 and b <= 60 for a, b in c4.values())))
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in P: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print('throughput (landed by 30 min after window / requested):', {f'{op} {m}x {p}': round(g(op, m, 30, p, 'landedBy30minAfter')[0] / max(1, g(op, m, 30, p, 'requested')[0]), 2) for op in ['amazon'] for m in [1, 2] for p in PR})
print(f'Runs read: {len(R)} (expected 216).')
