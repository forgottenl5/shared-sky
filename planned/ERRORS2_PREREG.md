
# ERRORS2: the headline case under errors, and errors shared by nearby drones (registration, 4 Nov 2026)

Status: registered before any run of the experimental arms. The pre-run checks K1-K5 (below) passed first; one timing run (Study C, Houston S1, L4, rho 0.8, seed 1) was run to time the job, its output was not read, and the same job is recomputed in the full run.

## Why
ERRORS1 measured the height-sharing cut against the heights the companies filed (A0), which is 80 % / 81 % without errors. The published headline (72 % Houston, 73 % DFW, 10 seeds) is measured against Amazon at its best-sourced heights (S1) and was not run with errors. ERRORS1 also gave every drone an independent error. Two drones in the same place see the same satellites and the same air pressure, so most of their error is shared, and only the difference between them matters for separation. This study (D) runs the headline case at the ERRORS1 levels and (C) splits each error into a shared and a personal part.

## Sources for the split
- Barometer: Bosch BMP390 product page (a common drone-class pressure sensor): absolute accuracy +-0.50 hPa (about +-4 m between two sensors), relative accuracy +-0.03 hPa (about +-25 cm). Weather changes of pressure are common to nearby sensors.
- GPS: differential-GPS literature (for example Gilbert, "GPS Consumer Series: Differential Correction Over Large Distance", Earth Observation Magazine, Nov 1995): the error that is not common to two receivers grows by about 1-20 parts per million of their separation, because the signal paths through the ionosphere and troposphere are nearly identical. At drone spacings (tens of metres) the satellite and atmosphere errors are essentially fully shared; what remains personal is receiver noise, multipath and sensor offsets.
- I found no published split for delivery drones. The shared share of the error variance (rho) is therefore swept: 0.5, 0.8, 0.95. The barometer's sensor-to-sensor figure (+-4 m) is about the ERRORS1 L1 height level.

## Error model
Levels L0-L4 exactly as ERRORS1 (95 % sideways / 95 % height / late-start sigma: 0/0/0, 3 m/4 m/5 s, 8/13/15 s, 15/33/30 s, 30.48/45.72/60 s). In Study C each sideways and height error has total variance as at its level, split into a shared part (variance rho) and a personal part (variance 1 - rho). The personal part is per flight and constant within it (the ERRORS1 draws, scaled by sqrt(1 - rho)). The shared part is a smooth random field over place and time (24 random cosine modes per component, Gaussian correlation, correlation length 20 km and correlation time 30 min, both assumptions), tabulated on a 500 m x 150 s grid and interpolated, and added to every aircraft at that place and time. Late starts stay personal at the level's size.

## Studies
- **Study D (headline case).** HEADLINE2 layouts, arms S1 (Amazon at best-sourced heights) and A2 (shared-out heights), levels L0-L4, seeds 1-6, both metros. Only S1 is run here; the A2 rows are the ERRORS1 rows (same seeds, same draws; check K2). Cut = 1 - (A2 v10 / S1 v10), pooled over seeds, as the headline. Without errors on these seeds (HEADLINE2): 72 % Houston, 75 % DFW.
- **Study C (shared errors).** Arms S1 and A2, total sizes L2 and L4, rho 0.5, 0.8, 0.95, seeds 1-6, both metros.
- **Study E (equivalence).** Arms S1 and A2, L2 and L4, rho 0.8, personal part only (no shared field), seeds 1-4: if the field is shared at drone spacings, only the personal part should matter.
236 runs.

## Predictions (each applies to both metros; it passes only if it holds in both)
- **D1:** at L1 the headline-case cut is at least 60 %.
- **D2:** at L2 it is between 40 % and 65 %.
- **D3:** at L4 it is below 30 %.
- **D4:** at L2 and at L4, the share of the no-error cut that is kept (cut at the level / cut at L0) is within 0.15 of the same share in ERRORS1's filed-heights comparison.
- **D5:** the cut does not rise by more than 3 points at any step L0 to L4.
- **C1:** at rho 0.8 (seeds 1-4) the cut with the shared field is within 5 points of the cut with the personal part only, at L2 and at L4.
- **C2:** at L2 and at L4 the cut does not fall by more than 3 points at any step as rho rises 0 (Study D) to 0.5, 0.8, 0.95.
- **C3:** at L4, rho 0.95 gives a cut at least 25 points higher than independent errors (Study D at L4).
- **C4:** at L2, rho 0.8 gives a cut within 10 points of independent errors at L1.
- **C5:** at L2, rho 0.95 gives a cut within 6 points of no errors (L0).

(My predictions held 77 % of the time over the scorecard, and in ERRORS1 my misses were too pessimistic; I expect to miss some of these.)

## Checks (K), run before the experimental arms
- K1: with no errors, S1 reproduces HEADLINE2 exactly (v10, v15, v20, close), Houston and DFW, seed 1.
- K2: A2 at L2, Houston, seed 1 reproduces the ERRORS1 row exactly (same draws).
- K3: a zero shared field changes nothing (the engine change, `opts.field` in lab/lab_engine.js, is inert by default).
- K4: the shared field has standard deviation within 25 % of the intended value (one field, 24 modes), correlation above 0.999 at 30 m and between 0.3 and 0.9 at 20 km (Gaussian: 0.61).
- K5: the tabulated field is within 0.01 sigma of the exact formula (first tried on a 300 s grid: 0.017 sigma, failed; the grid was refined to 150 s before registration).

## Limits stated in advance
- The shared share is not measured for any company's drones; the sweep shows how much it matters, not where reality sits. The correlation length and time are assumptions; at drone spacings they barely matter (K4).
- The plan-sharing check (ERRORS1 Study B) is not rerun with shared errors.
- No avoidance manoeuvres; counts are plan overlaps, not collisions. 6 seeds (4 for equivalence arms).

## Deviation log
(none yet)
- 4 Nov 2026: both shards were stopped by the 2-hour background limit at 118 of 236 runs and resumed (finished jobs are skipped). The resumed shards load the faster engine (commit "Engine: faster count()"), which gives identical counts (lab/bench_count.js: DFW seed 1, L0 and L2) and, for this study's shared-error field, reproduced a finished row exactly (Study C, Houston A2, L2, rho 0.5, seed 1: v10/v15/v20/close 38/67/117/8 both). No result changes.
