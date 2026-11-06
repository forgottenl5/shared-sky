# Follow-up: bad-day and delay benefits against Amazon's reported heights (written 2026-10-23 after PRELAUNCH results, before any run of this study)
Status: behaviour model of planned operations; counting at 4 checks per second; research configuration. Not a forecast or safety assessment.

## Why
PRELAUNCH S1 found that against the heights Amazon is reported to fly (R = Wing 46–91, Amazon 69 out / 122 back, Zipline 101) the allocation adds only 23 % fewer planned meetings. The page's other claimed benefits (holds 9.4×, outages 7.0×, plan-check delay 4.4× flights / 6.7× time) were all measured against the filed baseline A0, and DEVA0 traced them to the same 4 m clash. This study measures them against R.

## Arms
A0 (filed: 61 / 105), R (reported: 69 / 122), A2 (allocation: 81 / 115); Wing and Zipline as before.
- **Holds:** plan check on (30 m cells, ±5 s, 10 m vertical), 20 % of in-zone flights hover 120 s (COUNTFIX R-DEV settings); d = 3 and 4, seeds 19–21.
- **Outages:** plan check on, 6 area outages (2 km radius, 120 s), d = 3, seeds 22–24 (OUTAGE settings, now at 4 checks per second).
Plan-check delays are taken from the hold runs (delays are computed before contingencies).

## Predictions
- **Q1:** A0's cross-operator wide meetings per 100 holds are >= 3× R's. PREDICTION: holds.
- **Q2:** R's rate per 100 holds is < 3× A2's (most of the bad-day benefit is gone against R). PREDICTION: holds.
- **Q3:** R's plan-check delayed flights are <= 50 % of A0's. PREDICTION: holds.
- **Q4:** R's wide meetings per 100 held drones in outages are < 3× A2's. PREDICTION: holds.
- Reported: all rates with exact intervals (conditional binomial rate ratios), close meetings, delay hours.
- **Consequence rule:** the city page must state the bad-day and delay benefits against R alongside A0, and lead with the R figures if they are smaller.

## Rules
No changes after the data is in; deviations logged below. Runner and analysis script committed before any run. Feature check K1: A0 and A2 hold runs at d = 4, seed 19 reproduce COUNTFIX R-DEV (A0 20 wide / 845 holds; A2 3 wide / 845 holds).

## Deviation log
(none yet)
- (Appended after fingerprint 8ef9f2be…; pre-study check only.) K1 specification error: the check text says A0 has 845 holds, but COUNTFIX's log (out/countfix_log.txt, HOLD-A0 d = 4 seed 19) records 846; 845 is A2's. The engine reproduces COUNTFIX exactly (A0 20 wide / 846 holds; A2 3 wide / 845 holds). Check corrected to the logged values; code unchanged. K1 PASS.
