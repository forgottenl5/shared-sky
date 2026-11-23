# Re-check B2: ERRORS1 and ERRORS2 re-run with independent per-flight error streams, layouts unchanged (written 2026-11-23 before any B2 run)
Status: corrected repeat of RECHECK_B (planned/RECHECK_B_PREREG.md, deviation D1); no new arms. Runners and analysis scripts used unchanged.

## Why
RECHECK_B replaced `L.rng` everywhere. lab/city.js `sites()` also draws from it, so the site layouts changed too and K3 (no-error rows identical) failed. Its results mix new layouts with new error streams. I have seen those results (planned/RECHECK_B_RESULTS_2026-11-23.md: no verdict changed; E6a DFW 54 → 67 %, C1 DFW L4 55 → 43 %; other cuts within 8 points), so the predictions below are written knowing them.

Fix: planned/recheck_rng_preload2.js replaces `L.rng` only for calls made from errors1_run.js and errors2_run.js (their `errs()` and `field()`, which make the per-flight error draws and the shared error field). Every other caller gets the original generator. Test: planned/test_recheck_rng_preload2.js (a call from another file gets the original LCG; layouts deterministic).

## Design
Same as RECHECK_B: all 276 ERRORS1 and 236 ERRORS2 runs, unchanged runners, `RECHECK_RNG=on` with the new preload, shadow root ../recheck_b2 (planned/recheckB2_run.sh). Analysis: planned/recheck_compare_b.py, unchanged, on the new shadow root. Original verdicts: ERRORS1 10 of 13, ERRORS2 10 of 10.

## Predictions
- **B1:** Every reported cut in ERRORS1 E1–E5, E6a and ERRORS2 D1–D5 moves by at most 10 points. PREDICTION: holds.
- **B2:** Every percentage in ERRORS2 C1–C5 moves by at most 10 points. PREDICTION: holds.
- **B3:** At most 3 of the 23 original verdicts change. PREDICTION: holds.
- Reported, not predicted: every changed verdict and every percentage moving more than 10 points; the public figures (findings §1b and method lines) are replaced by the B2 values whatever the verdicts.

## Rules
Preload, runner and test committed before any B2 run; no changes after the data is in; deviations logged below.
- **K1:** with `RECHECK_RNG=off`, the two timing rows reproduce the stored rows exactly.
- **K2:** with `RECHECK_RNG=on`, the Study A row (A2 L3, has errors) differs from the stored row, and the Study B row's plan-check fields (n, delayed, cancelled, meanD), which see no errors, are identical to the stored row (same layout).
- **K3:** every no-error (L0) row is identical to the original (checked by the analysis). If K3 fails, B2 is not a valid test and is reported as such.

## Deviation log
(none yet)
- (Appended after fingerprint 3179eb05…; pre-study checks only.) K1 PASS (wrapper off reproduces both stored rows). K2 PASS (Study A row changes, v10 117 → 129; Study B plan-check fields identical). test_recheck_rng_preload2 2/2.
