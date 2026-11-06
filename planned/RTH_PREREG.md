# Off-plan events that cross heights: return-to-home and an area outage (study, written 2026-10-22 before any code or run)
Status: behaviour model, planned tracks plus injected contingencies; plan check (first filed goes first, 30 m / ±5 s / 10 m), not shared. Not a forecast or safety assessment; contingency rates and heights are assumed, not published.

## Background
- DEVIATE / DEVA0: two-minute holds and vertical landings almost never meet another operator under the A2 allocation (2 in 2,419 holds), but often at the filed heights (46 in 2,419).
- Real contingencies also include return-to-home (RTH) and area-wide events such as a GPS outage. Delivery operators' RTH heights are not published.

## Arms (d = 4 and 3 km; seeds 19–21, paired with DEVIATE: same sites, orders and deviation draws)
- **RTH-OWN (A2):** 5 % of zone-touching flights, at the DEVIATE deviation time, fly straight back to their pad at their current cruise height and operator cruise speed, then descend vertically at 3 m/s.
- **RTH-120 (A2):** the same flights climb or descend vertically at 3 m/s to 120 m, fly straight back to the pad at 120 m, then descend vertically at 3 m/s.
- **OUT-A2:** a single area outage. At t = 5,400 s, every airborne flight (z > 0.5 m) within 2,000 m of the zone centre hovers in place for 120 s, then resumes its plan (the rest shifted by 120 s). This includes flights caught climbing or descending.
- **OUT-A0:** the same outage on filed-height (A0) traffic.

## Measures
- Cross-operator meetings in the zone, wide (30 / 10 m) and close (15 / 5 m). For RTH, per 100 deviations; for outages, per event (per run).
- Flights affected per outage.

## Predictions (d = 3 and 4 pooled, seeds 19–21)
- **G1:** RTH-120 causes at least 5× as many cross-operator wide meetings per deviation as RTH-OWN, and at least 10 in total (120 m is 5 m from Amazon's inbound 115 m; the climb crosses other bands). PREDICTION: holds.
- **G2:** RTH-OWN causes at most 1 cross-operator wide meeting per 100 deviations (it stays at the drone's own height until the vertical descent at the pad). PREDICTION: holds.
- **G3:** OUT-A0 causes at least 5× as many cross-operator wide meetings as OUT-A2, and at least 10 in total. PREDICTION: holds.
- **G4 (reported only):** close meetings; per-density results; flights held per outage.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below. The analysis script is committed before any study run.

## Feature checks (before the study)
- **K1:** RTH tracks are identical to the accepted track up to the deviation time. Then: fixed x,y with height changing at 3 m/s to the RTH height (none for RTH-OWN); straight flight at that height toward the pad (at most 1 s rounding); fixed x,y descending at 3 m/s to 0 at the pad.
- **K2:** OUTAGE: every flight airborne within 2,000 m of the centre at t = 5,400 s holds exactly 120 s at its position there and is otherwise identical shifted by 120 s. All other flights are unchanged.

## Deviation log
(none yet)
- (Appended after fingerprint c44eda24…; pre-study checks only.) K1–K2 PASS on first run: 503 RTH tracks each arm, 0 bad; outages hold 25 (A2) / 26 (A0) flights at d = 3, seed 19, 0 bad, 0 missed. Note before runs: about 25 flights per outage event may give low counts for G3.
