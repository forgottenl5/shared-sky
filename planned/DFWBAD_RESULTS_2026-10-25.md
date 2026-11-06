# Bad days in DFW: results (DFWBAD_PREREG.md, sha256 5d7b9a6d…), 2026-10-25
K1 and K2 passed after logged check-specification corrections (code unchanged). 51 runs; analysis script committed before the runs. All six predictions passed.

## Result in one line
**Every Houston bad-day finding holds with DFW's mix of companies.** Sharing out heights cuts hover close calls 7.6× (Houston 9.4×); sending every drone home at one common 120 m is 5.9× worse than each company's own height (Houston 10.7×), and 7.8× in the unsourced high-return case (Houston 8.6×).

| Test | Arm | runs | events | close calls (wide) | per 100 events | very close |
|---|---|---|---|---|---|---|
| hold | A0 | 6 | 3841 | 122 | 3.18 | 51 |
| hold | R | 6 | 3841 | 22 | 0.57 | 9 |
| hold | A2 | 6 | 3839 | 16 | 0.42 | 2 |
| outage | A0 | 3 | 360 | 47 | 13.06 | 16 |
| outage | R | 3 | 361 | 3 | 0.83 | 1 |
| outage | A2 | 3 | 362 | 2 | 0.55 | 0 |
| rth-120 | A2 | 6 | 3839 | 65 | 1.69 | 15 |
| rth-120 | R | 6 | 3841 | 62 | 1.61 | 14 |
| rth-own | A2 | 6 | 3839 | 11 | 0.29 | 3 |
| rth-own | R | 6 | 3841 | 8 | 0.21 | 4 |

Hover R vs A2: 1.4× [0.7–2.8]

| Prediction | Result [95 %] | Verdict |
|---|---|---|
| B1 hover A0 vs A2 >= 4× [Houston 9.4×] | 7.6× [4.5–13.8] | **PASS** |
| B2 hover A0 vs R >= 3× [6.8×] | 5.5× [3.5–9.2] | **PASS** |
| B3 return home A2: 120 m vs own >= 5× [10.7×] | 5.9× [3.1–12.4] | **PASS** |
| B4 return home R: 120 m vs own >= 4× [8.6×] | 7.8× [3.7–18.7] | **PASS** |
| B5 area hold A0 vs A2 >= 3× [7.0×] | 23.6× [6.2–200.8] | **PASS** |
| B6 hover A0 per 100 below 3.93 | 3.18 | **PASS** |

Runs read: 51 (expected 51).

## Reading
- DFW's ratios are a little smaller than Houston's at the same seeds, and the intervals overlap Houston's in every test. Fewer Zipline flights mean fewer close calls, so the intervals are wider.
- **Area hold, 23.6× [6.2–200.8]:** too few close calls with shared-out heights (2) to say more than "large". The per-100 rate under the Omaha profile (13.1) is not comparable to the Houston page's 4.80, which was counted once per second (COUNTFIX outage); these runs count four times per second like every other DFW figure.
- As in Houston, the high-return case (R) does almost as well as full sharing for hovers (R vs A2 1.4× [0.7–2.8], not clearly different).
