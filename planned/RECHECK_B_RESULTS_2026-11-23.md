# RECHECK_B results (2026-11-23): not the registered test; reported as a robustness check
Registration planned/RECHECK_B_PREREG.md (fingerprint 82addfdc…); runner planned/recheckB_run.sh; analysis planned/recheck_compare_b.py; table planned/recheck_b_asrun_results_table.md; runs planned/raw/out_recheck_b_asrun.tar.xz. All 512 runs completed (ERRORS1 276, ERRORS2 236).

**Summary: the registered check K3 failed, so this is not the test I registered.** The generator I replaced is also used to place the real sites (lab/city.js), so every run here had a different random site layout as well as independent error streams (deviation D1). The question "does correlated per-flight error change the results?" is re-asked properly in RECHECK_B2.

What the runs do show, as a robustness check (new layouts and new error streams together):
- **No verdict changed** (0 of 23; B3 PASS). ERRORS1 is still 10 of 13 (E2, E3, E4 FAIL), ERRORS2 still 10 of 10.
- **B1 FAIL, B2 FAIL** as scored: two figures move more than 10 points. ERRORS1 E6a (share of the cut lost to height error alone, DFW) 54 % → 67 %; ERRORS2 C1 (DFW, L4, shared share 0.8) 55 % → 43 %. Every other cut moves by at most 8 points (DFW L4 cut 23 % → 15 %).
- Because layouts also changed, these moves cannot be attributed to the error streams. They do show how much these percentages move between random layouts with only 4–6 seeds, which is larger than the ±10 points I assumed for the error streams alone.

## Deviations
- D1 is in the registration's deviation log.
