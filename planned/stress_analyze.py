"""STRESS_PREREG.md analysis (committed before any study run). Pooled over seeds 16-18."""
import json, os, glob
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'stress'); S = (16, 17, 18); R = {}
for f in glob.glob(os.path.join(OUT, '*.json')):
    r = json.load(open(f)); R[(r['arm'], r['d'], r['seed'])] = r
have = lambda a, d: all((a, d, s) in R for s in S)
def b(a, d, k, f): return sum(R[(a, d, s)]['bins'].get(k, {}).get(f, 0) for s in S)
share = lambda a, d, k: b(a, d, k, 'delayed') / b(a, d, k, 'n') if b(a, d, k, 'n') else float('nan')
def mdel(a, d, k): n = b(a, d, k, 'delayed'); return b(a, d, k, 'total_s') / n if n else 0
ARMS = ('S0', 'TFR', 'SURGE', 'BOTH')
L = ['| d | Arm | before: delayed share | window: flights / delayed share / mean delay of delayed (s) / total delay (h) | after: flights / delayed share | cancelled | rerouted / held | extra cruise on rerouted |', '|---|---|---|---|---|---|---|---|']
for d in (4, 3):
    for a in ARMS:
        if not have(a, d): continue
        rr = sum(R[(a, d, s)]['rerouted'] for s in S); hd = sum(R[(a, d, s)]['held'] for s in S); em = sum(R[(a, d, s)]['extra_m'] for s in S); bm = sum(R[(a, d, s)]['base_m'] for s in S)
        L.append(f"| {d} km | {a} | {share(a, d, 'before')*100:.1f} % | {b(a, d, 'window', 'n')} / {share(a, d, 'window')*100:.1f} % / {mdel(a, d, 'window'):.0f} / {b(a, d, 'window', 'total_s')/3600:.1f} | {b(a, d, 'after', 'n')} / {share(a, d, 'after')*100:.1f} % | {sum(b(a, d, k, 'cancelled') for k in ('before','window','after'))} | {rr} / {hd} | {(em/bm*100 if bm else 0):.1f} % |")
Sc = ['| Prediction | Result | Verdict |', '|---|---|---|']
if all(have(a, d) for a in ARMS for d in (4, 3)):
    r1 = [share('SURGE', d, 'window') / share('S0', d, 'window') for d in (4, 3)]; r2 = [share('SURGE', d, 'after') / share('S0', d, 'after') for d in (4, 3)]
    Sc.append(f"| R1 SURGE window delayed share >= 2x S0 (d 4, 3) | {r1[0]:.2f} / {r1[1]:.2f} | **{'PASS' if min(r1) >= 2 else 'FAIL'}** |")
    Sc.append(f"| R2 SURGE after-window delayed share <= 1.5x S0 (d 4, 3) | {r2[0]:.2f} / {r2[1]:.2f} | **{'PASS' if max(r2) <= 1.5 else 'FAIL'}** |")
    rr, oo = share('TFR', 3, 'window|rerouted'), share('TFR', 3, 'window|other')
    Sc.append(f"| R3 TFR d 3: rerouted delayed share >= 2x other window flights | {rr*100:.1f} % ({b('TFR',3,'window|rerouted','n')} flights) vs {oo*100:.1f} % | **{'PASS' if rr >= 2 * oo else 'FAIL'}** |")
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stress_results_table.md'), 'w').write(txt + '\n')
