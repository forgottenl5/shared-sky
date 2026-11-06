# Area outages: results (OUTAGE_PREREG.md, fingerprint 5078d1aa…), 2026-10-22
K1–K3 passed. d = 3, seeds 22–24, pooled; analysis script committed before the runs.

| Prediction | Result | Verdict |
|---|---|---|
| O1 OUT-A0 >= 3x OUT-A2 per held drone, >= 20 total | 106 vs 15; ratio 7.0 | **PASS** |
| O2 OUT-A2 within 0.5-2x ISO-R per held drone | 0.69 vs 1.14; ratio 0.60 | **PASS** |
| O3 ISO-R >= 3x ISO-C per held drone | 1.14 vs 0.69; ratio 1.7 | **FAIL** |

| Arm | held drones | phase mix (cruise / hover / vertical) | cross wide | cross close | wide per 100 held |
|---|---|---|---|---|---|
| OUT-A0 | 2208 | 1626 / 462 / 120 | 106 | 33 | 4.80 |
| OUT-A2 | 2187 | 1604 / 471 / 112 | 15 | 2 | 0.69 |
| ISO-R | 2187 | 1670 / 400 / 117 | 25 | 5 | 1.14 |
| ISO-C | 2187 | 2187 / 0 / 0 | 15 | 6 | 0.69 |

## What it shows
1. **Under the filed heights, an outage is about 7× more dangerous per held drone than under the allocation** (O1 PASS). 106 wide and 33 close cross-operator meetings, against 15 and 2, for about 2,200 held drones each.
2. **Freezing together is not what makes outages risky** (O2 PASS). Under the allocation, drones held together in outages met other operators at 0.69 per 100, against 1.14 per 100 for the same number held independently at random times and places.
3. **Being caught mid-climb or mid-hover matters less than predicted** (O3 FAIL). Random-phase holds were 1.7× as risky as cruise-only holds, against >= 3× predicted. Most random holds are in cruise anyway (76 %).

## Correction to earlier studies (found while analysing this one)
Cruise-only holds here met other operators at 0.69 per 100. DEVIATE's comparable holds gave 0.08 per 100. Instrumented:
- Only 28–33 % of DEVIATE's deviations happened inside the counted zone and measurement window (437 of 1,557 at d = 3; 280 of 862 at d = 4). Meetings elsewhere are never counted.
- **Ratios between arms stay valid**, because the arms were paired on the same deviations: allocation vs filed heights 23×; RTH at 120 m vs own height 20×.
- **Absolute per-deviation rates in DEVIATE, DEVA0 and RTH are understated by about 3×.** "About 1 in 1,000" should read "about 3 in 1,000 deviations where traffic is counted", and the d = 3 cruise-hold rate here (about 7 in 1,000) is in the same range given the small counts.
- **The RTH exploratory observation** ("outage holds about 18× riskier per drone than isolated holds") was mostly this dilution plus small counts. This study, which controls for both, finds no simultaneity effect (point 2).

## Limits
- Outage behaviour assumed (hover in place 120 s); radius and frequency assumed.
- d = 3 only.
- Planned tracks only.

## Addendum, 2026-10-23: interval for O1 (computed after the fact, no criterion changed)
Rate ratio OUT-A0 vs OUT-A2 per held drone: 106/2208 vs 15/2187 = 7.0. Exact 95 % interval (conditional binomial, same method as COUNTFIX): 4.06–12.95. Counted at 1 check per second (before COUNTFIX), d = 3 only, seeds 22–24. Requested by the pre-launch review, which found the interval quoted on the city page but not in any result file.
