# Coordination cost versus demand (density sweep), both metros (written 2026-10-27 before any DENS1 run)
Status: behaviour model, same engine and plan check as COORD1/COORD2 (lab/lab_engine.js, planned/coord.js). Not a forecast or safety assessment.

## Why
COORD1/COORD2 measured the cost of F3548-style coordination at one demand level (the full filed build-outs). Two things are missing for an outside reader: (1) an analytic baseline, and (2) a comparison with published work. The simplest baseline is the gas model: with no coordination, conflicts between independent traffic scale with the square of demand. The closest published delay results (Airbus/EUROCONTROL, Riga, DASC 2023; strategic deconfliction by departure delay only) report delay rising steeply with demand and throughput collapsing at high demand. Their model differs (one altitude, hub-and-spoke, synthetic demand), so the comparison is of shape, not numbers.

## Question
How do flown conflicts (no coordination) and the delay and cancellation cost of V2 coordination grow as demand scales from a quarter to twice the filed build-outs?

## Inputs
- As COORD1/COORD2: layouts, profiles, window, wind hours (p90, persistence forecast), seeds 1-3, both metros, V2 volumes.
- **Demand scale k in {0.25, 0.5, 1.5, 2}:** every site's flight rate is multiplied by k (lab_engine OP rates x k; sites, paths and heights unchanged). k = 1 is taken from COORD1 (A2) and COORD2 (G20) runs, not rerun.
- Heights A2 and G20; arms NONE and V2. 96 new runs.

## Measures
Per metro, heights, arm, k (mean over seeds): flown cross-company planned conflicts per hour; V2 delayed share, cancelled share, mean delay of delayed flights.
Exponent b: least-squares slope of log(conflicts/h) on log(k) over k in {0.25, 0.5, 1, 1.5, 2}.

## Predictions
- **D1 (gas-model baseline):** with no coordination, b is between 1.7 and 2.3 in all four metro x heights cells.
- **D2:** V2 delayed share at k = 2 is >= 2 x its value at k = 1 (A2, both metros).
- **D3:** G20's V2 delayed share is below A2's at every k, both metros.
- **D4:** V2 cancelled share with A2 at k = 2 is >= 3 % in Houston.
- **D5 (shape, vs Riga):** V2 mean delay of delayed flights increases with k at every step (monotone) in all four cells.
- **D6:** flown planned conflicts under V2 stay <= 1 / h at k = 2 in all four cells.

## Rules
- **K1:** planned/test_coord.js passes. **K2:** the runner at k = 1 (V2, A2, Houston, seed 1) reproduces COORD1's run exactly (same delayed count, cancelled count, and flown planned conflicts).
- Runner and analysis committed before runs. No changes after the data. At most two fix attempts on a failing check. Deviations logged below.

## Deviation log
(none yet)
(Appended after fingerprint, 27 Oct 2026, after the first pass of runs; nothing above this line changed.)
- **Interruption:** the container restarted after 19 of 96 runs; the runner resumed from its saved results (no change to method).
- **Deviation 1 (analysis input):** COORD2's saved runs have no mean-delay field, so D5 could not be computed at k = 1 for G20. Fix: the runner gained a `k1` mode that reruns G20 + V2 at k = 1 with its own code and keeps a run only if delayed count, cancelled count and flown conflicts match COORD2 exactly; the analysis then prefers those records for that cell. No threshold changed.
- **Deviation 2 (runner bug, fix attempt 1 of 2):** the k1 identity check failed for DFW and exposed a bug: the runner set every site's rate to lab_engine's default rate x k, overwriting the DFW Zipline site rate (400 per site per day from the DFW EA, planned/dfwreal.js) with the default (950 per day). Houston has no site-specific rates and was unaffected (k1 identity check passed for all three Houston seeds). K2 had only checked Houston, so it did not catch this. Fix: rate = (site rate, else default) x k; K2 extended to both metros. All 48 DFW runs from the first pass are quarantined in out/dens1_quarantine/ (kept, not analysed) and rerun; the 48 Houston runs are kept.
