# Phase 1b, Houston full filed build-out: results (HOUSTON2_PREREG.md), 2026-10-22
Status: behaviour model of operations as filed; planned tracks only (no avoidance, no booking); site positions random; filed caps on overlapping service areas not applied (upper bound). Not a forecast or safety assessment. Code hashed before the runs (planned/HOUSTON2_CODE.sha256, verified after).

## Feature checks
G1-G3 PASS (segment model equals the 1-s tracks to 1e-14 m; identical counts to HOUSTON1 on its own flights; site counts as designed).

## Results (central 144 km^2; 3 seeds x 2 h per level; full table in planned/houston2_results_table.md)
| Wing nest spacing | Sites in 44 x 44 km (Wing / Zipline / Amazon) | Flights touching the zone per hour | Cross-operator planned meetings (30 m / 10 m) per hour | Close (15 m / 5 m) per hour | Same-operator meetings per hour | Amazon involved | Overflights per km^2 per day: median (busiest) |
|---|---|---|---|---|---|---|---|
| 9 km | 24 / 21 / 2 | 481 | 2.5 | 1.0 | 274 | 93 % | 411 (1,508) |
| 6 km | 54 / 47 / 4 | 782 | 0.8 | 0.3 | 307 | 40 % | 594 (1,415) |
| 4 km | 121 / 105 / 10 | 1,847 | 30 | 10 | 1,008 | 94 % | 1,419 (3,140) |
| 3 km | 215 / 186 / 17 | 3,236 | 86 | 27 | 2,461 | 95 % | 2,810 (4,575) |
| 2 km | 484 / 419 / 39 | 7,232 | 393 | 115 | 9,362 | 89 % | 6,190 (8,651) |
At 9 and 6 km the counts are small (15 and 5 events in 6 h) and depend on where the few Amazon hubs fall; the 9 km level is above the 6 km level for that reason.

## Verdicts
| Prediction | Result | Verdict |
|---|---|---|
| Q1 cross-operator meetings grow with site density squared (log-log slope 1.6-2.4) | 1.98 | **PASS** |
| Q2 > 10 cross-operator meetings per hour at 2 km spacing | 393 | **PASS** |
| Q3 Amazon's share falls below half at high density | 93 % -> 89 % | **FAIL** |

## What this means
1. **Cross-operator meetings grow with the square of site density**, as physics suggests (slope 1.98). Going from ~9 km to ~3 km between Wing nests multiplies them ~35x.
2. **Rare at roughly the filed average density, common when sites cluster.** Spread over the areas named in the filings (Wing 75 nests over its 10-county area; Zipline 65 Chargers over 9,932 sq mi), sites would sit roughly 6-20 km apart [derived, rough], where cross-operator meetings are a few per hour per 144 km^2. Where sites cluster in busy suburbs at 3-4 km, they reach 30-90 per hour, and 10-27 per hour within 15 m / 5 m.
3. **One structural cause dominates at every density: Amazon's return height.** Amazon is in ~90 % of cross-operator meetings although it has only 6 of every 146 sites. Its inbound leg flies at 345 ft (105 m), 4 m from Zipline's 330 ft (101 m) cruise and 75-120 s hovers; most meetings are Amazon-Zipline. Wing (46-91 m) and Zipline (101 m) meet only in climbs and descents.
4. Noise grows with density too: the median square kilometre sees ~400-600 flights a day at 6-9 km spacing and ~1,400-2,800 at 3-4 km (all operators, filed caps).
5. Same-operator meetings remain ~25-35x more frequent than cross-operator ones at every density; each operator's own deconfliction carries most of the load.

## Limits
Random site positions; uniform demand; no filed overlap caps; straight routes; one fixed height per operator leg; no wind; small counts at low density.

## Phase 2 candidate suggested by this result (to be registered)
A vertical allocation rule between operators (for example, a 10 m gap between any two operators' cruise and hover heights) at the filed profiles: how much does it cut cross-operator meetings at 3-4 km density, and at what cost (operators' heights within the 400 ft ceiling, Amazon's outbound/inbound split)?
