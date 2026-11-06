# How much does the reserved volume cost? Plan-check volume size vs delay (study, written 2026-10-22 before any code or run)
Status: behaviour model of filed operations (planned tracks only), on PROC's plan check (first filed goes first) with VALLOC A2 heights and filed profiles. Not a forecast or safety assessment.

## Background
- Under ASTM F3548 each operator files 4D operational intents. The volume sizes and buffers are operator-chosen and not in public text (PLANNED_OPS_INPUTS).
- Our plan check has used one setting: same or neighbouring 30 m horizontal cell, vertical gap < 10 m, time ±5 s.
- The Gemini package (GEMINI_DESIGN_REVIEW) proposed wind-scaled volumes, with constants that have no source. We test sizes as a sweep instead.

## Question
How do delays scale with the reserved volume's horizontal size, time buffer and vertical separation, and where does the A2 height allocation stop protecting operators?

## Arms (one factor at a time around the baseline; d = 4 and 3 km; NEW seeds 13–15)
| Arm | Horizontal cell (neighbours included) | Time buffer | Vertical separation |
|---|---|---|---|
| H15 | 15 m | ±5 s | < 10 m |
| **H30 (baseline = PROC P2 / FAIR F0)** | 30 m | ±5 s | < 10 m |
| H60 | 60 m | ±5 s | < 10 m |
| H90 | 90 m | ±5 s | < 10 m |
| T15 | 30 m | ±15 s | < 10 m |
| T30 | 30 m | ±30 s | < 10 m |
| V20 | 30 m | ±5 s | < 20 m |

Everything else as FAIR F0: 30 s retry step, 40 tries, zone plus 1 km checked, cross-operator only.

## Measures
- Delayed flights (all operators, and by operator), mean delay of delayed flights, total delay (h), cancellations.
- Each as a ratio to H30 at the same density and seeds.

## Predictions (pooled over seeds 13–15)
- **Q1:** Delayed flights at H60 / H30 lie between 1.6 and 2.5 at d = 4 and at d = 3 (roughly linear in the horizontal reach). PREDICTION: holds.
- **Q2:** T15 / H30 delayed flights >= 2 at d = 4 and at d = 3 (the time buffer stretches the volume along the track by speed × buffer). PREDICTION: holds.
- **Q3:** V20 / H30 delayed flights >= 3 at d = 3 (A2's gaps are 10–20 m, so a 20 m requirement turns cruise heights into conflicts). PREDICTION: holds.
- **Q4:** Delayed flights rise strictly across H15 < H30 < H60 < H90 at both densities. PREDICTION: holds.
- **Q5 (reported only):** mean delay, cancellations, by-operator shares, total delay.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below. The analysis script is committed before any study run.

## Feature checks (before the study)
- **K1:** H30 through the new code reproduces FAIR F0's delays exactly (d = 4 and 3, seeds 4–6).
- **K2:** Brute-force recheck for H90, T30 and V20 at d = 4, seed 13: 0 cross-operator conflicts under each arm's own rule.

## Deviation log
(none yet)
- (Appended after fingerprint 044ae219…; pre-study checks only.) K1–K2 PASS on first run: H30 = FAIR F0 exactly (0 of all flights differ); brute-force 0 conflicts for H90, T30, V20 (5,886 flights each). vol_analyze.py committed before any study run.
