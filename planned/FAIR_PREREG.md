# Fairness: does flight shape or priority rule decide who waits? (study, written 2026-10-22 before any code or run)
Status: behaviour model of filed operations (planned tracks only), on PROC's plan check (P2) with VALLOC A2 heights. Not a forecast or safety assessment.

## Background
- PROC: under a "first filed goes first" plan check, Amazon was delayed 6–10× more often than Wing or Zipline (seeds 1–3).
- Prior art (PRIORART_FAIR_2026-10-22.md): first-filed unfairness has been studied (Airbus 2020, CNA 2023), but always as a result of filing time. Here all operators file the same way (at departure), so any asymmetry comes from the flight profiles.
- Amazon's filed profile climbs and descends on long ramps (about 600 m and 450 m) through the other operators' heights. Wing and Zipline climb and descend in place.

## Question
Is the asymmetry caused by Amazon's profile shape, and does changing that shape, or changing the priority rule, even it out? At what cost?

## Arms (all: A2 heights, P2 booking rule, d = 4, 3 and 2 km, NEW seeds 4–6)
- **F0 — First filed goes first** (= PROC P2).
- **F1 — Amazon flies in place.** Every Amazon height change keeps its filed duration and start and end heights, but is flown with no lateral motion, at the pad or customer point. The lateral distance the ramps used to cover is flown in cruise at the cruise height, at 30 m/s. Not inside Amazon's filed profile: a design alternative.
- **F2 — Amazon first within each 5-minute filing window.** Flights are grouped into 5-min windows of original start time, with all operators filing equally. Each window is processed with Amazon flights first, then the rest by start time.
- **F3 — Rotating order.** Same windows; the operator processed first rotates wing → amazon → zipline by window index (others follow in start-time order).

## Measures
- Per operator: share of zone-touching flights delayed; mean delay per flight (all flights, zeros included).
- Totals: delayed flights; total delay (s).
- **Asymmetry ratio:** Amazon's delayed share divided by the mean of Wing's and Zipline's.
- Cross-operator wide meetings after the check (expected 0).
- F1 only: cross-operator meetings with no plan check (F1 profile on P0), and Amazon's extra flight time.

## Predictions (pooled over seeds 4–6)
- **G1 (replication):** In F0, the asymmetry ratio is >= 3 at d = 4 and at d = 3. PREDICTION: holds.
- **G2 (main):** F1 cuts Amazon's delayed share by >= 50 % vs F0 and gives a ratio <= 2 at d = 4 and at d = 3. PREDICTION: holds.
- **G3:** F2's total delay is within ±25 % of F0's at d = 3 (priority moves delay, it does not remove it). PREDICTION: holds.
- **G4:** F3's asymmetry ratio stays >= 3 at d = 3 (rotation cannot fix a geometric cause). PREDICTION: holds.
- **G5 (reported only):** all arms at d = 2; F1's meetings without a check; Amazon's extra flight time under F1.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- **K1:** F0 code with seeds 1–3 reproduces PROC P2's delays and meeting counts exactly (d = 4 and 3).
- **K2:** In F1, every Amazon segment that changes height has identical start and end x,y; the start/end heights and durations of its height changes match the filed profile; the cruise heights are unchanged.
- **K3:** Brute-force recheck of F2 at d = 4, seed 4: 0 cross-operator conflicts under the booking rule.
- **K4:** In F2, Amazon flights are processed before all others within every window. In F3, the first operator in each window follows the rotation.

## Deviation log
(none yet)
- (Appended after fingerprint 6a8251a4…; pre-study checks only.) K1–K4 PASS on first run: F0 = PROC P2 exactly; F1 Amazon profile 3,042 flights, 0 bad; F2 brute-force 0 conflicts among 5,979 flights; processing order 0 violations for F2 and F3.
