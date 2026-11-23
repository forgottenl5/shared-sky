# RECHECK_B2 results (2026-11-23): ERRORS1 and ERRORS2 with independent per-flight error streams, layouts unchanged
Registration planned/RECHECK_B2_PREREG.md (fingerprint in planned/RECHECK_B2_PREREG.md.sha256); runner planned/recheckB2_run.sh with planned/recheck_rng_preload2.js; analysis planned/recheck_compare_b.py (unchanged); table planned/recheck_b2_results_table.md; runs planned/raw/out_recheck_b2.tar.xz. All 512 runs completed (ERRORS1 276, ERRORS2 236; the run was stopped twice by a 2-hour limit and resumed unchanged).

**Summary: the test is valid this time (K3 PASS: all 72 no-error rows identical to the original). 1 of 3 predictions held (B3). One original verdict changed: ERRORS2 C4 is now a FAIL (DFW: shared-field errors at L2 give a 62 % cut vs 74 % for independent errors at L1, 12 points apart; registered ≤ 10). Four figures moved more than 10 points, all in DFW at the largest errors (L4) or in the height-error share.**

## Registered predictions
| | Prediction | Result | Verdict |
|---|---|---|---|
| B1 | Cuts in ERRORS1 E1–E5, E6a and ERRORS2 D1–D5 move ≤ 10 points | largest 19 (E6a DFW 54 → 73 %); also E4 DFW 23 → 9 %, D3 DFW 23 → 11 % | **FAIL** |
| B2 | Percentages in ERRORS2 C1–C5 move ≤ 10 points | largest 17 (C1 DFW L4 55 → 38 %) | **FAIL** |
| B3 | ≤ 3 of 23 verdicts change | 1 (ERRORS2 C4) | PASS |

## Figures (original → re-check)
| | Houston | DFW |
|---|---|---|
| Filed heights, cut at L0 / L1 / L2 / L3 / L4 (ERRORS1 E5) | 80 / 76 / 63 / 30 / 20 → 80 / 79 / 63 / 32 / 19 % | 81 / 79 / 59 / 26 / 23 → 81 / 80 / 59 / 27 / **9** % |
| Headline case, cut at L0 / L1 / L2 / L3 / L4 (ERRORS2 D5) | 72 / 71 / 60 / 32 / 22 → 72 / 74 / 62 / 32 / 20 % | 74 / 73 / 54 / 27 / 23 → 74 / 74 / 54 / 26 / **11** % |
| Share of the cut lost to height error alone (E6a) | 58 → 50 % | 54 → **73** % |
| Plan-check removal V2 at L0 / L2 / L4 (E7–E9) | 99 / 83 / 18 → 99 / 77 / 22 % | 98 / 77 / 22 → 98 / 80 / 22 % |
| V3 flown conflicts at L4 (E10) | 1 → 1 | 0 → 2 |
| Shared error field, L4, share 0 / 0.5 / 0.8 / 0.95 (C2) | 22 / 39 / 51 / 59 → 20 / 36 / 51 / 65 % | see table → 11 / 26 / 42 / 59 % |
| C4: L2 shared 0.8 vs independent L1 | 66 vs 71 → 69 vs 74 % | 66 vs 73 → **62 vs 74 % (FAIL)** |

## What this means
- **The overall picture stands.** Small errors (L1) barely matter; at L2 the cut drops to about 55–65 %; at L3–L4 most of the cut is gone; height error does most of the damage; the plan check with a margin (V3) still keeps flown conflicts near zero; a shared (correlated) error field hurts less than independent errors.
- **DFW at the largest errors is worse than published.** With independent errors the DFW cut at L4 is 9 % (filed heights) and 11 % (headline case), not 23 %. Houston is unchanged (19–20 %). A possible reason, not tested: the old streams gave flights from the same site similar errors, so they kept their spacing relative to each other.
- **Height error matters even more in DFW**: 73 % of the cut lost at L4 comes from height error alone (was 54 %).
- **C4 fails in DFW**: "a mostly shared error at L2 is about as good as independent L1" no longer holds there (12 points apart); it still holds in Houston (5 points).
- RECHECK_B (layouts also changed) moved some of the same figures in the same direction but less (E4 DFW 15 %, E6a 67 %); with 4–6 seeds, DFW L4 figures are noisy, so the 9–11 % should be read with that in mind.

## Deviations
- (none)
