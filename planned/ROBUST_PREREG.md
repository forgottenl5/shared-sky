# Robustness of the height-allocation finding (study, written 2026-10-22 before any code change or run)
Status: behaviour model of filed operations; planned tracks only (no avoidance, no booking); paired arms as VALLOC. Not a forecast or safety assessment.
Finding under test (VALLOC): a height allocation inside the filed bands (A2) removes ~80 % of cross-operator planned meetings (30 m / 10 m) at 3-4 km site spacing in a Houston-like build-out; Amazon returning at the top of its band (A1) removes ~75 %.

## Questions and design (seeds 1-3, 2 h measured, central 144 km^2, as VALLOC)
R-a Meeting thresholds. Count in the same runs at (horizontal, vertical) = (15, 5), (30, 10), (50, 10), (30, 15), (30, 20) m. Arms A0, A1, A2; Houston mix; d = 4, 3 km.
R-b Busiest hour. All site rates x1.5. Arms A0, A2; Houston mix; d = 4, 3 km.
R-c Second metro: Dallas-Fort Worth mix. Filed: Wing up to 75 nests (400/day), Zipline up to 75 sites (400/day per site, DFW EA), Amazon several sites at up to 1,000 flights/day (Richardson flying; Dallas, Carrollton, Fort Worth in FAA review [secondary, Dallas Innovates 2026-04-23]). Ratio used Wing : Zipline : Amazon = 75 : 75 : 4 [Amazon count assumed = named sites]. Arms A0, A1, A2; d = 4, 3 km.

## Code change needed first
houston2.count gains an optional list of thresholds (default unchanged). Checks: C1 default counts identical to VALLOC A0-A2 at d = 4 (seeds 1-3); C2 the (30, 10) and (15, 5) counts from a multi-threshold run equal the single-threshold counts; C3 DFW site counts match the 75 : 75 : 4 ratio (within 20 % at d = 4 over 3 seeds) and DFW Zipline rate is 400/day.

## Predictions
- R1 A2 cuts cross-operator meetings by >= 70 % vs A0 for every threshold with vertical <= 10 m ((15,5), (30,10), (50,10)), at d = 4 and 3 km (Houston mix). PREDICTION: holds.
- R2 With vertical 15 m, A2's cut is < 50 %; with vertical 20 m, < 30 % (A2's smallest gaps between operators are 10 m and 14 m). PREDICTION: holds. Meaning if it holds: the allocation's gaps must exceed the vertical separation the operators plan to.
- R3 At peak x1.5, A2 still cuts >= 75 % at d = 4 and 3 km (30 m / 10 m). PREDICTION: holds.
- R4 Dallas-Fort Worth mix: Amazon takes part in >= 60 % of A0's cross-operator meetings and A2 cuts them by >= 60 %, at d = 4 and 3 km (30 m / 10 m, pooled seeds). PREDICTION: holds.
No criterion or parameter changes after data; at most two fix attempts on a failing feature check; deviations logged below.

## Deviation log
- houston2.count gained an optional thresholds list (default unchanged); HOUSTON2_CODE.sha256 no longer matches houston2.js (backup planned/houston2_robust_backup.js). C1-C3 PASS before the study (default counts identical to VALLOC; multi-threshold equals single-threshold; DFW sites 121/121/6 vs 121/121/6.5, Zipline 400/day).
