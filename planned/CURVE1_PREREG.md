# CURVE1: the height-sharing cut as a curve over the separation rule (written 2026-11-23 before any run)
Status: sensitivity study of the headline. Registered before the runner, analysis or any run.

## Why
The headline cut (HEADLINE2: 72 % Houston, 73 % DFW) uses one rule for a planned conflict: within 30 m sideways and under 10 m vertically. The independent review (21 Nov) pointed out that 10 m equals the smallest gap between the shared-out heights (Wing's top 71 m, Amazon's outbound 81 m), so a single number can flatter the rule. HEADLINE2 already showed 55 % / 45 % at 15 m and 67 % / 60 % at 20 m vertical. This study draws the whole curve: vertical 5-20 m and horizontal 20-50 m.

## Settings
- HEADLINE2 exactly (planned/headline2_run.js layouts, flights and heights): real filed layouts, S1 (Amazon at its best-sourced heights) and A2 (each company its own height), seeds 1-10, both metros, 2 measured hours after 1 h warm-up, counting 4 times a second and bounded to the window.
- One count per run with a grid of rules: horizontal 20, 30, 40, 50 m x vertical 5, 7.5, 10, 12.5, 15, 20 m (24 rules), conflicts between different companies only.
- 2 metros x 2 arms x 10 seeds = 40 runs. Cut = 1 - (A2 conflicts pooled over seeds) / (S1 conflicts pooled over seeds); 95 % percentile bootstrap over seeds, paired.

## Predictions
- **T1:** at 5 m vertical, the cut is at least 80 % at every horizontal rule, both metros.
- **T2:** at every horizontal rule, the cut at 15 m vertical is lower than at both 10 m and 20 m, both metros (the dip HEADLINE2 showed at 30 m holds at every horizontal rule).
- **T3:** at 10 m vertical, the cut varies by at most 10 points across horizontal 20-50 m, both metros.
- **T4:** the lowest cut anywhere on the grid is at least 35 %, both metros.
- Reported, not predicted: the full grid with intervals; conflict counts per hour; which company pair drives the dip.

## Checks (K)
- **K1:** for every run, the 30 m / 10 m, 15 m and 20 m counts equal HEADLINE2's stored v10 / v15 / v20 for the same metro, arm and seed (same flights; checked in the analysis).
- **K2:** counts never decrease when either rule gets looser (checked in the analysis, every run).

## Rules
Runner and analysis committed before any run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
- **D1 (before any data):** the first launch stopped at once with an engine error: the counter's spatial grid cell (default 30 m) must be at least the largest horizontal rule (50 m). The runner now passes `cell: 50`; the grid cell only decides which pairs are compared, not how they are counted, and K1 (30 m counts equal HEADLINE2's) checks that. No run had completed.
