# Follow-up: bad-day and delay benefits against Amazon's reported heights: results (PRELAUNCH2_PREREG.md, fingerprint 8ef9f2be…), 2026-10-23
K1 passed (after the logged check-specification correction). 27 runs; analysis script committed before the runs. Output verbatim from `python3 planned/prelaunch2_analyze.py`. All four predictions passed.

## holds

| Arm | runs | holds | cross wide | wide per 100 | cross close | plan-check delayed / checked | delay h |
|---|---|---|---|---|---|---|---|
| A0 | 6 | 6241 | 245 | 3.93 | 111 | 4031 / 48343 | 66.7 |
| R | 6 | 6236 | 36 | 0.58 | 7 | 1211 / 48343 | 13.8 |
| A2 | 6 | 6235 | 26 | 0.42 | 9 | 923 / 48343 | 9.9 |

A0 vs R per event: 6.8 [4.8–9.9]

R vs A2 per event: 1.4 [0.8–2.4]

A0 vs A2 per event: 9.4 [6.3–14.7]

Delay: A0 vs A2 flights 4.4x, time 6.7x; R vs A2 flights 1.3x, time 1.4x

## outages

| Arm | runs | held drones | cross wide | wide per 100 | cross close |
|---|---|---|---|---|---|
| A0 | 3 | 596 | 44 | 7.38 | 20 |
| R | 3 | 604 | 4 | 0.66 | 1 |
| A2 | 3 | 607 | 5 | 0.82 | 0 |

A0 vs R per event: 11.1 [4.1–42.7]

R vs A2 per event: 0.8 [0.2–3.7]

A0 vs A2 per event: 9.0 [3.6–29.0]

## Verdicts

| Prediction | Result | Verdict |
|---|---|---|
| Q1 A0 >= 3x R per 100 holds | 6.8x | **PASS** |
| Q2 R < 3x A2 per 100 holds | 1.4x | **PASS** |
| Q3 R delayed flights <= 50 % of A0 | 1211 vs 4031 (30 %) | **PASS** |
| Q4 R < 3x A2 per 100 held drones (outages) | 0.8x | **PASS** |

Runs read: 27 (expected 27).

## What this means
1. **Against the heights Amazon is reported to fly, the allocation's bad-day and delay benefits are small.** Holds: 1.4× fewer cross-operator meetings per 100 holds (interval 0.8–2.4, includes no effect). Plan-check delay: 1.3× fewer delayed flights, 1.4× less delay time.
2. **Nearly all of the published bad-day and delay benefit comes from Amazon's return sitting 4 m above Zipline in the filings.** Moving it to 122 m (R) gives 6.8× fewer meetings per hold and 70 % fewer delayed flights by itself.
3. **The outage numbers here are not verified.** These runs held 596 drones over seeds 22–24 at d = 3, against 2,208 in OUTAGE_RESULTS with the same seeds. The browser engine's outage function (lab_engine.js) was never checked against outage.js (test_lab_engine.js covers sites, flights, counts, plan check, holds and RTH only). Q4 passed, but the outage figures should not be quoted until the two implementations are reconciled.
4. **Consequence (rule set in advance):** the city page must state the bad-day and delay benefits against R alongside A0 and lead with the R figures.

## Addendum (2026-10-23): outage mismatch explained
Not a code fault. OUTAGE (planned/outage.js) used 20 outages per run, times uniform in 4,000–9,000 s and centres in |x|, |y| <= 4,000 m. The lab engine (lab_engine.js `outages`) and this study used 6 outages per run (`outages: 6`), times in 3,600–10,080 s and centres in |x|, |y| <= 4,200 m. The held-drone count scales with the number of outages (596 / 2,208 = 0.27, against 6 / 20 = 0.30). The prereg's phrase "OUTAGE settings" was wrong about the count; the per-100-held-drone rates here are a valid model result for 6 outages per run, but not a replication of OUTAGE. Q4's verdict stands as measured.
