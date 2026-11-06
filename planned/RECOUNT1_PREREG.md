# RECOUNT1: the Houston area-outage ratio at 4 checks per second (written 2026-10-29 before any run)
Status: re-count of an existing study. The Houston page quotes "7.0× fewer (4.1–13.0), counted once per second, 3 km spacing only" from OUTAGE (22 Oct), which predates COUNTFIX's 4-checks-per-second counting. The 28 Oct review flagged it. (The other old figure on the page, 83/82/80 % at 4/3/2 km, does not need a new run: PRELAUNCH S3a already counted 4 and 3 km at 4 checks per second, 83 % and 80 %, with 30 and 15 seeds; the page will quote that instead and keep 2 km labelled as old counting.)

## Method
- planned/outage.js unchanged (20 area outages per run, radius 2 km, 120 s hover, d = 3 km, Houston test patch), arms OUT-A0 (filed heights) and OUT-A2 (shared out), plan check as in OUTAGE.
- Counting with houston2.js `count(fin, { sub: 4 })` (COUNTFIX convergence choice) and, for the check K1, `sub: 1`.
- Seeds 22-24 (OUTAGE's seeds) and, as a wider set, 22-31.
- Measure: cross-operator wide meetings per 100 held drones in each arm, and the ratio OUT-A0 / OUT-A2, with a 95 % interval from the Poisson counts (same method as OUTAGE's 4.1-13.0, computed by the committed analysis).

## Predictions
- **R1:** at 4 checks per second, seeds 22-24, OUT-A0 still gives >= 3 times OUT-A2 per held drone (OUTAGE's O1 threshold).
- **R2:** the ratio at 4 checks per second, seeds 22-31, lies between 4 and 14.
- **R3:** counts per held drone at 4 checks per second are higher than at 1 check per second in both arms (finer sampling finds more short crossings).

## Rules
No changes after the data is in; runner and analysis committed before runs; at most two fix attempts on a failing feature check; deviations logged below.
- **K1:** with sub 1 and seeds 22-24, the runner reproduces OUTAGE's pooled counts (OUT-A0 106 cross wide, OUT-A2 15; held drones 2208 for OUT-A0) exactly.

## Deviation log
(none yet)
