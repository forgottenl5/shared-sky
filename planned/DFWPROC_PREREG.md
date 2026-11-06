# DFW: what the plan check costs, and whether height sharing holds at other traffic levels (study, written 2026-10-25 before any code or run)
Status: behaviour model of filed operations (planned tracks only). Not a forecast or safety assessment.

## Why
The DFW page's "What does the plan check cost?" and "Does it hold at other traffic levels?" sections show Houston results (PRELAUNCH2 / PROC / FLEET; VALLOC). Page audit PAGEAUDIT_2026-10-25 flagged them. Same tests with the DFW mix.

## Setup
Lab layout as DFWBAD (cfg half 22 km, zone 6 km, 3,600 s warm-up, 7,200 s measured, sub 4) with the DFW mix (ratio Wing 1 : Zipline 1 : Amazon 6/75; Zipline rate × 400/950). Heights A0, R, A2 as DFWBAD.
- **Part A, cost:** plan check on (±5 s, 30 m cells, 10 m), no contingency; A0, R, A2 × d 3 and 4 × seeds 19–21 (18 runs). Measures: flights checked, delayed, cancelled, total delay, per operator.
- **Part B, traffic levels:** no plan check; A0 and A2 × d 2, 3, 4 km × seeds 1–3 (18 runs). Measure: cross-company close calls (wide); cut = 1 − A2 / A0 pooled per spacing.

## Predictions (Houston value in brackets)
- **C1:** Part A, A2: delayed share of checked flights is 0.5–3 % at both d 3 and d 4 [1.5–2.3 %].
- **C2:** Part A: A0 delayed flights >= 2.5× A2's, pooled [4.4×].
- **C3:** Part A, A2: Amazon has the highest delayed share of the three operators, pooled [yes, 9–14 %].
- **C4:** Part B: sharing-out cut >= 65 % at each of d 2, 3, 4 [80–83 %].
- **C5:** Part B: the cut at d 2 is within 10 points of the cut at d 4.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- **K1:** Part A runner without the mix reproduces the recorded PRELAUNCH2 hold run's plan-check counts for its no-contingency equivalent? Not available; instead: Part A with the mix, A2, d 4, seed 19, run twice gives identical delays (determinism), and delayed + undelayed + cancelled = checked.
- **K2:** Part B, A0, d 3, seed 1 with the mix equals the DFW page export's filed scenario (export_city.js METRO=dfw: 72 wide, same seed and spacing).

## Deviation log
(none yet)
- (Appended after fingerprint 6c70979e…; pre-study checks only.) K1 PASS (deterministic; per-operator counts sum to checked).
- **K2 specification error.** The page's "72" counts only close calls inside the 2-hour display window; the export's full count for the same run (all_wide, as L.run reports and as every Houston lab study used) is 77. The runner gives 77: identical. Check corrected to all_wide; PASS. Code unchanged. Note: lab-layout studies (this one, DFWBAD, PRELAUNCH2 and the other Houston lab studies) all count meetings of flights launched in the window until they land, slightly past the window end; the comparison between cities is like-for-like.
- (Appended 25 Oct, after the study.) The runner's K2 constant still read 72 although the corrected value 77 was logged above before the runs; a reproducer saw FAIL. Constant changed to 77; no run or result affected.
