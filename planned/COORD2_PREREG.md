# Layer gaps sized to the reservation (follow-up to COORD1; written 2026-10-27 before any COORD2 run)
Status: behaviour model, same engine and plan check as COORD1 (planned/coord.js, lab/lab_engine.js). Not a forecast or safety assessment.

## Why
COORD1 (planned/COORD1_RESULTS_2026-10-26.md) failed C3: with the shared-out heights A2, V2 delayed 17-19 % of flights. A post-run diagnosis (exploratory, not registered) found the cause: A2's layer gaps (Amazon 81 m vs Wing top 71 m = 10 m; Amazon 115 m vs Zipline 101 m = 14 m) are smaller than V2's vertical reservation (v_A + v_B = 20 m), so the reservations overlap. V2 with v = 5 m cut Amazon delays 86 % -> 54 % and Zipline 18 % -> 5 % in one seed. This study tests that explanation on new heights.

## Question
If layer gaps are set to at least twice the vertical reservation (>= 20 m under V2), how much of the coordination cost disappears, and how much remains because Amazon climbs and descends through every layer?

## Inputs
- Everything as COORD1 (layouts, rates, profiles, window, wind hours, persistence forecast, seeds 1-3, both metros, V2 only: w 30 m, v 10 m, h = 10 s + 5 %).
- **New heights G20:** Wing 40-60 m (uniform per flight, as before), Amazon outbound 80 m, Zipline 100 m, Amazon inbound 120 m (all gaps >= 20 m; top 120 m is below the 122 m / 400 ft ceiling). Compared with the COORD1 A0 and A2 runs (reused, not rerun).
- Arms run: NONE and V2 for G20 (12 runs).
- Wing's 40 m lower bound is my assumption (its filed range is 46-91 m); Amazon and Zipline heights are the filed or allocation values moved by 1-5 m. This is a design test, not a claim that operators would use G20.

## Measures (as COORD1, G20 vs A2 and A0)
Flown cross-company planned and tight conflicts per hour; share of checked flights delayed and cancelled, overall and by company; share leaving their own windows.

## Predictions (V2, mean over seeds, both metros)
- **G1:** G20 delays <= 7 % of flights, and <= half of A2's share (A2: Houston 19.2 %, DFW 16.7 %).
- **G2:** Amazon is still delayed >= 30 % of the time under G20 (its vertical transits through other layers remain), but <= 60 %.
- **G3:** Wing and Zipline are each delayed <= 5 % under G20 in both metros.
- **G4:** Flown planned conflicts under G20 + V2 are <= 0.5 / h in both metros.
- **G5:** The share of flights leaving their own windows under G20 + V2 is within 3 percentage points of A2's (14.9 % Houston, 13.8 % DFW): layer gaps do not change timing uncertainty.
- **G6:** With no coordination, G20 has no more flown planned conflicts than A2 (Houston 13.0 / h, DFW 4.3 / h).

## Rules
- **K1:** planned/test_coord.js still passes. **K2:** the runner's G20 NONE arm in still air reproduces lab_engine's count for the same flights (same check as COORD1 K2 but with G20 heights, computed directly by L.count).
- Runner and analysis committed before runs. No changes after data. At most two fix attempts on a failing check. Deviations logged below.

## Deviation log
(none yet)
