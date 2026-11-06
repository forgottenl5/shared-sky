"""PROC_PREREG.md analysis. B2, B3 scored; B1, B4, B5 NOT SCORED (K2 failed, see deviation log) and shown as indicative."""
import json, glob, os
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'out', 'proc')
R = {}
for f in glob.glob(os.path.join(OUT, '*.json')):
    r = json.load(open(f)); R[(r['arm'], r['d'], r['seed'])] = r
def pool(arm, d, k): return sum(R[(arm, d, s)].get(k, 0) for s in (1, 2, 3) if (arm, d, s) in R)
def have(arm, d): return all((arm, d, s) in R for s in (1, 2, 3))
lines = ['## Cross-operator planned meetings (pooled over seeds 1-3, central 144 km^2, 2 h)', '', '| d | Arm | wide | change vs P0 | close | change vs P0 | same-operator wide |', '|---|---|---|---|---|---|---|']
for d in (4, 3, 2):
    for a in ('P0', 'P1', 'P2', 'P3'):
        if not have(a, d): continue
        w, c, w0, c0 = pool(a, d, 'wide|cross'), pool(a, d, 'close|cross'), pool('P0', d, 'wide|cross'), pool('P0', d, 'close|cross')
        lines.append(f"| {d} km | {a}{' (indicative)' if a in ('P1','P3') else ''} | {w} | {'' if a=='P0' else f'{(w/w0-1)*100:+.0f} %' if w0 else 'n/a'} | {c} | {'' if a=='P0' else f'{(c/c0-1)*100:+.0f} %' if c0 else 'n/a'} | {pool(a, d, 'wide|same')} |")
lines += ['', '## Intent check costs (P2, P3)', '', '| d | Arm | flights checked | delayed | share delayed | mean delay of delayed (s) | p95 (s) | cancelled | delayed share wing / amazon / zipline |', '|---|---|---|---|---|---|---|---|---|']
for d in (4, 3, 2):
    for a in ('P2', 'P3'):
        if not have(a, d): continue
        I = [R[(a, d, s)]['intent'] for s in (1, 2, 3)]; ch = sum(i['checked'] for i in I); dl = sum(i['delayed'] for i in I)
        mean = sum(i['delay_mean_s'] * i['delayed'] for i in I) / dl if dl else 0; p95 = max(i['delay_p95_s'] for i in I)
        byop = ' / '.join(f"{sum(i['delayed_share_by_op'].get(o, 0) for i in I) / 3 * 100:.1f} %" for o in ('wing', 'amazon', 'zipline'))
        lines.append(f"| {d} km | {a} | {ch} | {dl} | {dl/ch*100:.1f} % | {mean:.0f} | {p95} (max over seeds) | {sum(i['cancelled'] for i in I)} | {byop} |")
lines += ['', '## Keep-out costs (P1, P3; indicative, K2 failed)', '', '| d | Arm | extra cruise pooled | wing | amazon | zipline | depth-cap hits |', '|---|---|---|---|---|---|---|']
for d in (4, 3, 2):
    for a in ('P1', 'P3'):
        if not have(a, d): continue
        X = [R[(a, d, s)] for s in (1, 2, 3)]; m = lambda k: sum(x['extra_cruise'].get(k, 0) for x in X) / 3 * 100
        lines.append(f"| {d} km | {a} | {sum(x['extra_cruise_pooled'] for x in X)/3*100:.1f} % | {m('wing'):.1f} % | {m('amazon'):.1f} % | {m('zipline'):.1f} % | {sum(x['depth_hits'] for x in X)} |")
lines += ['', '## Ground exposure: distinct flights per day over 100 m cells > 300 m from any site (mean over seeds)', '', '| d | Arm | median | p99 | max |', '|---|---|---|---|---|']
for d in (4, 3, 2):
    for a in ('P0', 'P1', 'P2', 'P3'):
        if not have(a, d): continue
        E = [R[(a, d, s)]['exposure'] for s in (1, 2, 3)]; lines.append(f"| {d} km | {a} | {sum(e['median'] for e in E)/3:.0f} | {sum(e['p99'] for e in E)/3:.0f} | {sum(e['max'] for e in E)/3:.0f} |")
# scoring
sc = ['', '## Predictions', '', '| Prediction | Result | Verdict |', '|---|---|---|']
P2 = 'P2'
def cut(a, d): w0 = pool('P0', d, 'wide|cross'); return 1 - pool(a, d, 'wide|cross') / w0 if w0 else None
if all(have(a, d) for a in ('P0', 'P1') for d in (4, 3)): sc.append(f"| B1 P1 cuts >= 40 % at d 4 and 3 | {cut('P1',4)*100:.0f} % / {cut('P1',3)*100:.0f} % | NOT SCORED (K2 failed); indicative {'meets' if min(cut('P1',4),cut('P1',3))>=0.4 else 'misses'} |")
if all(have(a, d) for a in ('P0', 'P2') for d in (4, 3, 2)): sc.append(f"| B2 P2 cuts >= 90 % at every density | {' / '.join(f'{cut(P2,d)*100:.0f} %' for d in (4,3,2))} (d 4/3/2) | **{'PASS' if min(cut('P2',d) for d in (4,3,2))>=0.9 else 'FAIL'}** |")
if have('P2', 4) and have('P2', 2):
    sh = lambda d: sum(R[('P2', d, s)]['intent']['delayed'] for s in (1, 2, 3)) / sum(R[('P2', d, s)]['intent']['checked'] for s in (1, 2, 3))
    sc.append(f"| B3 P2 delayed <= 5 % at d 4 and <= 15 % at d 2 | {sh(4)*100:.1f} % / {sh(2)*100:.1f} % | **{'PASS' if sh(4)<=0.05 and sh(2)<=0.15 else 'FAIL'}** |")
if have('P1', 3): x = sum(R[('P1', 3, s)]['extra_cruise_pooled'] for s in (1, 2, 3)) / 3; sc.append(f"| B4 P1 extra cruise <= 5 % at d 3 | {x*100:.1f} % | NOT SCORED (K2 failed); indicative {'meets' if x<=0.05 else 'misses'} |")
if have('P0', 3) and have('P1', 3):
    p = lambda a: sum(R[(a, 3, s)]['exposure']['p99'] for s in (1, 2, 3)) / 3; sc.append(f"| B5 P1 raises p99 exposure >= 20 % at d 3 | {(p('P1')/p('P0')-1)*100:+.0f} % | NOT SCORED (K2 failed); indicative {'meets' if p('P1')/p('P0')>=1.2 else 'misses'} |")
txt = '\n'.join(sc + [''] + lines); print(txt); open(os.path.join(HERE, 'proc_results_table.md'), 'w').write(txt + '\n')
