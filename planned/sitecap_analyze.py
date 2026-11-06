"""Analysis for SITECAP_PREREG.md; committed before runs."""
import glob, json, math
R = [json.loads(l) for f in glob.glob('out/sitecap/runs_*.jsonl') for l in open(f) if l.strip()]
def g(op, m, s, D, k='near_wide'): rows = [r for r in R if (r['op'], r['mult'], r['spread'], r['D']) == (op, m, s, D)]; return sum(r[k] for r in rows), rows
def wait(op, m, s, D): _, rows = g(op, m, s, D); return sum(r['meanWait'] for r in rows) / max(1, len(rows))
print('| Site | rate x | pads | D 0 s | D 10 s | D 20 s | D 40 s | mean wait at D 10 / 20 / 40 s |\n|---|---|---|---|---|---|---|---|')
for op in ['amazon', 'wing', 'zipline']:
    for m in [1, 2, 4]:
        for s in [30, 120]:
            c = [g(op, m, s, D)[0] for D in [0, 10, 20, 40]]
            print(f"| {op} | {m} | {s} m | " + ' | '.join(str(x) for x in c) + f" | {wait(op,m,s,10):.0f} / {wait(op,m,s,20):.0f} / {wait(op,m,s,40):.0f} s |")
print('(near-site same-company wide meetings, 3 seeds x 2 h, within 300 m of the site)')
res = []
s1 = True; txt = []
for op in ['amazon', 'wing', 'zipline']:
    pts = [(m, g(op, m, 30, 0)[0]) for m in [1, 2, 4]]; pts = [p for p in pts if p[1] > 0]
    if len(pts) >= 2:
        xs = [math.log(p[0]) for p in pts]; ys = [math.log(p[1]) for p in pts]; mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
        sl = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
    else: sl = float('nan')
    txt.append(f'{op} {sl:.2f}'); s1 = s1 and (1.5 <= sl <= 2.5)
res.append(('S1 slope in rate 1.5–2.5 (each site, D 0, 30 m pads)', ', '.join(txt), s1))
s2 = True; txt = []
for op in ['amazon', 'wing', 'zipline']:
    a, b = g(op, 4, 30, 0)[0], g(op, 4, 120, 0)[0]; c = 1 - b / a if a else float('nan'); txt.append(f'{op} {100*c:.0f} %'); s2 = s2 and c >= 0.5
res.append(('S2 120 m pads cut >= 50 % at x4', ', '.join(txt), s2))
w20, w10 = wait('amazon', 4, 30, 20), wait('amazon', 4, 30, 10)
res.append(('S3 Amazon x4: D 20 s mean wait > 600 s and D 10 s <= 60 s', f'{w20:.0f} s / {w10:.0f} s', w20 > 600 and w10 <= 60))
txt = []; any80 = False
for op in ['amazon', 'wing', 'zipline']:
    a = g(op, 2, 30, 0)[0]; best = max((1 - g(op, 2, 30, D)[0] / a) if a else float('nan') for D in [10, 20, 40]); txt.append(f'{op} {100*best:.0f} %'); any80 = any80 or best >= 0.8
res.append(('S4 no site reaches an 80 % cut by departure spacing alone at x2', ', '.join(txt), not any80))
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in res: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print(f'Runs read: {len(R)} (expected 216).')
