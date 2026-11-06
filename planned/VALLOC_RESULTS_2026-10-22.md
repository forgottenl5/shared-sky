# Phase 2a: height allocation between operators inside their filed bands: results (VALLOC_PREREG.md), 2026-10-22
Status: behaviour model of filed operations; planned tracks only (no avoidance, no booking); paired comparison on HOUSTON2's random sites and demand. Not a forecast or safety assessment. Code hashed before the runs (planned/VALLOC_CODE.sha256, verified after).

## Feature checks
K1-K3 PASS (the filed arm reproduces HOUSTON2 exactly; 0 height violations; arms fly identical flights).

## Arms (every height inside the operator's own filed band)
| Arm | Wing | Amazon outbound | Zipline | Amazon inbound |
|---|---|---|---|---|
| A0 filed | 46-91 m | 61 m (200 ft) | 101 m (330 ft) | 105 m (345 ft) |
| A1 Amazon returns at the top of its band | 46-91 m | 61 m | 101 m | 115 m (377 ft) |
| A2 full allocation | 46-71 m (150-233 ft) | 81 m (266 ft) | 101 m | 115 m (377 ft) |

## Results (central 144 km^2; 3 seeds x 2 h; full table in planned/valloc_results_table.md)
| Wing nest spacing | Arm | Cross-operator meetings (30 m / 10 m) per hour | Close (15 m / 5 m) per hour | Share with a climbing or descending aircraft | Same-operator meetings per hour |
|---|---|---|---|---|---|
| 4 km | A0 filed | 30.2 | 10.3 | 17 % | 1,008 |
| 4 km | A1 | 7.5 (-75 %) | 1.2 (-88 %) | 64 % | 1,007 |
| 4 km | A2 | 5.2 (-83 %) | 1.0 (-90 %) | 100 % | 1,011 |
| 3 km | A0 filed | 85.5 | 27.0 | 18 % | 2,461 |
| 3 km | A1 | 21.0 (-75 %) | 4.7 (-83 %) | 75 % | 2,460 |
| 3 km | A2 | 15.2 (-82 %) | 2.0 (-93 %) | 100 % | 2,468 |
| 2 km | A0 filed | 393 | 115 | 20 % | 9,362 |
| 2 km | A1 | 111 (-72 %) | 18 (-84 %) | 74 % | 9,361 |
| 2 km | A2 | 77 (-80 %) | 12 (-89 %) | 100 % | 9,445 |

## Verdicts
| Prediction | Result | Verdict |
|---|---|---|
| V1 A1 cuts cross-operator meetings >= 60 % at 4 and 3 km | 75 %, 75 % | **PASS** |
| V2 A2 cuts them >= 80 % at 4 and 3 km | 83 %, 82 % | **PASS** |
| V3 in A2 >= 80 % of the rest involve a climb or descent | 100 % (554 of 554) | **PASS** |

## What this means
1. **One operator flying at the top of its own filed band removes three quarters of cross-operator meetings** (and ~85 % of close ones). Amazon returning at 377 ft instead of 345 ft clears Zipline's 330 ft cruise and hovers by 14 m; no new approval is implied because 377 ft is inside Amazon's filed inbound band.
2. **A full allocation within filed bands removes ~80-83 % of meetings and ~90 % of close ones**, and every remaining meeting involves an aircraft climbing or descending through another operator's height. Height allocation cannot remove those; they need timing or lateral rules near sites and delivery points.
3. **No cost in our model to same-operator meetings** (Wing's narrower 46-71 m band changed them by < 1 %).
4. The cost side is not modelled: Amazon's transition durations were kept as filed, so the extra climb to 115 m and the energy for it are not in the flight times (+10 m on the return climb, ~2 s at 5 m/s, is small but unmeasured here). Noise on the ground from a slightly higher return leg would fall slightly, not rise.

## Limits
Planned tracks only; random sites; uniform demand; straight routes; Zipline's 101 m and Amazon's baselines taken from the filings (operators may vary heights within bands in practice; if they already do, the filed baselines overstate the problem).

## Status as a finding
This is the first Phase 2 comparison against the filed baseline. It is a simple, checkable observation from the operators' own filings: Amazon's inbound baseline and Zipline's cruise/hover height are 4 m apart, and a reallocation inside the filed bands removes most cross-operator planned meetings. Before any public claim: prior-art check (has a height-allocation convention between US delivery operators been proposed?) and an outside reviewer.
