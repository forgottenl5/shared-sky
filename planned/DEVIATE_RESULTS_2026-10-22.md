# When a drone leaves its plan: results (DEVIATE_PREREG.md, fingerprint 7e5228f9…), 2026-10-22
K1–K4 passed. Seeds 19–21, pooled; analysis script committed before the runs. Sanity check after the runs (not registered): the counter sees all deviated tracks (320 at d = 4, seed 19) and detects a deliberately placed cross-operator meeting.

| Prediction | Result | Verdict |
|---|---|---|
| C1 d 3: LAND causes more cross wide meetings per deviation than HOLD | LAND 0.0 vs HOLD 0.1 per 100 | **FAIL** |
| C2 d 3: sharing removes < 30 % of LAND's cross wide meetings | nan % | **FAIL** |
| C3 d 3: sharing removes < 50 % of HOLD's cross wide meetings | 50 % | **FAIL** |

| d | Arm | deviations | cross wide (per 100 deviations) | cross close (per 100) | same-operator wide | delayed flights | total delay (h) | cancelled |
|---|---|---|---|---|---|---|---|---|
| 4 km | BASE | 0 | 0 (0.0) | 0 (0.0) | 7001 | 267 | 2.9 | 0 |
| 4 km | N-HOLD | 862 | 0 (0.0) | 0 (0.0) | 6994 | 267 | 2.9 | 0 |
| 4 km | S-HOLD | 862 | 0 (0.0) | 0 (0.0) | 6998 | 274 | 3.0 | 0 |
| 4 km | N-LAND | 862 | 1 (0.1) | 0 (0.0) | 6644 | 267 | 2.9 | 0 |
| 4 km | S-LAND | 862 | 1 (0.1) | 0 (0.0) | 6644 | 267 | 2.9 | 0 |
| 3 km | BASE | 0 | 0 (0.0) | 0 (0.0) | 15837 | 656 | 7.1 | 0 |
| 3 km | N-HOLD | 1557 | 2 (0.1) | 0 (0.0) | 15937 | 656 | 7.1 | 0 |
| 3 km | S-HOLD | 1557 | 1 (0.1) | 0 (0.0) | 15933 | 665 | 7.2 | 0 |
| 3 km | N-LAND | 1557 | 0 (0.0) | 0 (0.0) | 15152 | 656 | 7.1 | 0 |
| 3 km | S-LAND | 1557 | 0 (0.0) | 0 (0.0) | 15152 | 656 | 7.1 | 0 |

## What it shows
1. **All three predictions failed, because the events they compare almost never happened.** Across 4,838 deviations (holds and emergency landings, both densities, three seeds), off-plan drones caused **4 cross-operator wide meetings and 0 close ones**: about 0.1 per 100 deviations. Too few to compare LAND with HOLD (C1) or to measure what sharing removes (C2 undefined: 0 meetings to remove; C3: 2 → 1).
2. **Why so rare:**
   - Under the A2 height allocation, operators cruise at least 10 m apart. A drone holding at its own height meets only another operator's drone that is climbing or descending through that height at the same spot within 2 minutes.
   - An emergency descent at 3 m/s crosses each lower band in a few seconds, at one spot.
   - At these densities, another operator's drone is rarely within 30 m at that moment.
3. **Sharing the contingency at the plan level changes almost nothing here,** because there is almost nothing to prevent. It costs very little (9 more delayed flights at d = 3).
4. **Same-operator meetings dominate** (thousands per run, unchanged by deviations). Each operator's own deconfliction is outside this model.

## What this does and does not say
- With height allocation and a shared plan check, a single drone that stops or lands vertically is very unlikely to come within 30 m / 10 m of another company's drone (roughly 1 in 1,000 such events, in this model).
- It does not cover the deviations most likely to matter:
  - Lateral drift or flyaway.
  - Climbing to a contingency height.
  - Return-to-home at a fixed height through other operators' bands.
  - Several drones failing at once (e.g. a GPS outage over an area).
- Without height allocation (filed A0 heights), Amazon's inbound and Zipline's cruise sit 4 m apart. A hold at those heights would meet far more often. Not tested here.

## Correction (OUTAGE_RESULTS, 22 Oct 2026)
Only 28–33 % of these deviations occurred inside the counted zone and measurement window, so per-deviation rates here are understated by about 3× ("about 1 in 1,000" → about 3 in 1,000 where traffic is counted). The comparison between arms is unaffected.

## Superseded numbers (COUNTFIX, 23 Oct 2026)
Measured per in-zone hold at 4 checks per second: 0.42 per 100 [0.27–0.61] with the allocation (about 4 in 1,000).

## Theory log
- The prediction that deviations would produce enough cross-operator meetings to compare (C1–C3) was wrong.
- Abandoned. Not chased further in this study.
