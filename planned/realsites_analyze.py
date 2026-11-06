"""Analysis for REALSITES_PREREG.md; committed before runs. Random-site references: BUILDOUT v2 (out/buildout) and DFWBUILD (out/dfwbuild), A0 still5 no-check counts."""
import glob, json
R = [json.loads(l) for f in glob.glob('out/realsites/runs_*.jsonl') for l in open(f) if l.strip()]
def ref(d, st):
    rows = [json.loads(l) for f in glob.glob(d + '/runs_*.jsonl') for l in open(f) if l.strip()]
    rows = [r for r in rows if r['stage'] == st and r['arm'] == 'A0' and r['variant'] == 'still5']
    return sum(r['noCheck']['w'] for r in rows) / (2 * len(rows)) if rows else float('nan')
def ph(m, st, arm): rows = [r for r in R if (r['metro'], r['stage'], r['arm']) == (m, st, arm)]; return sum(r['w'] for r in rows) / (2 * max(1, len(rows))), rows
res = {}
for m, sts, rd in [('hou', ['today', 'early', 'mid', 'full'], 'out/buildout'), ('dfw', ['early', 'mid', 'full'], 'out/dfwbuild')]:
    print(f'## {m}: close calls per hour (wide), no plan check')
    print('| Stage | real sites | Omaha profile | best-sourced (S1) | shared out | cut vs Omaha / vs S1 | random-site reference (Omaha) |\n|---|---|---|---|---|---|---|')
    for st in sts:
        a0, rows = ph(m, st, 'A0'); s1, _ = ph(m, st, 'S1'); a2, _ = ph(m, st, 'A2'); rf = ref(rd, st)
        c0 = 1 - a2 / a0 if a0 else float('nan'); c1 = 1 - a2 / s1 if s1 else float('nan'); res[m, st] = dict(a0=a0, s1=s1, a2=a2, c0=c0, c1=c1, rf=rf)
        real = rows[0]['sites']['real'] if rows else 0; tot = sum(rows[0]['sites'][k] for k in ['wing', 'zipline', 'amazon']) if rows else 0
        print(f"| {st} | {real} of {tot} | {a0:.2f} | {s1:.2f} | {a2:.2f} | {100*c0:.0f} / {100*c1:.0f} % | {rf:.2f} |")
P = [('R1 Houston full, Omaha: 0.7–1.5x the random-site value', f"{res['hou','full']['a0']:.1f} vs {res['hou','full']['rf']:.1f}", 0.7 <= res['hou', 'full']['a0'] / res['hou', 'full']['rf'] <= 1.5),
     ('R2 sharing out cuts Omaha >= 65 % at mid and full, both metros', ', '.join(f"{m} {st} {100*res[m,st]['c0']:.0f} %" for m in ['hou', 'dfw'] for st in ['mid', 'full']), all(res[m, st]['c0'] >= 0.65 for m in ['hou', 'dfw'] for st in ['mid', 'full'])),
     ('R3 sharing out cuts best-sourced >= 55 % at full, both metros', ', '.join(f"{m} {100*res[m,'full']['c1']:.0f} %" for m in ['hou', 'dfw']), all(res[m, 'full']['c1'] >= 0.55 for m in ['hou', 'dfw'])),
     ('R4 DFW full, Omaha: 0.7–1.5x the random-site value', f"{res['dfw','full']['a0']:.1f} vs {res['dfw','full']['rf']:.1f}", 0.7 <= res['dfw', 'full']['a0'] / res['dfw', 'full']['rf'] <= 1.5),
     ('R5 Houston mid, Omaha: real sites >= random sites', f"{res['hou','mid']['a0']:.1f} vs {res['hou','mid']['rf']:.1f}", res['hou', 'mid']['a0'] >= res['hou', 'mid']['rf'])]
print('| Prediction | Result | Verdict |\n|---|---|---|')
for n, r_, ok in P: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print(f'Runs read: {len(R)} (expected 63).')
