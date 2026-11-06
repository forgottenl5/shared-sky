# HOUSTON2_PREREG.md analysis (written before the study ran)
import json, glob, os, math
B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'houston2'); DS = [9, 6, 4, 3, 2]; AREA = 144.0
mean = lambda x: sum(x) / len(x)
R = {}
for d in DS:
    rs = [json.load(open(f)) for f in sorted(glob.glob(f'{B}/d{d}_[0-9]*.json'))]
    if not rs: continue
    h = sum(r['hours'] for r in rs); t = lambda k: sum(r.get(k, 0) for r in rs)
    fl = sum(sum(r['flights_touching_zone'].values()) for r in rs)
    R[d] = dict(n=len(rs), sites=rs[0]['sites'], cw=t('wide|cross') / h, cc=t('close|cross') / h, sw=t('wide|same') / h, wz=t('wide|pair|wing-zipline') / h, aw=t('wide|pair|amazon-wing') / h, az=t('wide|pair|amazon-zipline') / h,
                withA=t('wide|cross|withAmazon') / t('wide|cross') if t('wide|cross') else float('nan'), per1000=1000 * t('wide|cross') / fl if fl else 0, flh=fl / h,
                omed=mean([r['over_median'] for r in rs]), omax=mean([r['over_max'] for r in rs]), raw=t('wide|cross'))
print('| Wing nest spacing | Sites in 44 x 44 km (W/Z/A) | Flights touching zone per h | Cross-op wide / h | Cross-op close / h | per 1,000 flights | Same-op wide / h | Wing-Zipline | Amazon-Wing | Amazon-Zipline | Amazon share | Overflights / km2 / day median (max) |'); print('|' + '---|' * 12)
for d in DS:
    w = R.get(d)
    if w: s = w['sites']; print(f"| {d} km | {s['wing']}/{s['zipline']}/{s['amazon']} | {w['flh']:.0f} | {w['cw']:.2f} | {w['cc']:.2f} | {w['per1000']:.3f} | {w['sw']:.0f} | {w['wz']:.2f} | {w['aw']:.2f} | {w['az']:.2f} | {100*w['withA']:.0f} % | {w['omed']:.0f} ({w['omax']:.0f}) |")
V = []
if all(d in R and R[d]['n'] == 3 for d in DS):
    xs = [math.log(1 / d ** 2) for d in DS]; ys = [math.log(R[d]['cw']) if R[d]['cw'] > 0 else None for d in DS]
    pts = [(x, y) for x, y in zip(xs, ys) if y is not None]
    if len(pts) >= 3:
        mx = mean([p[0] for p in pts]); my = mean([p[1] for p in pts]); sl = sum((x - mx) * (y - my) for x, y in pts) / sum((x - mx) ** 2 for x, _ in pts)
        V.append(('Q1 log-log slope of cross-operator wide meetings vs site density in [1.6, 2.4]', f'{sl:.2f} (levels with > 0: {len(pts)} of 5)', 1.6 <= sl <= 2.4))
    else: V.append(('Q1', 'not evaluable', None))
    V.append(('Q2 at d = 2 km > 10 cross-operator wide meetings per hour in the central zone', f"{R[2]['cw']:.1f}", R[2]['cw'] > 10))
    a9, a2 = R[9]['withA'], R[2]['withA']
    V.append(('Q3 Amazon share > 50 % at d = 9 km and < 50 % at d = 2 km', f'{100*a9:.0f} % -> {100*a2:.0f} % (d = 9 km: {R[9]["raw"]} events)', (a9 > 0.5) and (a2 < 0.5)))
print('\n| Prediction | Value | Verdict |\n|---|---|---|')
for a, b, c in V: print(f"| {a} | {b} | {'PASS' if c else ('not evaluable' if c is None else 'FAIL')} |")
