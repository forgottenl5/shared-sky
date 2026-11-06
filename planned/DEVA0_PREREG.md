# Off-plan drones at the filed heights: does height allocation also protect against contingencies? (study, written 2026-10-22 before any code or run)
Status: behaviour model, planned tracks plus injected deviations; plan check (first filed goes first, 30 m / ±5 s / 10 m). Not a forecast or safety assessment; deviation rates are assumed.

## Background
DEVIATE (A2 heights) found off-plan holds and emergency landings almost never meet another operator: 4 cross-operator wide meetings in 4,838 deviations. Under the filed heights (VALLOC A0), Amazon's inbound cruise (105 m) sits 4 m from Zipline's cruise and hovers (101 m), and Amazon's outbound (61 m) sits inside Wing's band (46–91 m).

## Question
Under the filed heights, with the same plan check, do the same deviations cause many more cross-operator meetings?

## Arms (d = 4 and 3 km; seeds 19–21, the same as DEVIATE, so sites, orders and deviation draws are paired)
- **F-BASE:** A0 filed heights, plan check, no deviations.
- **F-HOLD:** A0, plan check, the DEVIATE HOLD deviations (120 s stop), not shared.
- **F-LAND:** A0, plan check, the DEVIATE LAND deviations (3 m/s vertical descent), not shared.
- Compared with DEVIATE's N-HOLD and N-LAND (A2, same seeds).
- Flights from valloc.flights with arm A0; deviations from deviate.draws with fraction 5 %.

## Measures
Cross-operator wide (30 / 10 m) and close (15 / 5 m) meetings in the zone, total and per 100 deviations; plan-check delayed flights and total delay.

## Predictions (pooled over seeds 19–21)
- **D1:** At d = 3 and 4 pooled, F-HOLD gives at least 10 cross-operator wide meetings and at least 5× as many per 100 deviations as A2's N-HOLD. Holds at 105 m sit 4 m from Zipline's cruise, and holds at 61 m inside Wing's band. PREDICTION: holds.
- **D2:** At d = 3 and 4 pooled, F-LAND gives at most 10 cross-operator wide meetings. A vertical descent crosses every band whatever the allocation, so it stays rare. PREDICTION: holds.
- **D3 (reported only):** close meetings; plan-check delays at A0 vs A2.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below. The analysis script is committed before any study run.

## Feature checks (before the study)
- **K1:** F-BASE gives 0 cross-operator wide meetings in the zone (d = 4 and 3, seed 19).
- **K2:** Deviation draws (flight ids and offsets) are identical for A0 and A2 flights (d = 3 and 4, seeds 19–21).

## Deviation log
(none yet)
- (Appended after fingerprint 09b1c586…; pre-study checks only.)
  - K1 PASS.
  - **K2 FAIL on first run:** offsets differed for 120 of 503 deviations at d = 3, seed 19, all Wing. Instrumented: the same 503 flights are drawn, but at A0 Wing climbs to a different height, so its cruise starts a few seconds later (46 s vs 43 s in the example).
  - **Fix attempt 1** changes the check, not the code. K2 now requires the same flights and the same cruise time elapsed at the deviation, which is the intended pairing. **PASS** (0 mismatches in 6 runs).
