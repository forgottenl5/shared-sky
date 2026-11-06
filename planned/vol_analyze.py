"""VOL_PREREG.md analysis (committed before any study run). Pooled over seeds 13-15."""
import json, os, glob
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'vol'); S = (13, 14, 15); R = {}
for f in glob.glob(os.path.join(OUT, '*.json')):
    r = json.load(open(f)); R[(r['arm'], r['d'], r['seed'])] = r
have = lambda a, d: all((a, d, s) in R for s in S)
tot = lambda a, d, k: sum(R[(a, d, s)]['tot'][k] for s in S)
def mean_delayed(a, d): n = sum(sum(1 for _ in [0]) * R[(a, d, s)]['tot']['delayed'] for s in S); return sum(R[(a, d, s)]['delay_mean_delayed_s'] * R[(a, d, s)]['tot']['delayed'] for s in S) / n if n else 0
ARMS = ['H15', 'H30', 'H60', 'H90', 'T15', 'T30', 'V20']
L = ['| d | Arm | cell / time buffer / vertical | flights checked | delayed | x H30 | delayed share wing / amazon / zipline | mean delay of delayed (s) | total delay (h) | cancelled |', '|---|---|---|---|---|---|---|---|---|---|']
for d in (4, 3):
    for a in ARMS:
        if not have(a, d): continue
        r0 = R[(a, d, S[0])]; base = tot('H30', d, 'delayed') if have('H30', d) else None
        sh = ' / '.join(f"{sum(R[(a, d, s)]['byOp'][o]['delayed'] for s in S) / sum(R[(a, d, s)]['byOp'][o]['n'] for s in S) * 100:.1f} %" for o in ('wing', 'amazon', 'zipline'))
        L.append(f"| {d} km | {a} | {r0['cell']} m / ±{r0['tb']} s / <{r0['vsep']} m | {tot(a, d, 'n')} | {tot(a, d, 'delayed')} | {tot(a, d, 'delayed')/base:.2f} | {sh} | {mean_delayed(a, d):.0f} | {tot(a, d, 'total_s')/3600:.1f} | {tot(a, d, 'cancelled')} |")
ratio = lambda a, d: tot(a, d, 'delayed') / tot('H30', d, 'delayed')
Sc = ['| Prediction | Result | Verdict |', '|---|---|---|']
if all(have(a, d) for a in ARMS for d in (4, 3)):
    Sc.append(f"| Q1 H60/H30 in 1.6-2.5 at d 4 and 3 | {ratio('H60',4):.2f} / {ratio('H60',3):.2f} | **{'PASS' if all(1.6 <= ratio('H60',d) <= 2.5 for d in (4,3)) else 'FAIL'}** |")
    Sc.append(f"| Q2 T15/H30 >= 2 at d 4 and 3 | {ratio('T15',4):.2f} / {ratio('T15',3):.2f} | **{'PASS' if all(ratio('T15',d) >= 2 for d in (4,3)) else 'FAIL'}** |")
    Sc.append(f"| Q3 V20/H30 >= 3 at d 3 | {ratio('V20',3):.2f} | **{'PASS' if ratio('V20',3) >= 3 else 'FAIL'}** |")
    mono = all(tot('H15', d, 'delayed') < tot('H30', d, 'delayed') < tot('H60', d, 'delayed') < tot('H90', d, 'delayed') for d in (4, 3))
    Sc.append(f"| Q4 strictly rising H15 < H30 < H60 < H90 at both d | {'; '.join(str([tot(a, d, 'delayed') for a in ('H15','H30','H60','H90')]) for d in (4,3))} | **{'PASS' if mono else 'FAIL'}** |")
txt = '\n'.join(Sc + [''] + L); print(txt); open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vol_results_table.md'), 'w').write(txt + '\n')
