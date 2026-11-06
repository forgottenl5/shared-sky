# Headline rerun with review fixes: results (2026-10-25)
Pre-registration: HEADLINE2_PREREG.md, sha256 4d645ab7…, committed with runner and analysis before any run. K1 passed. 80 runs (2 metros x 4 height arms x 10 seeds), 2 measured hours each, counting bounded to the window. Deviations: a resume option was added to the runner during the runs (job control only; not needed in the end, all 80 ran in one job).

## Result in one line
**Sharing out heights cuts planned conflicts between companies by 72 % in Houston (95 % interval 67-76 %) and 73 % in DFW (66-80 %) against Amazon at its best-sourced heights, if 10 m between companies is enough; 55 % and 45 % if 15 m is needed; 29 % and 35 % in the high-return case.** 4 of 5 predictions passed; H3 failed in the favourable direction.

| Cut by sharing out (A2), 10 m vertical | Houston | DFW |
|---|---|---|
| against the Omaha profile (A0) | 79 % [76-82] | 80 % [74-84] |
| against best-sourced Amazon (S1), **headline** | **72 % [67-76]** | **73 % [66-80]** |
| against the high-return case (R, staff remark only) | 29 % [16-39] | 35 % [15-49] |
| S1, if 15 m vertical is needed | 55 % [53-58] | 45 % [42-49] |
| S1, if 20 m vertical is needed | 67 % [65-70] | 60 % [57-63] |

## What changed from the 3-run headline
- Houston 71 % becomes 72 % with a 9-point interval; DFW 66 % becomes 73 %. The old DFW figure was the low end of three noisy runs (one reviewer's point).
- Counting bounded to the measured window removes 3-4 % of planned conflicts (H4); the old studies overstated absolute counts slightly and the cuts not at all.
- **H3 failed:** I predicted that at 15 m vertical the cut would drop below 50 % in both metros because the shared-out layers are only 10-14 m apart. Houston kept 55 %. At stricter rules every arm counts many more conflicts (Houston best-sourced: 34.6 an hour at 10 m, 103.5 at 15 m), and the shared-out plan still separates the busiest pairs at cruise by more than the others do. The cut does depend on the separation rule, but less steeply than ROBUST suggested (44-46 % at 15 m with a different layout and Amazon at the Omaha profile).
- Non-monotonic: the cut at 20 m (67 % / 60 %) is higher than at 15 m. At 20 m the shared-out layers (Wing top 71 m, Amazon out 81 m, Zipline 101 m, Amazon back 115 m) are all within range of a neighbour, but so are almost all pairs in every other arm, so the ratio recovers. Read the 15 m and 20 m columns as "how much survives a stricter rule", not as a recommended plan: a plan designed for 15 m or 20 m would space the layers differently, and would not fit inside the filed bands.

## Caveats
- Wing and Zipline sites random per seed; filed caps on overlapping service areas not applied; no coordination baseline (operators already share plans under ASTM F3548).
- Intervals: percentile bootstrap over the 10 seeds, paired by seed. They capture layout and traffic randomness, not model error.

## Tables

## HOUSTON: planned conflicts per hour between companies (bounded window; mean of seeds, 95 % seed bootstrap, seed range)
| Heights | 10 m vertical | 15 m | 20 m | 15 m / 5 m (tight) |
|---|---|---|---|---|
| A0 | 45.8 [41.5-50.6] (34.5-61.5) | 102.8 [94.5-111.8] (83.0-131.5) | 155.3 [144.7-165.1] (128.0-177.5) | 18.1 [15.5-20.6] (10.0-25.5) |
| S1 | 34.6 [31.3-37.8] (23.5-44.5) | 103.5 [96.2-112.0] (86.5-131.5) | 157.5 [147.0-167.7] (131.5-183.0) | 8.0 [7.0-8.8] (5.0-9.5) |
| R | 13.4 [11.0-15.8] (7.0-18.0) | 71.9 [66.5-78.3] (60.0-94.5) | 124.4 [116.4-132.3] (103.5-142.0) | 3.5 [2.2-4.7] (1.0-7.0) |
| A2 | 9.6 [7.7-11.9] (5.0-18.0) | 46.2 [40.8-52.1] (32.5-65.5) | 51.2 [45.8-57.2] (35.5-70.0) | 2.8 [1.9-3.5] (0.5-5.0) |

| Shared out (A2) against | 10 m | 15 m | 20 m | tight |
|---|---|---|---|---|
| A0 | 79 % [76-82] | 55 % [53-58] | 67 % [64-70] | 85 % [80-89] |
| S1 | 72 % [67-76] | 55 % [53-58] | 67 % [65-70] | 65 % [56-75] |
| R | 29 % [16-39] | 36 % [31-41] | 59 % [55-63] | 20 % [-13-40] |

Window fix, A0 10 m: bounded 915 vs unbounded 950 (3.7 % fewer)
A0 pairs (10 m): amazon-zipline 689, amazon-wing 151, wing-zipline 75

## DFW: planned conflicts per hour between companies (bounded window; mean of seeds, 95 % seed bootstrap, seed range)
| Heights | 10 m vertical | 15 m | 20 m | 15 m / 5 m (tight) |
|---|---|---|---|---|
| A0 | 22.2 [19.2-25.4] (15.5-30.0) | 43.1 [39.5-47.1] (36.5-55.5) | 65.3 [60.3-70.5] (50.5-80.5) | 9.8 [8.0-11.6] (5.0-15.5) |
| S1 | 17.1 [14.1-20.1] (8.5-24.5) | 42.8 [39.5-46.5] (35.5-54.5) | 65.7 [60.5-71.1] (49.0-81.0) | 4.2 [3.0-5.5] (0.5-7.5) |
| R | 7.0 [5.6-8.2] (3.5-10.5) | 27.7 [25.2-30.3] (22.0-35.5) | 49.5 [45.5-53.4] (35.5-60.0) | 2.2 [1.6-3.0] (0.0-4.5) |
| A2 | 4.5 [3.5-5.5] (2.5-7.5) | 23.4 [20.6-26.2] (15.0-30.5) | 26.6 [23.8-29.5] (19.0-34.5) | 0.8 [0.5-1.2] (0.0-2.0) |

| Shared out (A2) against | 10 m | 15 m | 20 m | tight |
|---|---|---|---|---|
| A0 | 80 % [74-84] | 46 % [43-50] | 59 % [57-62] | 92 % [88-95] |
| S1 | 73 % [66-80] | 45 % [42-49] | 60 % [57-63] | 81 % [72-88] |
| R | 35 % [15-49] | 15 % [4-28] | 46 % [41-52] | 64 % [47-77] |

Window fix, A0 10 m: bounded 444 vs unbounded 459 (3.3 % fewer)
A0 pairs (10 m): amazon-zipline 339, amazon-wing 88, wing-zipline 17

| Prediction | Result | Verdict |
|---|---|---|
| H1 Houston vs S1: 60-80 % and interval < 25 points | 72 % [67-76] | **PASS** |
| H2 DFW vs S1: 55-80 % | 73 % [66-80] | **PASS** |
| H3 15 m vertical vs S1 below 50 % in both | Houston 55 %, DFW 45 % | **FAIL** |
| H4 window fix changes A0 by < 10 % in both | houston 3.7 %, dfw 3.3 % | **PASS** |
| H5 vs R, 10 m: 15-45 % in both | Houston 29 %, DFW 35 % | **PASS** |

Runs read: 80 (expected 80).
