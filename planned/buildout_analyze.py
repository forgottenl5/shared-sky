"""Analysis for BUILDOUT_PREREG.md; committed before runs."""
import glob, json
from collections import defaultdict
import os
DIR = os.environ.get('DIR', 'out/buildout'); R = [json.loads(l) for f in glob.glob(DIR + '/runs_*.jsonl') for l in open(f) if l.strip()]
ST = ['early', 'mid', 'full'] if os.environ.get('METRO') == 'dfw' else ['today', 'early', 'mid', 'full']
def rows(st, arm, v): return [r for r in R if (r['stage'], r['arm'], r['variant']) == (st, arm, v)]
def s(st, arm, v, f): return sum(f(r) for r in rows(st, arm, v))
HRS = lambda st, arm, v: 2 * max(1, len(rows(st, arm, v)))
print('## Close calls per hour between companies (wide), no plan check, still air')
print('| Stage | sites W / Z / A | Omaha profile (A0) | Amazon as reported (R) | Shared out (A2) | A2 cut vs A0 / R |\n|---|---|---|---|---|---|')
cut = {}
for st in ST:
    r0 = rows(st, 'A0', 'still5'); sites = r0[0]['sites'] if r0 else {}
    a0, rr_, a2 = (s(st, x, 'still5', lambda r: r['noCheck']['w']) for x in ['A0', 'R', 'A2'])
    h = HRS(st, 'A0', 'still5'); cut[st] = (1 - a2 / a0 if a0 else float('nan'), 1 - a2 / rr_ if rr_ else float('nan'))
    print(f"| {st} | {sites.get('wing')} / {sites.get('zipline')} / {sites.get('amazon')} | {a0/h:.2f} ({a0}) | {rr_/h:.2f} ({rr_}) | {a2/h:.2f} ({a2}) | {100*cut[st][0]:.0f} / {100*cut[st][1]:.0f} % |")
print('\n## After a plan check (planned in still air)')
print('| Stage | Heights | still air, ±5 s: left / delayed | p50 wind, ±5 s: left / delayed | p50 wind, ±30 s: left / delayed / mean delay |\n|---|---|---|---|---|')
res = {}
for st in ST:
    for arm in ['A0', 'R', 'A2']:
        cells = []
        for v in ['still5', 'wind5', 'wind30']:
            nc, ac = s(st, arm, v, lambda r: r['noCheck']['w']), s(st, arm, v, lambda r: r['afterCheck']['w'])
            ck, dl = s(st, arm, v, lambda r: r['check']['checked']), s(st, arm, v, lambda r: r['check']['delayed'])
            md = sum(r['check']['meanDelay'] * r['check']['delayed'] for r in rows(st, arm, v)) / max(1, dl)
            res[st, arm, v] = dict(nc=nc, ac=ac, left=ac / nc if nc else float('nan'), dshare=dl / ck if ck else float('nan'), md=md)
            cells.append(f"{ac} of {nc} ({100*res[st,arm,v]['left']:.0f} %) / {100*res[st,arm,v]['dshare']:.1f} %" + (f" / {md:.0f} s" if v == 'wind30' else ''))
        print(f"| {st} | {arm} | " + ' | '.join(cells) + ' |')
pr = defaultdict(int)
for st in ['mid', 'full']:
    for r in rows(st, 'A0', 'still5'):
        for k, v in r['noCheck']['pairs'].items(): pr[st, k] += v
az = {st: (pr[st, 'amazon-zipline'] / max(1, sum(v for (s_, k), v in pr.items() if s_ == st))) for st in ['mid', 'full']}
ph = lambda st: s(st, 'A0', 'still5', lambda r: r['noCheck']['w']) / HRS(st, 'A0', 'still5')
if os.environ.get('METRO') == 'dfw':
    DP = [('D1 full, Omaha profile: 15–30 close calls an hour', f"{ph('full'):.1f}", 15 <= ph('full') <= 30),
         ('D2 sharing out cuts >= 65 % at mid and full', f"mid {100*cut['mid'][0]:.0f} %, full {100*cut['full'][0]:.0f} %", cut['mid'][0] >= 0.65 and cut['full'][0] >= 0.65),
         ('D3 Amazon–Zipline >= 50 % of A0 at full', f"{100*az['full']:.0f} %", az['full'] >= 0.5),
         ('D4 full, A0, DFW median wind: ±30 s check removes < 80 %', f"{100*(1-res['full','A0','wind30']['left']):.0f} %", (1 - res['full', 'A0', 'wind30']['left']) < 0.80),
         ('D5 mid, Omaha profile: <= 3.2 an hour (half of Houston mid)', f"{ph('mid'):.1f}", ph('mid') <= 3.2)]
print('\n| Prediction | Result | Verdict |\n|---|---|---|')
P = [('B1 A0 no-check < 1 per hour today and >= 10 per hour at mid', f"today {ph('today'):.2f}, mid {ph('mid'):.1f}", ph('today') < 1 and ph('mid') >= 10),
     ('B2 sharing out cuts A0 >= 65 % at mid and full', f"mid {100*cut['mid'][0]:.0f} %, full {100*cut['full'][0]:.0f} %", cut['mid'][0] >= 0.65 and cut['full'][0] >= 0.65),
     ('B3 full, A0, p50 wind: ±30 s check removes >= 80 %, ±5 s removes <= 30 %', f"±30 s removes {100*(1-res['full','A0','wind30']['left']):.0f} %, ±5 s removes {100*(1-res['full','A0','wind5']['left']):.0f} %", (1 - res['full', 'A0', 'wind30']['left']) >= 0.80 and (1 - res['full', 'A0', 'wind5']['left']) <= 0.30),
     ('B4 full, p50 wind ±30 s: delayed share with sharing out <= half of A0', f"A2 {100*res['full','A2','wind30']['dshare']:.1f} % vs A0 {100*res['full','A0','wind30']['dshare']:.1f} %", res['full', 'A2', 'wind30']['dshare'] <= 0.5 * res['full', 'A0', 'wind30']['dshare']),
     ('B5 Amazon–Zipline >= 50 % of A0 meetings at mid and full', f"mid {100*az['mid']:.0f} %, full {100*az['full']:.0f} %", az['mid'] >= 0.5 and az['full'] >= 0.5)]
if os.environ.get('METRO') == 'dfw': P = DP
for n, r_, ok in P: print(f"| {n} | {r_} | {'**PASS**' if ok else '**FAIL**'} |")
print(f'Runs read: {len(R)} (expected {81 if os.environ.get("METRO") == "dfw" else 108}).')
