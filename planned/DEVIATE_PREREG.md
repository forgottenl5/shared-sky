# When a drone leaves its plan: meetings caused, and whether sharing the contingency helps (study, written 2026-10-22 before any code or run)
Status: behaviour model of filed operations (planned tracks plus injected deviations), on PROC's plan check (first filed goes first, 30 m / ±5 s / 10 m) with VALLOC A2 heights and filed profiles. Not a forecast or safety assessment; deviation rates are assumed, not measured.

## Background
- Wing and Flytrex report zero planned conflicts over about 8,000 overlapping operations. Planned intents only (GEMINI_RESEARCH_CHECK).
- DroneXL notes there is no shared in-flight contingency state between operators: when one operator's drone leaves its plan, the other is not told.
- In our model, the plan check leaves 0 planned cross-operator meetings. Any meeting after a deviation is caused by the deviation.

## Question
How many cross-operator meetings does a deviation cause, by type? How much of that does sharing the contingency at the plan level prevent, i.e. later-launching flights planning around the deviated drone?

## Deviations
- 5 % of zone-touching flights are drawn to deviate (random stream seed + 70,000), at a time uniform over their accepted cruise time.
- **HOLD:** the drone stops at its current position and height for 120 s, then resumes its plan (the rest shifted by 120 s).
- **LAND:** the drone descends vertically from its current position to the ground at 3 m/s, and the flight ends.

## Arms (d = 4 and 3 km; NEW seeds 19–21)
- **BASE:** no deviations.
- **N-HOLD / N-LAND:** deviations, not shared. Other operators' plans are unchanged.
- **S-HOLD / S-LAND:** deviations shared at the plan level.
  - The plan check is run with each deviating flight's deviated samples booked, visible only to flights whose (delayed) launch time is at or after the deviation time.
  - Its planned samples stay booked as before.
  - The deviating flight itself checks only its planned track.
  - Airborne flights are not rerouted (no tactical action).

## Measures
- Cross-operator meetings in the zone (wide 30 m / 10 m, close 15 m / 5 m), per 100 deviations.
- Same-operator meetings.
- Delayed flights and total delay (to price sharing).

## Predictions (pooled over seeds 19–21)
- **C1:** At d = 3, LAND causes more cross-operator wide meetings per deviation than HOLD (descents cross other operators' heights; a hold stays at the drone's own height). PREDICTION: holds.
- **C2:** At d = 3, sharing removes less than 30 % of LAND's cross-operator wide meetings (most are with drones already airborne). PREDICTION: holds.
- **C3:** At d = 3, sharing removes less than 50 % of HOLD's cross-operator wide meetings. PREDICTION: holds.
- **C4 (reported only):** close meetings; d = 4; same-operator meetings; delay cost of sharing.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below. The analysis script is committed before any study run.

## Feature checks (before the study)
- **K1:** BASE gives 0 cross-operator wide meetings in the zone (d = 4 and 3, seed 19).
- **K2:** Deviated tracks.
  - HOLD: identical to the accepted track up to the deviation time, stationary for 120 s, then identical shifted by 120 s.
  - LAND: identical up to the deviation time, then fixed x,y, descending at 3 m/s to 0.
- **K3:** S-arms with the deviated samples made invisible give exactly the N-arms' delays.
- **K4:** Brute-force check in S-LAND (d = 4, seed 19): no flight launched at or after a deviation time conflicts with that deviation's samples under the booking rule.

## Deviation log
(none yet)
- (Appended after fingerprint 7e5228f9…; pre-study checks only.) K1–K4 PASS on first run: BASE 0 cross-operator meetings (d 4, 3); 503 deviated tracks, 0 bad; invisible-sharing check identical to the normal check; S-LAND brute-force 0 conflicts with 320 shared deviations.
