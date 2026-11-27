# ROUTE1 results (2026-11-26)

Pre-registration: planned/ROUTE1_PREREG.md (fingerprinted; K1-K4 passed before the study runs: with gates off the engine reproduces CUMNOISE1 and CAPACITY1 exactly). Runner planned/route1_run.js, analysis planned/route1_analyze.py, full table planned/route1_results_table.md, raw rows planned/raw/out_route1.tar.xz. 42 of 42 runs. No deviations.

**5 of 8 predictions passed. R3, R5 and R6 failed.**

## Plain summary
We tested Amazon's Richardson practice (send departures over the least-populated side first) applied to every hub of every company in Houston and DFW. All flights went through one gate 1 km out over the least-populated side (GATE1), or through four gates (GATE4), against flying direct.

- **Gates did not take frequent overflights off homes (R5 failed).** People living under 100 or more overflights a day: Houston down 7 % with one gate (224,000 to 208,000) and down 23 % with four; DFW up 46 % with one gate (4,800 to 7,000) and up about 12 times with four (59,000). Traffic leaving a gate still fans out over homes, and with four gates some always point at populated areas.
- **Gates concentrate traffic sharply (R1, R2 passed).** The busiest spot goes from about 900 overflights a day to 2,800 (Houston) and 2,000 (DFW). Spots at or above the FAA's 1,150 line go from 0 to about 970 per Houston run and 90 per DFW run. Three Houston spots (sum of 3 seeds) reach 2,300, the level the national review calls "highly unlikely" (R3 failed). A practice meant to relieve residents creates exactly the concentration the FAA's condition asks to be identified.
- **Loudest en route level rises about 4 dB** (Houston 51.0 to 54.8 dB, DFW 47.5 to 51.1 dB). Still below 55 and far below 65.
- **Extra distance is small (R6 failed, on the low side).** One gate adds 8 % (Houston) and 10 % (DFW) to the distance flown per flight, against the predicted 10-40 %; four gates add 1-3 %.
- **Plan sharing between companies is unchanged (R7, R8 passed).** Held share moves by at most 1.1 points, and Amazon stays the most-held company (97-99.5 % with shared-out heights). Routing near each company's own sites is not where companies block each other.

## Predictions

| | Houston | DFW |
|---|---|---|
| R1 GATE1 busiest spot >= 1.5x DIRECT | PASS 2,761 vs 903 | PASS 2,017 vs 934 |
| R2 GATE1 has a spot >= 1,150 every seed | PASS (964-970 spots) | PASS (83-93) |
| R3 no spot >= 2,300 in any arm | **FAIL** GATE1: 1 / 2 / 0 by seed | PASS |
| R4 GATE4 fewer spots >= 500 than GATE1 | PASS 5,664 vs 7,804 | PASS 534 vs 6,588 |
| R5 GATE1 cuts people at >= 100/day by >= 20 % | **FAIL** -7 % | **FAIL** +46 % |
| R6 GATE1 +10-40 % distance, GATE4 < +10 % | **FAIL** +8.3 % / +3.4 % | PASS +10.1 % / +1.2 % |
| R7 held share within 2 points of DIRECT | PASS (max change 1.1) | PASS (max change 0.8) |
| R8 Amazon most-held under every arm | PASS | PASS |

## Reading
- **Concentration and exposure pull in opposite directions.** Spreading flights (direct routing) keeps every spot below the FAA's per-spot line but puts more people under moderate traffic. Concentrating them (gates) creates spots far above the line without reliably reducing the number of people under frequent traffic, because traffic beyond the gate still spreads over homes. Which is better is a policy choice: many people hearing some drones, or fewer places hearing very many. This study shows the trade, not the answer.
- **The FAA's per-spot condition depends on routing practice.** CUMNOISE1 found no spot at 1,150 under direct routing. One documented operator practice, applied widely, produces thousands. The condition is only meaningful if routes are known.
- **Routing near hubs is not a lever for plan-sharing waits.** Those are set by cruise heights (GAP1), as before.

## Limits
- Gates are a stylised version of one practice (1 km, 8 wedges, least people by block-group centres; no land-use data). The wedge is chosen on coarse data and may contain one or no centre.
- The composition of the three 2,300 spots (which companies) was not recorded.
- People counts are coarse (block-group centres), especially in DFW, where the base under 100/day is small (4,800).
- Same limits as CUMNOISE1 and CAPACITY1 (filed volumes, en route noise only, assumed lunch peak, random sites beyond real stores, between-company plan check only).
- Neutral reporting: the FAA's national review is the subject of a pending petition for review in the Second Circuit (filed 28 Sep 2026 by 15 states and Harris County, Texas; no ruling as of 27 Nov 2026). Numbers are reported against the FAA's own thresholds, with no view on the case or on which routing is better.
