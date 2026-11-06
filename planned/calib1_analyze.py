"""CALIB1 analysis. Reads planned/calib1_coded.csv (one row per scored prediction). Run from repo root. Deterministic."""
import csv, io, math, sys
_buf = io.StringIO(); _out = sys.stdout
class _T:
    def write(self, x): _out.write(x); _buf.write(x)
    def flush(self): _out.flush()
sys.stdout = _T()
rows = list(csv.DictReader(open('planned/calib1_coded.csv', encoding='utf-8')))
NOT_SCORED = 4
def wilson(k, n, z=1.96):
    if n == 0: return (float('nan'),) * 2
    p = k / n; d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return c - h, c + h
def rate(rs):
    k = sum(r['outcome'] == 'pass' for r in rs); n = len(rs); lo, hi = wilson(k, n)
    return k, n, (k / n if n else float('nan')), lo, hi
def line(name, rs):
    k, n, p, lo, hi = rate(rs); return f'| {name} | {k} / {n} | {100*p:.1f} % | {100*lo:.0f}-{100*hi:.0f} % |'
N = len(rows); P = sum(r['outcome'] == 'pass' for r in rows)
print(f'Rows {N}, passed {P}, failed {N-P}  (scorecard: 353 / 274 / 79)')
print('\n| group | passed / n | rate | 95 % Wilson |\n|---|---|---|---|')
print(line('all scored', rows))
for k in ('band', 'bound', 'order', 'claim'): print(line('kind: ' + k, [r for r in rows if r['kind'] == k]))
num = [r for r in rows if r['kind'] in ('band', 'bound')]; non = [r for r in rows if r['kind'] in ('order', 'claim')]
print(line('numeric (band+bound)', num)); print(line('non-numeric (order+claim)', non))
for d in ('drone', 'taxi', 'method'): print(line('domain: ' + d, [r for r in rows if r['domain'] == d]))
# time split: by (date, study), early half until cumulative count first reaches 177
studies = {}
for r in rows: studies.setdefault((r['date'], r['study']), []).append(r)
early, late, cum = [], [], 0
for key in sorted(studies):
    (early if cum < 177 else late).extend(studies[key]); cum += len(studies[key])
print(line('early half', early)); print(line('late half', late))
fails = [r for r in rows if r['outcome'] == 'fail']
nf = [r for r in fails if r['kind'] in ('band', 'bound')]
w = sum(r['side'] == 'worse' for r in nf); b = sum(r['side'] == 'better' for r in nf); u = sum(r['side'] == 'unclear' for r in nf)
print(f'\nFailed numeric rows: {len(nf)}; worse {w}, better {b}, unclear {u}')
nar = sum(r['narrow'] == 'yes' for r in fails); print(f'Failed rows coded narrow: {nar} of {len(fails)}')
print(f'\nSensitivity, 4 not-scored counted as fails: {P} / {N+NOT_SCORED} = {100*P/(N+NOT_SCORED):.1f} %')
print('\nPredictions')
pn, pnn = rate(num), rate(non)
print(f'C1 numeric {100*pn[2]:.1f} % vs non-numeric {100*pnn[2]:.1f} %: gap {100*(pnn[2]-pn[2]):.1f} points (need numeric lower by >= 5): ' + ('PASS' if pnn[2] - pn[2] >= 0.05 else 'FAIL'))
print(f'C2 worse {w} of {w+b} sided failed numeric rows (need > half): ' + ('PASS' if w + b and w / (w + b) > 0.5 else 'FAIL'))
re_, rl = rate(early), rate(late)
print(f'C3 late {100*rl[2]:.1f} % vs early {100*re_[2]:.1f} %: gap {100*(rl[2]-re_[2]):.1f} points (need late higher by >= 5): ' + ('PASS' if rl[2] - re_[2] >= 0.05 else 'FAIL'))
rt, rd = rate([r for r in rows if r['domain'] == 'taxi']), rate([r for r in rows if r['domain'] == 'drone'])
print(f'C4 taxi {100*rt[2]:.1f} % vs drone {100*rd[2]:.1f} % (need taxi lower): ' + ('PASS' if rt[2] < rd[2] else 'FAIL'))
print(f'C5 narrow {nar} of {len(fails)} failed (need >= 20 and >= a quarter): ' + ('PASS' if nar >= 20 and nar >= len(fails) / 4 else 'FAIL'))

open('planned/calib1_results_table.md', 'w', encoding='utf-8', newline='\n').write(_buf.getvalue())
