# Re-check B: ERRORS1 and ERRORS2 re-run with independent per-flight error streams (written 2026-11-22 before any re-check run)
Status: re-run of registered studies; no new arms. Runners and analysis scripts used unchanged.

## Why
The review (planned/REVIEW_EXTERNAL_2026-11-21.md) found that the per-flight error draws in ERRORS1 and ERRORS2 come from the engine's LCG seeded with `seed * 7919 + id * 31 + k`. Streams for neighbouring flight ids start from nearby seeds and are strongly correlated (|r| up to 0.76 between neighbouring ids for the same draw; lab/test_fixes.js). The study assumed independent errors per flight ("independent errors are the pessimistic end"), so its error model was not what was registered. Flight ids are numbered by site and time, so drones from the same site get similar errors. This could push results either way.

Fix: `planned/recheck_rng_preload.js` replaces `L.rng(s)` with `L.hrng(s, 0x5eed)` (sfc32, 128-bit state, seeded from hashes; neighbouring ids independent, |r| 0.014 in lab/test_fixes.js). In these runners `L.rng` is used only for the error draws and the shared error field; the engine's layout and traffic use its internal generator, so sites and flights are unchanged and only the error draws change. With seeds 1–6 the runners' seed formula has no repeats.

## Design
- ERRORS1: all 276 runs (Study A: A0/A2, levels L0–L4 and one-error arms; Study B: plan-check arms), both metros.
- ERRORS2: all 236 runs (Study D: S1 at L0–L4; Study C: shared-field shares 0.5/0.8/0.95; Study E: personal part only).
- Run unchanged with the preload (`RECHECK_RNG=on`) in a shadow root with its own copy of planned/ (`planned/recheckB_run.sh`), about 11 CPU hours.
- The analysis scripts, unchanged, on original and re-check runs; `planned/recheck_compare_b.py` pairs verdicts and percentages.
- Original verdicts (scripts on the stored runs, checked 22 Nov): ERRORS1 10 of 13 PASS (E2, E3, E4 FAIL), ERRORS2 10 of 10 PASS.

## Predictions
- **B1:** Every reported cut in ERRORS1 E1–E5 and E6a and in ERRORS2 D1–D5 moves by at most 10 points. PREDICTION: holds. (The correlation runs between flights from the same site; flights that meet are mostly from different sites, so the effect on conflicts should be small.)
- **B2:** Every percentage in ERRORS2 C1–C5 moves by at most 10 points. PREDICTION: holds.
- **B3:** At most 3 of the 23 original verdicts change. PREDICTION: holds.
- Reported, not predicted: every changed verdict and every percentage that moves more than 10 points; the public figures (findings §1b and the method lines) are replaced by the re-check values whatever the verdicts.

## Rules
Preload, runner and analysis committed before any re-check run; no changes after the data is in; deviations logged below.
- **K1:** with the preload loaded but `RECHECK_RNG=off`, the runner's two timing jobs (Study A Houston A2 L3 seed 1; Study B Houston V3 L4 seed 1) reproduce the stored rows exactly (all fields but wall time).
- **K2:** with `RECHECK_RNG=on` both rows differ from the stored ones.
- **K3:** rows with no errors (level L0, no shared field) do not use the error streams and must be identical to the original (checked in the analysis, all rows).
- **K4:** the analysis scripts on the stored runs reproduce the published verdicts (done before writing).

## Deviation log
(none yet)
- (Appended after fingerprint 82addfdc…; pre-study checks only.) K1 PASS: with RECHECK_RNG=off both timing rows reproduced the stored rows exactly. K2 PASS: with RECHECK_RNG=on both rows differ. The first run of the study was stopped by a 2-hour limit after all 276 ERRORS1 runs and 12 ERRORS2 runs; it was restarted unchanged and the runners resumed.
- **D1 (after the data was in; the study as run is not the registered test).** Check K3 FAILED: 0 of 72 rows with no errors (L0) were identical to the original. Cause: lab/city.js `sites()` (the real-site layouts used by houreal.js and dfwreal.js) also draws from `L.rng`, so replacing `L.rng` everywhere changed the site layouts as well as the error draws. The statement above that "in these runners L.rng is used only for the error draws" was wrong; I did not check the modules the runners load. K2 should have caught it (the Study B plan check sees no errors, yet its delayed/cancelled counts changed) but was written only as "the rows differ". So RECHECK_B compares the original runs with runs on **different random site layouts and** independent error streams; any change mixes the two. Its scores are reported in planned/RECHECK_B_RESULTS_2026-11-23.md as a robustness check only. The registered question is re-asked in RECHECK_B2 (planned/RECHECK_B2_PREREG.md), with the replacement limited to the ERRORS runners' own calls.
