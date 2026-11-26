# CAPACITY1 results (2026-11-26)

Pre-registration: planned/CAPACITY1_PREREG.md (fingerprinted; K1-K4 passed before the study runs; D1 = run-count arithmetic, design unchanged). Runner planned/capacity1_run.js, analysis planned/capacity1_analyze.py, full table planned/capacity1_results_table.md, raw rows planned/raw/out_capacity1.tar.xz. 240 of 240 runs (the run hit the 2-hour session limit once and resumed; no row changed).

**2 of 8 predictions passed (C2, C5). C1, C3, C4, C6, C7 and C8 failed.**

## Plain summary
We scaled traffic from a tenth of the filed volumes to one and a half times them on PHYS1's realistic model, with plans shared before take-off.

- **With today's plan sizes (+-14 m in height, average GPS), no height layout meets the test at any traffic level, not even at 10 % of the filed volumes.** The test was at most 10 % of flights held and no company above 25 %. Amazon is the reason: more than 25 % of its flights are held from the lowest traffic level in every layout except GAP1's spacing with +-13.5 m plans.
- **Only GAP1's spacing with +-13.5 m plans passes:** up to half the filed volume in Houston and the full filed volume in DFW. Above that, Amazon goes over 25 % (Houston 41 % at filed volume, DFW 21 %).
- **Held share does not rise steadily with traffic (C1 failed).** It peaks at a quarter to half of filed volume, then falls slightly. Post-hoc reading: Amazon is pushed out. Under the shared-out heights, Amazon has 43-89 % of its flights cancelled at half to one and a half times filed volume (Houston 63-89 %, DFW 43-78 %), and cancelled flights stop blocking others, so Wing and Zipline wait less. **A falling overall held share here means one company is being shut out, not that the system copes better.**
- **How traffic grows matters (C6 failed).** The same traffic from fewer busy sites holds 2.5-11 points fewer flights than from every site at a lower rate. Growing site by site is easier on plan sharing than spreading early traffic thinly across all sites.
- **Wing's filed fleet may not cover the lunch peak (C8 failed).** At filed volume, the busiest Wing nest has 28 (Houston) and 29 (DFW) aircraft in the air at once against 24 filed, with zero turnaround time (a lower bound). The median nest needs 17. This rests on the assumed lunch peak (busiest hour twice the daily mean); no hourly data are published.
- **The headline cut without sharing (S1 to A2) holds at 57-73 % from a quarter of filed volume upwards.** At 10 % volume the counts are too small to mean anything (Houston 6 vs 7 meetings). C7 failed on DFW at half volume (57 % against 73 % at filed volume) and on those tiny counts.

## Predictions

| | Result |
|---|---|
| C1 held rises at 0.1 < 0.5 < 1 < 1.5 | **FAIL**: every N2 layout peaks at 0.25-0.5 then falls (e.g. Houston A2 9.9 / 15.0 / 12.4 / 11.3 %). Only G1 / V135 rises steadily (0.7 / 2.7 / 3.9 / 4.9 %). |
| C2 today's heights hold >= 10 % at k = 0.25 | PASS: 43.4 % Houston, 33.5 % DFW |
| C3 shared-out heights hold <= 10 % at k = 0.5 | **FAIL**: 15.0 % Houston, 15.8 % DFW |
| C4 Amazon's 25 % fails at a strictly lower k than overall 10 % | **FAIL**: both fail at the lowest level for today's heights; for shared-out heights Amazon fails at 0.1 and overall at 0.25, but the registered test needed strictly lower in all four cases |
| C5 G1 / V135 has the highest capacity | PASS: 0.5 Houston, 1 DFW; every other layout 0 (below 0.1) |
| C6 fewer sites vs quieter sites within 3 points | **FAIL**: fewer busy sites hold 2.5-10.7 points less |
| C7 cut stays within 10 points of k = 1 | **FAIL**: Houston -17 % at 0.1 (6 vs 7 meetings); DFW 57 % at 0.5 vs 73 % at 1 |
| C8 Wing peak <= 24 aircraft at k = 1 | **FAIL**: 28 Houston, 29 DFW (median nest 17) |

C4 failed on the registered wording. The substance (Amazon is the limit) holds more strongly than predicted: Amazon fails first or at the same time in every case.

## Capacity (highest traffic share meeting the test)

| Layout | Houston | DFW |
|---|---|---|
| Today's heights A0 / +-14 m | below 0.1 | below 0.1 |
| Shared-out A2 / +-14 m | below 0.1 | below 0.1 |
| GAP1 G1 / +-14 m | below 0.1 | below 0.1 |
| GAP1 G1 / +-13.5 m | 0.5 | 1 |

## Held share at filed volume (k = 1): all / Wing / Zipline / Amazon

| | Houston | DFW |
|---|---|---|
| A0 / N2 | 44.6 / 46.4 / 39.4 / 98.0 % | 45.4 / 40.5 / 40.8 / 93.4 % |
| A2 / N2 | 12.4 / 4.2 / 9.5 / 99.5 % | 14.3 / 3.3 / 8.8 / 96.9 % |
| G1 / V135 | 3.9 / 4.9 / 0.5 / 40.5 % | 3.5 / 3.1 / 0.5 / 21.0 % |

## Post-hoc check (26 Nov, after the results; not pre-registered): why held share falls
Held share split into delayed and cancelled (A2 / N2): as traffic rises, delays fall (Houston 14.4 % at 0.25 to 6.5 % at 1.5) and cancellations rise (1.9 % to 4.8 %). 92-100 % of cancellations are Amazon's. Amazon's own cancelled share rises from 6 % (Houston) / 1 % (DFW) at k = 0.1 to 89 % / 78 % at k = 1.5. Zipline's cancellations stay below 0.5 %. So Amazon is shut out more and more, and the others wait less. This is consistent with the numbers but was not tested by switching cancellation off. The same pattern under today's heights is weaker (Amazon 56-64 % cancelled in Houston at k >= 1). Computed directly from the stored rows; no extra runs.

## What it means
- **Plan sharing with today's plan sizes does not give every company a fair chance at any volume tested.** The binding limit is always Amazon, whose climbs and descents cross the other companies' heights. A regulator using "every company gets most flights through" as a test would find no safe volume except with GAP1's spacing and slightly tighter plans.
- **Overall held share is the wrong single number for capacity.** It can fall while one company is being shut out. Any capacity claim needs per-company held and cancelled shares. The same effect explains PHYS1's lower held share against the old engine (checked from PHYS1's stored rows; PHYS1 results, post-hoc check 2).
- **Growing by adding sites at full rate is easier than spreading the same traffic thinly over all sites.**
- **Wing's 24-aircraft nests are at or past their limit at the filed 400 a day if demand peaks at lunch.** This depends on an assumed demand shape.

## Limits
Same as PHYS1: assumed lunch peak, turn limits, no weather, buildings, other aircraft or in-flight avoidance, plans cover position error only. Peak-hour window only (2 measured hours). Three seeds. Traffic above k = 1 exceeds what was filed. Fleet peaks ignore turnaround and charging (none filed), so real fleet needs are higher. The modelled pre-flight check is not any operator's system.
