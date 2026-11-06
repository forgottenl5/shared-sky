# Does vertical speed decide who waits? (study, written 2026-10-22 before any code or run)
Status: behaviour model of filed operations (planned tracks only), on PROC's plan check with VALLOC A2 heights. Not a forecast or safety assessment.

## Background
- FAIR: under a shared "first filed goes first" plan check, with all operators filing the same way, Amazon is delayed 6.7–7.6× as often as Wing and Zipline. Flying its height changes in place cut this by only 27–40 % (G2 failed).
- An exploratory diagnosis (fair_diag.js, after the results) found Amazon spends about 152 s per flight changing height inside other operators' cruise bands (±10 m), against Zipline's 22 s and Wing's 0 s.
- Amazon's filed height changes take 15–40 s each (FAA Amazon Omaha EA Appendix E, Table 1, re-read 22 Oct 2026): about 0.6–2.3 m/s, against 5 m/s in our Wing and Zipline profiles.

## Hypothesis
An operator's share of delay under a shared plan check follows the time its profile spends changing height inside other operators' cruise bands.

## Arms (A2 heights, P2 booking rule; d = 4, 3 and 2 km; NEW seeds 7–9)
- **V0 — Amazon as filed** (= FAIR F0).
- **V1 — Amazon in place at filed durations** (= FAIR F1).
- **V2 — Amazon in place at 5 m/s.** Every Amazon height change flown with no lateral motion, at 5 m/s (duration = round(|dz| / 5), minimum 1 s), with the filed start and end heights. Lateral distance flown in cruise at 30 m/s; the 4 s drop hover is unchanged. A what-if, not a filed or demonstrated MK30 capability.

## Measures
- As FAIR: delayed share and mean delay per operator; asymmetry ratio (Amazon's delayed share / mean of Wing's and Zipline's); total delay; cross-operator meetings after the check.
- Crossing time: seconds per flight spent changing height inside another operator's cruise band (bands as fair_diag.js: Wing 36–81 m, Zipline 91–111 m, Amazon 71–91 and 105–125 m), per operator and arm, on all flights of the run.
- Amazon's flight time change; cross-operator meetings with no plan check.

## Predictions (pooled over seeds 7–9)
- **H1:** V2 cuts Amazon's delayed share by >= 50 % vs V0 at d = 4 and at d = 3. PREDICTION: holds.
- **H2:** V2's asymmetry ratio is <= 3 at d = 4 and at d = 3. PREDICTION: holds.
- **H3 (dose-response):** At d = 3, Amazon's delayed share in V2 relative to V0 lies within 0.7–1.3 times its crossing time in V2 relative to V0. PREDICTION: holds.
- **H4 (reported only):** d = 2; total delay; Wing's and Zipline's delayed shares; Amazon's flight time; meetings with no check.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- **K1:** V0 and V1 with seeds 4–6 reproduce FAIR F0 and F1 exactly (delays per flight and meeting counts, d = 4 and 3).
- **K2:** In V2, every Amazon height-change segment has no lateral motion, duration = max(1, round(|dz| / 5)), and the filed start and end heights; Amazon cruise heights are unchanged; Wing and Zipline flights are identical to V0.
- **K3:** Brute-force recheck of V2 at d = 4, seed 7: 0 cross-operator conflicts under the booking rule.

## Deviation log
(none yet)
- (Appended after fingerprint b2dc2b81…; pre-study checks only.) K1–K3 PASS on first run: V0/V1 = FAIR F0/F1 exactly (seeds 4–6, d = 4 and 3); V2 profile 3,058 Amazon flights, 0 bad, other operators unchanged; brute-force recheck 0 conflicts among 5,674 flights.
