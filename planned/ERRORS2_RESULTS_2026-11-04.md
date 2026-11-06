# ERRORS2 results (4 Nov 2026; registration planned/ERRORS2_PREREG.md, fingerprint 39edc4ae…)
Full tables: planned/errors2_results_table.md. 236 runs (Study D 60, C 144, E 32) plus the ERRORS1 A2 rows; checks K1-K5 passed before the runs. One logged deviation (resumed on the faster engine, identical counts verified). 

**10 of 10 predictions passed. The 72 % / 74 % headline case loses its cut with GPS error the same way as ERRORS1's filed-heights case, and when most of the error is shared by nearby drones, as the GPS and barometer physics suggests, most of the cut comes back: only each drone's personal error matters.**

## Predictions
- **D1 PASS** headline-case cut at L1 (best-site GPS): Houston 71 %, DFW 73 % (no errors on these seeds: 72 %, 74 %).
- **D2 PASS** at L2 (GPS standard average): 60 %, 54 %.
- **D3 PASS** at L4 (Remote ID size): 22 %, 23 %.
- **D4 PASS** share of the no-error cut kept matches the filed-heights case (ERRORS1) within 0.15: L2 0.83 vs 0.79 (Houston), 0.73 vs 0.72 (DFW); L4 0.31 vs 0.25, 0.31 vs 0.29.
- **D5 PASS** the cut never rises step to step: Houston 72, 71, 60, 32, 22; DFW 74, 73, 54, 27, 23.
- **C1 PASS** a shared field plus the personal part gives the same cut as the personal part alone (rho 0.8, seeds 1-4): 64 vs 64 %, 65 vs 65 %, 52 vs 52 %, 55 vs 55 %; the conflict counts differ by at most 2.
- **C2 PASS** the cut rises with the shared share: Houston L2 60, 63, 66, 75 %; DFW L2 54, 61, 66, 73 %; Houston L4 22, 39, 51, 59 %; DFW L4 23, 37, 53, 66 %.
- **C3 PASS** at L4, 95 % shared adds 37 (Houston) and 43 (DFW) points.
- **C4 PASS** L2 with 80 % shared (66 %, 66 %) is within 10 points of L1 (71 %, 73 %).
- **C5 PASS** L2 with 95 % shared (75 %, 73 %) is within 6 points of no errors (72 %, 74 %).

## Reading
- For separation, what counts is the error between nearby drones, not each drone's absolute error. If 80-95 % of the error is shared (the same satellites and air pressure), the average-GPS cut is 66-75 %, close to the no-error 72-74 %.
- How much is shared on real delivery drones is not measured; the sweep shows that it decides the result. ERRORS1's independent-error figures are therefore the pessimistic end.
- All ten predictions passing is partly because several bands were wide (C4 allowed 10 points, D4 0.15); this study is a weaker test than ERRORS1.

## Limits
- Shared share swept, not measured; correlation length and time assumed (irrelevant at drone spacing, C1). Plan check not rerun with shared errors. No avoidance. 6 seeds (4 for the equivalence arms).

## Deviation log
See the registration (resumed on the faster engine; identical counts verified).
