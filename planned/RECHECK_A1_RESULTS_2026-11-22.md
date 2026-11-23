# RECHECK_A1 results (2026-11-22): six engine studies re-run with the engine fixes
Registration planned/RECHECK_A1_PREREG.md (fingerprint 466f9dbf…); runner planned/recheckA1_run.sh with planned/recheck_preload.js; analysis planned/recheck_compare.py; full table planned/recheck_a1_results_table.md; runs planned/raw/out_recheck_a1.tar.xz. All 378 runs completed (PRELAUNCH 246, PRELAUNCH2 27, AMZBAND 6, DFWBAD 51, DFWPROC 36, RTHREP 12).

**Summary: 1 of my 3 re-check predictions held (P3). One original verdict changed: DFWBAD B3 (return home with shared-out heights, 120 m vs own height ≥ 5×) is now a FAIL, at 4.2× (95 % 2.2–8.6; was 5.9×). The other 29 verdicts are unchanged. Two things I expected were wrong. Bounding the count to the measured window removes 5–8 %, not up to 6 %. And the exact off-plan flights mostly *lower* the off-plan conflict counts instead of raising them.**

## Registered predictions
| | Prediction | Result | Verdict |
|---|---|---|---|
| P1 | Cells with no off-plan event or height error (≥ 20 wide): every count within ±6 % | 40 cells, typically −5 % to −7 %, largest −8.3 % (DFWPROC part B, A0, d 3) | **FAIL** |
| P2 | Off-plan cells (≥ 10 wide): re-check ≥ original in at least two thirds | 3 of 13 went up (4 of 15 with the RTHREP cells, see deviation D1) | **FAIL** |
| P3 | At most 3 of 30 original verdicts change | 1 changed | PASS |

## Changed and moved figures (original → re-check)
| Study | Prediction | Original | Re-check |
|---|---|---|---|
| DFWBAD | B1 hover A0 vs A2 ≥ 4× | 7.6× PASS | 7.1× [4.1–13.1] PASS |
| DFWBAD | B2 hover A0 vs R ≥ 3× | 5.5× PASS | 4.6× [2.9–7.6] PASS |
| DFWBAD | **B3 return home A2, 120 m vs own ≥ 5×** | 5.9× PASS | **4.2× [2.2–8.6] FAIL** |
| DFWBAD | B4 return home R, 120 m vs own ≥ 4× | 7.8× PASS | 5.9× [2.8–14.4] PASS |
| DFWBAD | B5 area hold A0 vs A2 ≥ 3× | 23.6× PASS | 16.6× [4.2–142.7] PASS |
| DFWBAD | B6 hover A0 close calls per 100 < 3.93 | 3.18 PASS | 2.76 PASS |
| PRELAUNCH2 | Q1 A0 ≥ 3× R per 100 holds | 6.8× PASS | 6.9× PASS |
| PRELAUNCH2 | Q2 R < 3× A2 per 100 holds | 1.4× PASS | 1.2× PASS |
| PRELAUNCH2 | Q4 R < 3× A2 per held drone (outages) | 0.8× PASS | 1.3× PASS |
| RTHREP | H1 R-RTH120 ≥ 5× R-RTHOWN | 8.6× PASS | 9.1× PASS |
| RTHREP | H2 R-RTH120 rate ≥ 1.54 per 100 (COUNTFIX value) | 1.38 FAIL | 1.31 FAIL (the 1.54 is itself being re-checked in RECHECK_A2) |
PRELAUNCH (10 verdicts), AMZBAND (3) and DFWPROC (5): no verdict changed; every count fell by about 5–8 % (bounding only). Their percentages move by at most a point or two (table).

## What this means
- **The direction of the off-plan error was not what the review (and I) assumed.** The review's test, a 0 s hold of every flight, showed the old 1 s stationary steps *missing* meetings (207 vs 233). In these studies' 2-minute holds, outages and return flights, the old method mostly gave *more* meetings than the exact one. Examples: Houston hover A0 d 3, 177 → 142; DFW area hold A0, 47 → 33; DFW return at 120 m with shared-out heights, 55 → 42 (all including the 5–8 % bounding). A likely reason, not tested here: a drone that sits still and then jumps can cross the 30 m line several times during one encounter, and each crossing is counted as a new meeting. So the old method is biased in both directions, depending on how long drones stay close.
- **The bad-day conclusions survive, with smaller ratios.** Holding and area outages are still much worse with the current heights than with shared-out heights (DFW 7.1× and 16.6×; Houston 6.9× vs the high-return case). A common 120 m return height is still worse than returning at your own height (Houston R 9.1×; DFW R 5.9×; DFW A2 4.2×). But the DFW A2 ratio no longer clears the 5× I registered.
- **Bounding to the measured window lowers every count by 5–8 %** in these studies (HEADLINE2's 3–4 % was on the larger real layouts). Cuts and ratios barely move, because both sides of each comparison fall by about the same share.
- The runners' own feature checks with numeric constants from the old engine (PRELAUNCH K1–K3, PRELAUNCH2 K1 A0, DFWBAD K2, DFWPROC K2) give different numbers with the fixes on, as expected (registration: reported only). Checks that test the design (PRELAUNCH K2b, K3b, DFWPROC K1, RTHREP K1, AMZBAND K1) pass. DFWBAD K1 gives 23 %, the same as in the original run (a specification error logged then).

## Deviations
- **D1 (analysis classification error, found when reading the output).** recheck_compare.py marks a cell as off-plan by the field `kind`. RTHREP rows name the off-plan event in `arm` (rth-120 / rth-own) and have no `kind`, so its cells were scored under P1 instead of P2. Corrected: P1 loses one cell (RTHREP rth-120 d 3, −7.5 %); its largest change is still −8.3 %, FAIL. P2 gains two cells (rth-120 d 3, 67 → 62; d 4, 19 → 20): 4 of 15, FAIL. No verdict changes. The script is left as committed; this note is the correction.
