# Re-check A2: COUNTFIX and RECOUNT1 re-run with exact deviations and a bounded count (written 2026-11-22 before any re-check run)
Status: re-run of registered studies; no new arms. Runners and analysis scripts used unchanged.

## Why
Same review as RECHECK_A1 (planned/REVIEW_EXTERNAL_2026-11-21.md). The research modules (planned/deviate.js, rth.js, outage.js) rebuild an off-plan flight as 1 s stationary steps. **Counted once per second this is exact** (each step sits where the flight is at that check), so DEVIATE, DEVA0, RTH and OUTAGE, which counted once per second, are not affected by this problem. Their known limitation, that once per second misses fast crossings, is what COUNTFIX and RECOUNT1 addressed. Counted 4 times per second, the steps look like jumps of up to ~30 m, and the off-plan flights are undercounted. COUNTFIX (hold and return-home arms) and RECOUNT1 (area outages) counted 4 times per second and are affected. All houston2.js counts also ran past the 2-hour window (3–4 % in HEADLINE2).

Fix (opt-in, default unchanged): planned/exact_dev.js ports the engine's exact deviations (split the flight's own segments, add the new legs as segments) and is used by deviate.js, rth.js and outage.js when `SKY_EXACT_DEV=1`. houston2.js `count` stops at the end of the measured window when `SKY_BOUND=1` (or `opts.tEnd`). Tests: planned/test_exact_dev.js (9/9: a 0 s exact hold of every flight leaves 1-per-second counts identical; exact hold/land/return-home have no jumps and the right timing; bounded count equals an explicit window end and is never higher).

## Design
- COUNTFIX: all 42 runs (valloc A0/A2 and proc P2 at d 3, 4, seeds 1–3; dev HOLD-A0/HOLD-A2 and rth RTH-OWN/RTH-120 at d 3, 4, seeds 19–21), 4 checks per second as in the study.
- RECOUNT1: all 26 runs (OUT-A0/OUT-A2: 1 check per second seeds 22–24; 4 per second seeds 22–31).
- Both with `SKY_EXACT_DEV=1 SKY_BOUND=1`, in a shadow root with its own copy of planned/ (`planned/recheckA2_run.sh`); the original out/ and results files are not touched.
- The two analysis scripts, unchanged, are run on original and re-check runs; `planned/recheck_compare_a2.py` pairs verdict rows and tabulates pooled counts per cell.
- Original verdicts (scripts on the stored runs, checked 22 Nov against the results files): COUNTFIX U1–U4 all PASS; RECOUNT1 R1–R3 all PASS, K1 PASS. Seven prediction verdicts.

## Predictions
- **Q1:** COUNTFIX cells without deviations (valloc, proc) with at least 20 original wide events: only bounding applies, every pooled wide count within ±6 %. PREDICTION: holds.
- **Q2:** Deviation cells counted 4 times per second (COUNTFIX HOLD-A0, HOLD-A2, RTH-OWN, RTH-120; RECOUNT1 OUT-A0, OUT-A2 at 4 per second) with at least 10 original wide events: the re-check count is at least the original in at least two thirds of them. PREDICTION: holds.
- **Q3:** At most 2 of the 7 original prediction verdicts change. PREDICTION: holds.
- Reported, not predicted: every changed verdict; RECOUNT1 at 1 check per second (here the exact hold hovers where the drone is at the hold time, half a second of flight from the old hover point, so it is not a bounding-only cell); RECOUNT1's K1, whose constants come from the old count and are expected to change; the new COUNTFIX ratios that later studies copied (RTHREP H2's 1.54 per 100, DFWBAD's bracketed COUNTFIX values).

## Rules
Code, runner and analysis committed before any re-check run; no changes after the data is in; deviations logged below. Changed verdicts are reported in the results file and on the public pages, with the originals kept and labelled.
- **K1:** with the fixes off, the shadow root reproduces stored results exactly: COUNTFIX dev HOLD-A2 d 3 seed 19 (all fields but wall time) and RECOUNT1 1 check per second seed 22.
- **K2:** planned/test_exact_dev.js passes, and the modules' existing tests (test_deviate, test_rth, test_outage, test_countfix_k3, test_deva0) pass with defaults.
- **K3:** the analysis scripts on the stored runs reproduce the published verdicts (done before writing).

## Deviation log
(none yet)
- (Appended after fingerprint 2395ddbc…; pre-study checks only.) K1 PASS: with the fixes off the shadow root reproduced COUNTFIX dev HOLD-A2 d 3 seed 19 and RECOUNT1 sub 1 seed 22 exactly. K2 PASS: test_exact_dev 9/9; with defaults test_deviate 5/5, test_rth 4/4, test_outage 3/3, test_countfix_k3 PASS, test_deva0 3/3. K3 PASS (COUNTFIX U1–U4 and RECOUNT1 K1, R1–R3 reproduced).
