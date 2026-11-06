"""Analysis for AIRTAXI1_PREREG.md; committed before runs."""
import glob, json, random, sys
R = [json.loads(l) for f in glob.glob('out/airtaxi1/runs_*.jsonl') for l in open(f) if l.strip()]
if not R: sys.exit('No runs in out/airtaxi1/: run `node planned/airtaxi1_run.js <shard> <n>` first.')
random.seed(777); B = 5000
ST = {'houston': ['today', 'early', 'mid', 'full'], 'dfw': ['early', 'mid', 'full']}
SITES = {'houston': ['38TE'], 'dfw': ['TOY', '49T', 'AFW']}
def cell(m, st, site, prof, arm):
    out = []
    for r in R:
        if r['metro'] == m and r['stage'] == st:
            for x in r['res']:
                if x['site'] == site and x['profile'] == prof and x['arm'] == arm: out.append((r['seed'], x))
    return [x for _, x in sorted(out, key=lambda t: t[0])]
def per_move(xs, k):
    n = sum(x[k]['n'] for x in xs); mv = sum(x['movements'] for x in xs)
    if not mv: return float('nan'), float('nan'), float('nan')
    bs = []
    for _ in range(B):
        s = [random.choice(xs) for _ in xs]; d = sum(x['movements'] for x in s)
        if d: bs.append(sum(x[k]['n'] for x in s) / d)
    bs.sort(); return n / mv, bs[int(.025 * len(bs))], bs[int(.975 * len(bs))]
def share_any(xs, k): mv = sum(x['movements'] for x in xs); return sum(x[k]['withAny'] for x in xs) / mv if mv else float('nan')
V = {}
for m in ['houston', 'dfw']:
    for site in SITES[m]:
        note = ' (airport: drones already restricted there in reality; upper bound)' if site == 'AFW' else ''
        print(f"\n## {m.upper()} {site}{note}: encounters per air-taxi movement (8:1 profile; mean, 95 % seed bootstrap; share of movements with any)")
        print('| Stage | Drones as planned: well clear | NMAC | No drones within 1 km: well clear / NMAC | within 2 km | Drones yield (RES): well clear / NMAC | 6:1 profile: well clear / NMAC |\n|---|---|---|---|---|---|---|')
        for st in ST[m]:
            c = {a: cell(m, st, site, 8, a) for a in ['none', 'X1', 'X2', 'RES']}; c6 = cell(m, st, site, 6, 'none')
            if not c['none']: continue
            w = per_move(c['none'], 'wellclear'); n_ = per_move(c['none'], 'nmac'); V[m, site, st, 'none'] = (w, n_)
            for a in ['X1', 'X2', 'RES']: V[m, site, st, a] = (per_move(c[a], 'wellclear'), per_move(c[a], 'nmac'))
            V[m, site, st, 'S6'] = (per_move(c6, 'wellclear'), per_move(c6, 'nmac'))
            f = lambda t: f"{t[0]:.3f} [{t[1]:.3f}-{t[2]:.3f}]"
            g = lambda a: f"{V[m,site,st,a][0][0]:.3f} / {V[m,site,st,a][1][0]:.3f}"
            print(f"| {st} | {f(w)} ({100*share_any(c['none'],'wellclear'):.0f} %) | {f(n_)} ({100*share_any(c['none'],'nmac'):.1f} %) | {g('X1')} | {g('X2')} | {g('RES')} | {g('S6')} |")
        print('\nCosts to drones (per simulated hour over the whole metro run; RES per air-taxi movement):')
        for st in ST[m]:
            c = {a: cell(m, st, site, 8, a) for a in ['X1', 'X2', 'RES']}
            if not c['X1']: continue
            k = len(c['X1']); x1 = (sum(x['dropped'] for x in c['X1']) / 3 / k, sum(x['detoured'] for x in c['X1']) / 3 / k, sum(x['extraSeconds'] for x in c['X1']) / max(1, sum(x['detoured'] for x in c['X1'])))
            x2 = (sum(x['dropped'] for x in c['X2']) / 3 / k, sum(x['detoured'] for x in c['X2']) / 3 / k, sum(x['extraSeconds'] for x in c['X2']) / max(1, sum(x['detoured'] for x in c['X2'])))
            tx = sum(x['taxis'] for x in c['RES']); dl = sum(x['delayed'] + x['cancelled'] for x in c['RES']); cn = sum(x['cancelled'] for x in c['RES'])
            md = sum(x['meanDelay'] * x['delayed'] for x in c['RES']) / max(1, sum(x['delayed'] for x in c['RES']))
            V[m, site, st, 'cost'] = dict(res_per_move=dl / tx if tx else float('nan'), cancelled=cn)
            print(f"- {st}: 1 km circle: {x1[0]:.1f} drone flights dropped and {x1[1]:.1f} detoured an hour (+{x1[2]:.0f} s each); 2 km: {x2[0]:.1f} dropped, {x2[1]:.1f} detoured (+{x2[2]:.0f} s); yielding: {dl/tx:.2f} drone flights delayed or cancelled per air-taxi movement (mean wait {md:.0f} s; {cn} cancelled)")
# encounters by distance from pad and by company, TOY full
c = cell('dfw', 'full', 'TOY', 8, 'none')
for k in ['nmac', 'wellclear']:
    d = sorted(v for x in c for v in x[k]['dPad'] if v is not None); ops = {}
    for x in c:
        for o, v in x[k]['byOp'].items(): ops[o] = ops.get(o, 0) + v
    q = (lambda p: d[int(p * (len(d) - 1))]) if d else (lambda p: float('nan'))
    print(f"\nTOY full, {k}: {len(d)} encounters; distance from pad median {q(.5)} m (10-90 %: {q(.1)}-{q(.9)} m); by company {ops}")
sens = []
for k8 in ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']:
    xs = cell('dfw', 'full', 'TOY+500m_' + k8, 8, 'none'); sens.append(per_move(xs, 'wellclear')[0])
print(f"TOY position sensitivity (8 points 500 m away, full, well clear per movement): {min(sens):.3f}-{max(sens):.3f} (centre {V['dfw','TOY','full','none'][0][0]:.3f})")
t = V['dfw', 'TOY', 'full', 'none']; h0 = V['houston', '38TE', 'today', 'none']; hf = V['houston', '38TE', 'full', 'none']
pool = lambda a, k: (sum(x[k]['n'] for x in cell('dfw', 'full', 'TOY', 8, a)))
n0 = pool('none', 'nmac'); w0 = pool('none', 'wellclear')
P = [('P1 TOY full: well clear 0.1-3, NMAC 0.005-0.3 per movement', f"{t[0][0]:.3f}, {t[1][0]:.4f}", 0.1 <= t[0][0] <= 3 and 0.005 <= t[1][0] <= 0.3),
     ('P2 38TE today: NMAC <= 0.02, well clear <= 0.2', f"{h0[1][0]:.4f}, {h0[0][0]:.3f}", h0[1][0] <= 0.02 and h0[0][0] <= 0.2),
     ('P3 38TE full well clear >= 5x today', f"{hf[0][0]:.3f} vs {h0[0][0]:.3f}", hf[0][0] >= 5 * h0[0][0] and h0[0][0] >= 0),
     ('P4 TOY full: 1 km removes >= 70 % NMAC, 2 km >= 95 %', f"1 km {100*(1-pool('X1','nmac')/n0) if n0 else float('nan'):.0f} %, 2 km {100*(1-pool('X2','nmac')/n0) if n0 else float('nan'):.0f} % (of {n0})", n0 > 0 and 1 - pool('X1', 'nmac') / n0 >= 0.70 and 1 - pool('X2', 'nmac') / n0 >= 0.95),
     ('P5 TOY full: yielding removes >= 95 % NMAC and well clear, <= 2 drone flights per movement', f"NMAC {100*(1-pool('RES','nmac')/n0) if n0 else float('nan'):.0f} %, well clear {100*(1-pool('RES','wellclear')/w0) if w0 else float('nan'):.0f} %, {V['dfw','TOY','full','cost']['res_per_move']:.2f} per movement", n0 > 0 and w0 > 0 and 1 - pool('RES', 'nmac') / n0 >= 0.95 and 1 - pool('RES', 'wellclear') / w0 >= 0.95 and V['dfw', 'TOY', 'full', 'cost']['res_per_move'] <= 2),
     ('P6 TOY full: 6:1 >= 15 % fewer well clear than 8:1', f"{V['dfw','TOY','full','S6'][0][0]:.3f} vs {t[0][0]:.3f}", V['dfw', 'TOY', 'full', 'S6'][0][0] <= 0.85 * t[0][0])]
print('\n| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in P: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print(f"\nRuns read: {len(R)} (expected 70).")
