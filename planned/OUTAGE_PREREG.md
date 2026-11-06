# Area outages: is freezing together riskier, or is it being caught mid-climb? (study, written 2026-10-22 before any code or run)
Status: behaviour model, planned tracks plus injected holds; plan check (first filed goes first, 30 m / ±5 s / 10 m), not shared. Not a forecast or safety assessment; outage rates are assumed.

## Background
RTH found too few outage events to compare A0 with A2 (7 vs 2, G3 FAIL). An unregistered observation suggested drones held in an outage meet other operators about 18× more often per drone than DEVIATE's isolated holds. Those holds were cruise-only, so there are two candidate explanations:
- (a) simultaneity: many drones stop at once;
- (b) state: an outage catches drones climbing or descending inside other operators' heights.

## Design (d = 3 km; NEW seeds 22–24)
- **Outages:** 20 per run. Times uniform in 4,000–9,000 s; centres uniform in |x|, |y| <= 4,000 m; radius 2,000 m; 120 s hover. Random stream seed + 90,000.
  - Every airborne flight (z > 0.5 m) within the circle at the outage time hovers in place for 120 s, then resumes its plan, shifted.
  - Events are applied in time order to the updated tracks.
- **Arms:**
  - **OUT-A2:** outages on A2 traffic.
  - **OUT-A0:** the same outages on filed-height (A0) traffic.
  - **ISO-R (A2):** N independent holds, N = the number of holds in OUT-A2 for the same seed. Each picks a uniform random time in 4,000–9,000 s and a uniform random flight airborne in the zone at that time, whatever its phase, and holds it 120 s there. Stream seed + 91,000.
  - **ISO-C (A2):** as ISO-R, but only flights in cruise at that time can be picked.

## Measures
Cross-operator meetings in the zone, wide (30 / 10 m) and close (15 / 5 m), per 100 held drones; holds per arm.

## Predictions (pooled over seeds 22–24)
- **O1:** OUT-A0 gives at least 3× OUT-A2's cross-operator wide meetings per 100 held drones, and at least 20 in total. PREDICTION: holds.
- **O2:** Simultaneity does not matter much. OUT-A2's wide meetings per 100 held drones are within 0.5–2× of ISO-R's. PREDICTION: holds.
- **O3:** State matters. ISO-R's wide meetings per 100 held drones are at least 3× ISO-C's. PREDICTION: holds.
- **O4 (reported only):** close meetings; holds per outage; the phase mix of held drones.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below. The analysis script is committed before any study run.

## Feature checks (before the study)
- **K1:** OUT: for one event, every flight airborne within the circle at its time holds exactly 120 s there and is otherwise unchanged (shifted); flights outside are unchanged.
- **K2:** ISO-R and ISO-C make exactly N holds. ISO-C picks only cruise-phase drones; ISO-R picks from all phases.
- **K3:** With 0 outages, OUT-A2 gives 0 cross-operator wide meetings (seed 22).

## Deviation log
(none yet)
- (Appended after fingerprint 5078d1aa…; pre-study checks only.) K1–K3 PASS on first run: one outage held 40 flights, 0 bad, 0 missed; seed 22 gives 712 holds in OUT-A2, ISO-R and ISO-C (ISO-C cruise only; ISO-R 546 cruise, 36 vertical, 130 hover); zero outages give 0 cross meetings.
