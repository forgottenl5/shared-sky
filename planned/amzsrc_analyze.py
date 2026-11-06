"""Analysis for AMZSRC_PREREG.md; committed before runs. A2 reference = HOUREAL's A2 runs (same layout, seeds, engine path)."""
import glob, json
def load(p):
    A = {}
    for r in [json.loads(l) for f in glob.glob(p) for l in open(f) if l.strip()]:
        a = A.setdefault(r['arm'], dict(n=0, w=0, c=0, az=0)); a['n'] += 1; a['w'] += r['cross_wide']; a['c'] += r['cross_close']; a['az'] += r['pairs'].get('amazon-zipline', 0)
    return A
S, H = load('out/amzsrc/runs_*.jsonl'), load('out/houreal/runs_*.jsonl')
A2 = H['A2']
print('| Amazon heights | Source | Wide | Close | Amazon–Zipline share | Sharing-out cut wide / close |\n|---|---|---|---|---|---|')
for arm, src in [('S1', 'out 69 m (Amazon, Richardson); back uniform 85–115 m (FAA final EAs FL/DET/KC inbound band)'), ('S2', 'out 69 m; back uniform 99–113 m (Omaha final EA inbound band, via DroneXL)')]:
    a = S[arm]; print(f"| {arm} | {src} | {a['w']} | {a['c']} | {100*a['az']/max(1,a['w']):.0f} % | {100*(1-A2['w']/a['w']):.0f} % / {100*(1-A2['c']/a['c']):.0f} % |")
for arm in ['A0', 'T', 'R']: a = H[arm]; print(f"| {arm} (HOUREAL) | | {a['w']} | {a['c']} | {100*a['az']/max(1,a['w']):.0f} % | {100*(1-A2['w']/a['w']):.0f} % / {100*(1-A2['c']/a['c']):.0f} % |")
c1, c2 = 1 - A2['w'] / S['S1']['w'], 1 - A2['w'] / S['S2']['w']
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in [('Q1 S1: sharing out cuts >= 55 %', f'{100*c1:.0f} %', c1 >= 0.55), ('Q2 S2: sharing out cuts >= 65 %', f'{100*c2:.0f} %', c2 >= 0.65), ('Q3 Amazon–Zipline >= 50 % of S2 meetings', f"{100*S['S2']['az']/max(1,S['S2']['w']):.0f} %", S['S2']['az'] / max(1, S['S2']['w']) >= 0.5)]:
    print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print('runs', sum(a['n'] for a in S.values()), '(expected 6)')
