# Amazon at today's reported volume, both metros (written 2026-10-25 before any study run)
Status: behaviour model of planned operations; no plan check; wide meetings between companies, still air. Not a forecast or safety assessment.

## Why
Every build-out study ran Amazon at its filed cap (1,000 flights a day per site). Amazon told Richardson council (9 Mar 2026) it flies about 150-250 flights a day there (secondary report; see GEMINI_OUTSIDE_DATA_CHECK_2026-10-25.md). So the build-out tables put Amazon at roughly five times its reported rate. This study asks how much of the conflict picture, and of the benefit of sharing heights out, survives when Amazon flies at 20 % of cap (200 a day, the midpoint of 150-250). Wing and Zipline volumes are unchanged: no current figure for them is public.

## Design
- Both metros (standing rule: everything for Houston and DFW). Sites, stages, seeds' site layouts and heights exactly as BUILDOUT (Houston) and DFWBUILD (DFW): stages early / mid / full, arms A0 (Omaha profile), R (high-return, staff remark), A2 (shared out).
- Amazon volume: **cap** (stage volume as registered) and **v20** (Amazon site rates multiplied by 0.2; Wing and Zipline untouched).
- No plan check, still air. Seeds 1-6 (twice the earlier studies, since v20 counts are small). 2 metros x 3 stages x 3 arms x 2 volumes x 6 seeds = 216 runs, 2 measured hours each (1 h warm-up).
- Runner planned/todayvol_run.js, analysis planned/todayvol_analyze.py. Output per run: wide and close counts and per-pair wide counts.

## Predictions (pooled over seeds, full stage, both metros each)
- **T1:** Omaha profile (A0): wide meetings at v20 are <= 50 % of cap. PREDICTION: holds (Amazon pairs dominated at cap and lose 80 % of Amazon flights).
- **T2:** Wing-Zipline wide meetings are the same at cap and v20 (within 15 %). PREDICTION: holds (their flights are not touched).
- **T3:** Sharing out (A2) still cuts A0 by >= 50 % at v20. PREDICTION: holds.
- **T4:** Amazon-involved pairs are < 50 % of A0 wide meetings at v20 (they were 68 % at cap in DFW). PREDICTION: holds.
- **T5:** At v20 the mid stage Omaha profile is <= 1.5 meetings an hour in DFW and <= 3 in Houston (cap: 3.0 and 6.3). PREDICTION: holds.
- Reported: all cells with exact Poisson 95 % intervals on counts; per-hour rates.

## Rules
No changes after the data is in; runner and analysis committed before runs; deviations logged below.
- **K1:** site counts per stage as registered; v20 Amazon site rates are exactly 0.2 x cap rate and Wing/Zipline rates identical. **K2:** with v20, the Wing and Zipline flight lists are identical to cap for the same seed (informational; a mismatch is logged and T2 then read with care).

## Deviation log
(none yet)
- (Appended after fingerprint da410b67…; pre-study check only.) K1 PASS for both metros and all stages. K2: NO, the Wing and Zipline flight lists are not identical between cap and v20 (the flight generator shares one random stream across sites, so changing an Amazon rate reshuffles later draws). Nothing changed. T2 is therefore a comparison of two independent samples: a 15 % band may be missed by chance alone, and a miss will be read that way.
- (Appended after the runs.) The analysis script's interval function overflowed on counts above ~300 (power of mu); replaced by a log-gamma form. No data or prediction changed; the first aborted print shows the same DFW numbers.
