# Re-check A1: six engine studies re-run with the engine fixes of 22 Nov 2026 (written 2026-11-22 before any re-check run)
Status: re-run of registered studies; no new arms. Runners and analysis scripts of the six studies are used unchanged.

## Why
An outside review of the engine (planned/REVIEW_EXTERNAL_2026-11-21.md) found three counting problems, now fixed as opt-in options in lab/lab_engine.js (tested in lab/test_fixes.js, 15/15):
1. **Off-plan flights undercounted (FIX1, `fix.exact`).** Holds, return-home and area outages rebuilt each affected flight as 1 s stationary steps, which the 4-per-second counter sees as jumps. On a test patch a 0 s hold of every flight, which should change nothing, lowered wide conflicts from 233 to 207.
2. **Correlated random errors (FIX2, `fix.hashRng`).** Per-flight height errors (`zsig`) came from linearly seeded streams that are correlated between neighbouring flight ids (|r| up to 0.76) and repeat across seeds.
3. **Counting past the window (FIX3, `fix.bounded`).** `run()` counted meetings after the 2-hour measured window ended (HEADLINE2 found this changes counts by 3–4 %).

These six studies call `run()` and are affected by 1, 3 or both (PRELAUNCH S2 also by 2). Their verdicts appear on the public findings page and the city pages' bad-day scenarios. The older studies that use the research modules (DEVIATE, DEVA0, RTH, OUTAGE, COUNTFIX, RECOUNT1) need FIX1 ported first and are a separate registration (A2). ERRORS1 and ERRORS2 are re-check B.

## Design
- Studies: PRELAUNCH (246 runs), PRELAUNCH2 (27), AMZBAND (6), DFWBAD (51), DFWPROC (36), RTHREP (12): 378 runs, every original arm, seed and setting.
- Each runner is run unchanged, with `planned/recheck_preload.js` loaded first, which adds `fix: {exact: true, bounded: true, hashRng: true}` to every `run()` call. Runs go to a separate shadow root (`planned/recheckA1_run.sh`); the original `out/` is not touched.
- Each study's own analysis script, unchanged (including constants it copied from earlier studies), is run on the original and on the re-check runs. `planned/recheck_compare.py` pairs the verdict lines in order and tabulates pooled counts per cell.
- Original verdicts (analysis scripts on the stored runs, checked 22 Nov against the results files): 26 PASS, 4 FAIL of 30 (PRELAUNCH 9/1, PRELAUNCH2 4/0, AMZBAND 3/0, DFWBAD 6/0, DFWPROC 3/2, RTHREP 1/1).

## Predictions
- **P1:** In cells with no off-plan event and no height error, only bounding applies: every pooled wide count with at least 20 original events changes by at most ±6 %. PREDICTION: holds.
- **P2:** In off-plan cells (hold, outage, return home) with at least 10 original wide events, the exact deviations add more than bounding removes: the re-check count is at least the original in at least two thirds of the cells. PREDICTION: holds.
- **P3:** At most 3 of the 30 original verdicts change. PREDICTION: holds.
- Reported, not predicted: every changed verdict; the new per-event ratios behind the site's bad-day figures; each runner's own feature checks re-run with the fixes on (their constants come from the old engine, so differences there are expected and are only reported).

## Rules
Runner, preload and analysis committed before any re-check run; no changes after the data is in; deviations logged below. Every changed verdict is reported in the results file, and a changed verdict replaces the original on the public pages (with the original kept and labelled).
- **K1:** with the preload loaded but the fixes off, AMZBAND and RTHREP re-run row-for-row identical to the stored runs (the wrapper itself changes nothing).
- **K2:** with the fixes on, one hold run (filed heights, d 4, seed 19, plan check on) gives different counts from the same run with fixes off (the fixes reach the runners).
- **K3:** the study analysis scripts on the stored runs reproduce the published verdicts (26/4; done before writing).

## Deviation log
(none yet)
- (Appended after fingerprint 466f9dbf…; pre-study checks only.) K1 PASS: with the wrapper loaded and fixes off, AMZBAND (6 rows) and RTHREP (12 rows) re-ran identical to the stored rows. K2 PASS: hold, filed heights, d 4, seed 19 gives 20 wide / 3 close / 846 events with fixes off and 19 / 5 / 846 with fixes on. K3 PASS (26/4, before writing).
- (Appended after the runs, 22 Nov.) D1: recheck_compare.py classifies off-plan cells by the field `kind`; RTHREP rows carry the event in `arm`, so its cells were scored under P1 instead of P2. Corrected scores in RECHECK_A1_RESULTS_2026-11-22.md; no verdict changes (P1 and P2 FAIL either way). Script left as committed.
