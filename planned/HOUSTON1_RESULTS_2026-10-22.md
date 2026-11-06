# Phase 1, Houston (Cypress cluster): results (HOUSTON1_PREREG.md), 2026-10-22
Status: behaviour model of operations as filed with the FAA; planned tracks only (no avoidance, no booking); site positions approximate (+-2-3 km); customers uniform. Not a forecast and not a safety assessment. Code hashed before the runs (planned/HOUSTON1_CODE.sha256, verified after).

## Feature checks
H1-H3 PASS (profiles reproduce the filed heights, hovers and speeds; counting exact; demand within 2 %).

## Results (5 seeds x 4 h each, filed daily averages; full tables in planned/houston1_results_table.md)
| Scenario | Flights per day (equiv.) | Planned close passes between DIFFERENT operators (30 m / 10 m) per hour | Same, 15 m / 5 m | Planned close passes within the SAME operator (30 m / 10 m) per hour | Busiest 1 km cell: flights over it per day | Median cell |
|---|---|---|---|---|---|---|
| S0 live sites (3 Wing + Zipline) | ~1,570 | 0 (0 in 20 h) | 0 | 64 | 414 | 14 |
| S1 + Amazon Campbell Rd | ~2,540 | 0.35 (7 in 20 h) | 0.10 | 127 | 1,010 | 18 |
| S2 + Zipline at Texas-draft cap | ~3,020 | 0.30 (6 in 20 h) | 0 | 162 | 1,009 | 23 |
Peak factor 1.5: cross-operator 0-0.35 per hour; same-operator 132-369 per hour.
All cross-operator passes were away from sites; Amazon took part in every one (with Wing or Zipline). Wing and Zipline never came within 30 m / 10 m of each other: Wing cruises at 46-91 m, Zipline at 101 m, and their sites are ~9 km apart.

## Verdicts
| Prediction | Result | Verdict |
|---|---|---|
| P1 Zipline + Amazon inbound > 50 % of cross-operator passes in S1 and S2 | 14 %, 50 % | **FAIL** |
| P2 S0 Wing-Zipline passes mostly during climbs/descents | 0 Wing-Zipline passes | not evaluable |
| P3 S1 -> S2 growth of Wing-Zipline and Amazon-Zipline passes x2-3 | Wing-Zipline 0 -> 0; Amazon-Zipline 1 -> 3 events | **FAIL** |
The predictions were about the mix of cross-operator passes; with only 6-7 such events per 20 simulated hours they could not be tested well. My prior (that overlapping height bands would make cross-operator meetings common) was wrong for this cluster.

## What this means
1. **At today's site spacing, the filed plans barely meet each other.** Across the five Cypress-area sites at their filed caps (~2,500-3,000 flights a day), planned passes within 30 m / 10 m between different operators happen about 2-5 times per operating day. Within each operator they happen 60-160 times per hour, mostly near its own sites.
2. **The load sits inside each operator, at its own sites**, where each operator's own (unpublished) deconfliction handles it. Cross-operator coordination (F3548 intent exchange) carries a light load at this density, consistent with Wing and Flytrex reporting routine daily coordination.
3. **Noise exposure is concentrated, not spread**: the cell over Amazon's hub sees ~1,000 flights a day; the median cell 14-23. The busiest-cell figure is set by the hub's filed cap, not by sharing.
4. This corrects my earlier statement that multi-operator overlap is the biggest gap: in this cluster it is not. It may become one at the full build-out the operators have filed (Wing up to 75 nests and Zipline up to 65 Chargers in the Houston area, plus Amazon hubs), where sites would be ~2-4 km apart and cross-operator meetings scale roughly with the product of the operators' densities.

## Limits
Approximate site positions; uniform customers (no housing data); no wind; straight-line routes (operators vary paths to spread noise, which would spread encounters too); Wing en route height drawn uniformly within its filed band; no peak hour beyond x1.5; only 5 sites of the much larger filed build-out.

## Next candidate (to be registered)
Full filed build-out for the Houston area at the same profiles (75 Wing nests, 65 Zipline Chargers with Dropboxes, 6 Amazon hubs), with site positions drawn over commercial areas [assumed], to find at what site density cross-operator meetings stop being rare.
