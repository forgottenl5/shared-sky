# COORD2 results (registration planned/COORD2_PREREG.md; runner/analysis commit before runs). 12 new runs; A0/A2 reused from COORD1. No deviations.
Tables: planned/coord2_results_table.md.

## Predictions: 2 of 6 passed, 4 failed
- **G1 FAIL** G20 delays 8.3 % (Houston) / 6.5 % (DFW) of flights vs the <= 7 % threshold (Houston misses). The "<= half of A2" part held in both: A2 19.2 % -> 8.3 % (-57 %), 16.7 % -> 6.5 % (-61 %).
- **G2 FAIL** Amazon delayed 64 % (Houston, above 60 %) / 36 % (DFW, inside 30-60 %).
- **G3 FAIL** Wing 3.9 / 2.7 % pass; Zipline 6.3 % (Houston) fails, 5.0 % (DFW) at the limit.
- **G4 PASS** flown planned conflicts under V2 0.33 / h in both metros.
- **G5 PASS** leave-window share unchanged (14.8 vs 14.9 %; 13.7 vs 13.8 %): timing uncertainty is independent of layer gaps, as predicted.
- **G6 FAIL** with no coordination G20 has fewer conflicts in Houston (10.3 vs 13.0 / h) but not in DFW (4.5 vs 4.3 / h; difference within seed spread, 3 seeds).

## Reading
Sizing layer gaps to the reservation removes more than half of the coordination cost (explanation from the COORD1 diagnosis is supported), but not all of it: Houston still delays 8 %, Amazon 36-64 %, because Amazon's vertical transits cross every layer and Zipline in Houston still has residual conflicts (not diagnosed). My thresholds were too optimistic for Houston. Only 3 seeds per cell; differences of a few points are not resolved.
