"""Analysis for DFWPROC_PREREG.md; committed before the study runs."""
import glob, json
R = [json.loads(l) for f in sorted(glob.glob('out/dfwproc/runs_*.jsonl')) for l in open(f) if l.strip()]
A = [r for r in R if r['part'] == 'A']; B = [r for r in R if r['part'] == 'B']
def pa(arm, d=None):
    X = [r for r in A if r['arm'] == arm and (d is None or r['d'] == d)]; s = dict(chk=0, dl=0, ts=0, cx=0, op={})
    for r in X:
        D = r['delays']; s['chk'] += D['checked']; s['dl'] += D['delayed']; s['ts'] += D['total_s']; s['cx'] += D['cancelled']
        for o, v in D['byOp'].items(): q = s['op'].setdefault(o, [0, 0]); q[0] += v['n']; q[1] += v['delayed']
    return s
print('## Part A: plan check cost (±5 s)\n| Heights | d | flights checked | delayed | delayed share | mean wait (s) | cancelled | delayed share: Wing / Zipline / Amazon |\n|---|---|---|---|---|---|---|---|')
for arm in ['A0', 'R', 'A2']:
    for d in [3, 4, None]:
        s = pa(arm, d); op = lambda o: 100 * s['op'].get(o, [1, 0])[1] / max(1, s['op'].get(o, [1, 0])[0])
        print(f"| {arm} | {d or 'both'} | {s['chk']} | {s['dl']} | {100 * s['dl'] / max(1, s['chk']):.1f} % | {s['ts'] / max(1, s['dl']):.0f} | {s['cx']} | {op('wing'):.1f} / {op('zipline'):.1f} / {op('amazon'):.1f} % |")
print('\n## Part B: sharing-out cut by traffic level (no check)\n| Site spacing | Omaha profile (A0) | Shared out (A2) | cut |\n|---|---|---|---|')
cut = {}
for d in [2, 3, 4]:
    a0 = sum(r['cross_wide'] for r in B if r['arm'] == 'A0' and r['d'] == d); a2 = sum(r['cross_wide'] for r in B if r['arm'] == 'A2' and r['d'] == d); cut[d] = 1 - a2 / a0 if a0 else float('nan')
    print(f'| {d} km | {a0} | {a2} | {100 * cut[d]:.0f} % |')
s3, s4 = pa('A2', 3), pa('A2', 4); c1 = [100 * s['dl'] / s['chk'] for s in (s3, s4)]
c2 = pa('A0')['dl'] / max(1, pa('A2')['dl']); S2 = pa('A2')['op']; shares = {o: v[1] / max(1, v[0]) for o, v in S2.items()}; top = max(shares, key=shares.get)
print('\n| Prediction | Result | Verdict |\n|---|---|---|')
for n, res, ok in [('C1 A2 delayed share 0.5–3 % at d 3 and 4 [Houston 1.5–2.3 %]', f'{c1[0]:.1f} / {c1[1]:.1f} %', all(0.5 <= c <= 3 for c in c1)),
                   ('C2 A0 delayed flights >= 2.5× A2 [4.4×]', f'{c2:.1f}×', c2 >= 2.5), ('C3 Amazon highest delayed share under A2', f"{top} ({', '.join(f'{o} {100*v:.1f} %' for o, v in shares.items())})", top == 'amazon'),
                   ('C4 cut >= 65 % at d 2, 3, 4 [80–83 %]', ' / '.join(f'{100*cut[d]:.0f} %' for d in [2, 3, 4]), all(cut[d] >= 0.65 for d in [2, 3, 4])),
                   ('C5 cut at d 2 within 10 points of d 4', f'{100*(cut[2]-cut[4]):+.0f} points', abs(cut[2] - cut[4]) <= 0.10)]:
    print(f"| {n} | {res} | **{'PASS' if ok else 'FAIL'}** |")
print(f'\nRuns read: {len(R)} (expected 36).')
