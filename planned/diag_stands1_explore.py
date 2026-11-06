"""EXPLORATORY (not registered), STANDS1 diagnosis. (1) S* with the criterion minus the below-reserve test (served >= 95 %, median wait <= 600 s,
hold p95 <= 120 s). (2) True stand need with unlimited stands: per-site peak of the stand ledger (maxHeld), compared with NET1's 6 (5 at 49T).
Reads out/stands1_*.json only. Usage: python3 -I planned/diag_stands1_explore.py"""
import json, glob, statistics as st, math
R = [x for f in sorted(glob.glob('out/stands1_[0-9].json')) for x in json.load(open(f))['rows']]
UNI = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24]; NS = {'DFW': 4, 'HOU': 3}
def get(m, r, s, a): return next(x for x in R if x['metro'] == m and x['r'] == r and x['s'] == s and x['arm'] == a)
def ok(x): return (not x.get('cannotPark')) and x['servedShare'] >= 0.95 and x['medWait'] <= 600 and x['holdP95'] <= 120
print('(1) S* without the below-reserve test (median over seeds; 99 = none up to 24); UNL meets / REAL meets of 10')
for m in NS:
    for r in (1.5, 3, 6, 12):
        v = [next((u for u in UNI if ok(get(m, r, s, 'S' + str(u)))), 99) for s in range(1, 11)]
        F = st.median([get(m, r, s, 'UNL')['F'] for s in range(1, 11)])
        print(f'  {m} r={r}: fleet {F}, ceil(F/n) {math.ceil(F / NS[m])}, S* {st.median(v)} (seeds {sorted(v)}), UNL {sum(ok(get(m, r, s, "UNL")) for s in range(1, 11))}, REAL {sum(ok(get(m, r, s, "REAL")) for s in range(1, 11))}')
