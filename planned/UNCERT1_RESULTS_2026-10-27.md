# UNCERT1 results (27 Oct 2026): headline ranges when the inputs are uncertain
Registration: planned/UNCERT1_PREREG.md (no deviations). Runner and analysis committed before the run (0ada5c9). K1 (access code reproduces ACCESS1b's 3.05 % and 1.28 % exactly) and K2 (fleet at registered inputs 14, 24, 8, 14, equal to NET3's) pass. 100 Latin-hypercube draws per headline.

**5 of 6 predictions passed. The access headline is wide and the registered point is optimistic; the fleet headline is narrow and driven by the charging rate. The ranges are my assumptions, so the ranking of inputs is only as good as the ranges.**

## Share of jobs that would save 10+ minutes (all twelve sites, peak)
| | 5th | median | 95th | registered point |
|---|---|---|---|---|
| DFW | 0.02 % | 1.20 % | 4.93 % | 3.05 % |
| Houston | 0.22 % | 0.48 % | 2.43 % | 1.28 % |
- The registered point sits above the 75th percentile in both metros (DFW 2.80 %, Houston 0.94 %): it is an optimistic reading, not a central one.
- In DFW the lower tail is close to zero: when the direct drive is fast and the access legs are slow, almost nobody saves ten minutes.
- Ranking (Spearman, same in both metros): speed of the **direct drive** matters most (-0.75; a slower road makes flying look better), then **processing time** (-0.5), then access speed (+0.4) and road circuity (+0.4).

## Required fleet (aircraft to serve >= 95 % with median wait <= 600 s; 4 pads, slot rule, unlimited stands)
| | 5th | median | 95th | reference at registered inputs |
|---|---|---|---|---|
| DFW r = 3 | 12 | 14 | 16 | 14 |
| DFW r = 6 | 24 | 24 | 28 | 24 |
| Houston r = 3 | 8 | 10 | 12 | 8 |
| Houston r = 6 | 12 | 14 | 20 | 14 |
- The fleet moves by one or two grid steps across the ranges; the charging rate is the lever (Spearman -0.54 to -0.81: faster charging, fewer aircraft), then turnaround (+0.14 to +0.31). Pad occupancy and route factor barely register with four pads.
- The reference fleet sits at the bottom of the draws for DFW r = 6 and Houston r = 3 (equal to the 5th percentile): the registered inputs favour a small fleet.

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| U1 access 95th/5th >= 5 | DFW 238, Houston 11 | PASS |
| U2 access speed to the site is the most influential input | no: direct-drive speed (-0.75) is, access speed is third (+0.41, +0.44) | **FAIL** |
| U3 registered point above the 75th percentile | 3.05 vs 2.80; 1.28 vs 0.94 | PASS |
| U4 fleet 95th/5th <= 1.6 at r = 3 | 1.33; 1.50 | PASS |
| U5 charging rate is the most influential fleet input (4 cells) | yes, all four | PASS |
| U6 reference fleet within 5th-95th of the draws | yes, DFW r = 6 and Houston r = 3 on the 5th-percentile boundary | PASS (at the edge) |

## Limits
- Every range is an assumption (listed in the registration). The ranking depends on them: g was drawn over +-15 % and f over 0.6-1.0, so equal-width ranges might rank differently. U2 failing says the road people would otherwise drive matters at least as much as the way to the pad, not that either is known.
- 100 draws, one seed each, inputs drawn independently; the access spread and fleet spread are not propagated into each other (the fleet study does not use the access share).
- Not varied: demand, noise, stands, weather, aircraft range, and site list.

Files: planned/uncert1_draws.json, uncert1_access.py, uncert1_fleet.js, uncert1_analyze.py, uncert1_results_table.md, out/uncert1_*.json.
