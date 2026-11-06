# AIRTAXI_NET2 results (run 2026-10-26; registration planned/AIRTAXI_NET2_PREREG.md)

Scenario model, engine taxi/net2.js. Pad counts, pad occupancy times, stands and demand are assumptions (none are public). Not a forecast.

## Checks and predictions

| # | Result | Detail |
|---|---|---|
| K2 | pass | v2 base fleet at r 1.5: DFW 8.0 (NET1 8), Houston 5.0 (NET1 6) |
| K3 | pass | 720 of 720 runs consistent |
| Q2 DFW r 1.5 | **FAIL** | pads needed at 90 s: 2 (2-2) (predicted 1; 99 = more than 4) |
| Q2 DFW r 3 | pass | pads needed at 90 s: 2 (2-4) (predicted 1 or 2; 99 = more than 4) |
| Q2 DFW r 6 | **FAIL** | pads needed at 90 s: 4 (4-4) (predicted 2; 99 = more than 4) |
| Q2 DFW r 12 | **FAIL** | pads needed at 90 s: 99 (99-99) (predicted 4; 99 = more than 4) |
| Q2 HOU r 1.5 | **FAIL** | pads needed at 90 s: 2 (1-2) (predicted 1; 99 = more than 4) |
| Q2 HOU r 3 | **FAIL** | pads needed at 90 s: 2 (2-2) (predicted 1; 99 = more than 4) |
| Q2 HOU r 6 | **FAIL** | pads needed at 90 s: 3 (2-4) (predicted 2; 99 = more than 4) |
| Q2 HOU r 12 | **FAIL** | pads needed at 90 s: 4 (4-4) (predicted 2; 99 = more than 4) |
| Q3 | pass | DFW r 3: 90 s 2 -> 180 s 4; DFW r 6: 90 s 4 -> 180 s 99; DFW r 12: 90 s 99 -> 180 s 99; HOU r 3: 90 s 2 -> 180 s 4; HOU r 6: 90 s 3 -> 180 s 4; HOU r 12: 90 s 4 -> 180 s 99 |
| Q1a | **FAIL** | 42 light-load cases; exceptions: HOU r1.5 1 pad 180s rho 0.30 p95 123s |
| Q1b | pass | 10 heavy one-pad cases; exceptions: none |
| Q4 | pass | busiest-site max stands at r 1.5: DFW 5.5, Houston 4; DFW r 12: 22.5 |
| Q5 | pass | slow-charging fleet, v2: DFW 10 (10-12) (v1 12), Houston 8 (8-8) (v1 8) |
| Q6 | pass | repositioning share of flights: DFW 24.5%, HOU 21.4% |

6 of 14 predictions passed.

## Fleet used (smallest meeting >= 95 % served, median wait <= 10 min, with ample ground; median over 10 seeds, min-max)

| Metro | r = 1.5 | r = 3 | r = 6 | r = 12 |
|---|---|---|---|---|
| DFW (trips an hour: 12 / 24 / 48 / 96) | 8 (8-10) | 14 (12-16) | 24 (24-28) | 48 (48-48) |
| HOU (trips an hour: 6 / 12 / 24 / 48) | 5 (5-6) | 8 (8-10) | 14 (12-16) | 28 (28-28) |

## Pads needed at every site (p95 air hold and p95 pad wait both <= 2 min; median over seeds, min-max; 99 = more than 4)

| Metro | Pad occupancy | r = 1.5 | r = 3 | r = 6 | r = 12 |
|---|---|---|---|---|---|
| DFW | 60 s | 1 (1-2) | 2 (2-2) | 2 (2-4) | 4 (4-4) |
| DFW | 90 s | 2 (2-2) | 2 (2-4) | 4 (4-4) | 99 (99-99) |
| DFW | 180 s | 4 (2-4) | 4 (4-4) | 99 (99-99) | 99 (99-99) |
| HOU | 60 s | 1 (1-1) | 1 (1-2) | 2 (2-2) | 4 (2-4) |
| HOU | 90 s | 2 (1-2) | 2 (2-2) | 3 (2-4) | 4 (4-4) |
| HOU | 180 s | 2 (2-4) | 4 (4-4) | 4 (4-4) | 99 (99-99) |

## Per site, 2 pads, 90 s occupancy (median over seeds)

| Metro | r | Site | Movements an hour (busiest hour) | p95 air hold (s) | p95 pad wait (s) | Stands: max (p95 of time) |
|---|---|---|---|---|---|---|
| DFW | 1.5 | Alliance | 6.8 (12) | 0 | 0 | 5 (4) |
| DFW | 1.5 | DFW Airport (Corporate Aviation) | 11.2 (16.5) | 0 | 0 | 5 (3) |
| DFW | 1.5 | Toyota HQ | 7.7 (12) | 0 | 0 | 4 (3) |
| DFW | 1.5 | Downtown Dallas (49T) | 4.2 (10) | 0 | 0 | 3 (2) |
| DFW | 3 | Alliance | 13.1 (20) | 0 | 19 | 7 (5) |
| DFW | 3 | DFW Airport (Corporate Aviation) | 22.1 (30) | 0 | 82 | 7 (5) |
| DFW | 3 | Toyota HQ | 14.3 (19) | 0 | 22 | 6 (4) |
| DFW | 3 | Downtown Dallas (49T) | 8.0 (14) | 0 | 0 | 5 (3) |
| DFW | 6 | Alliance | 26.2 (34.5) | 0 | 149 | 10 (7) |
| DFW | 6 | DFW Airport (Corporate Aviation) | 44.8 (55.5) | 66 | 352 | 13 (9) |
| DFW | 6 | Toyota HQ | 28.5 (38.5) | 22 | 158 | 9.5 (7) |
| DFW | 6 | Downtown Dallas (49T) | 15.1 (24.5) | 0 | 80 | 7 (4.5) |
| DFW | 12 | Alliance | 49.2 (60) | 31 | 562 | 14 (9) |
| DFW | 12 | DFW Airport (Corporate Aviation) | 77.7 (80) | 648 | 1230 | 22.5 (19) |
| DFW | 12 | Toyota HQ | 51.6 (63.5) | 54 | 567 | 15 (11) |
| DFW | 12 | Downtown Dallas (49T) | 27.2 (37) | 0 | 86 | 5 (3) |
| HOU | 1.5 | IAH | 6.2 (10) | 0 | 0 | 4 (4) |
| HOU | 1.5 | Hobby | 3.9 (8) | 0 | 0 | 3 (2) |
| HOU | 1.5 | Ellington | 4.0 (7) | 0 | 0 | 3 (2.5) |
| HOU | 3 | IAH | 12.8 (17.5) | 0 | 10 | 7 (5) |
| HOU | 3 | Hobby | 7.6 (13) | 0 | 0 | 4 (3) |
| HOU | 3 | Ellington | 7.2 (11.5) | 0 | 0 | 4 (3) |
| HOU | 6 | IAH | 24.7 (30) | 0 | 125 | 9.5 (7) |
| HOU | 6 | Hobby | 14.8 (20.5) | 0 | 0 | 6 (4) |
| HOU | 6 | Ellington | 14.2 (20) | 0 | 7 | 8 (6) |
| HOU | 12 | IAH | 50.2 (57) | 50 | 365 | 16 (12) |
| HOU | 12 | Hobby | 29.2 (36.5) | 0 | 130 | 9 (7) |
| HOU | 12 | Ellington | 27.3 (38.5) | 0 | 123 | 11 (8) |

## Network service with the pads available (median over seeds; served share / median wait in min)

| Metro | Pad occupancy | Pads | r = 1.5 | r = 3 | r = 6 | r = 12 |
|---|---|---|---|---|---|---|
| DFW | 60 s | 1 | 99% / 1.1 | 98% / 2.0 | 97% / 8.0 | 71% / 27.9 |
| DFW | 60 s | 2 | 99% / 0.0 | 99% / 0.0 | 99% / 3.2 | 100% / 2.5 |
| DFW | 60 s | 4 | 99% / 0.0 | 98% / 0.0 | 98% / 2.6 | 100% / 0.0 |
| DFW | 90 s | 1 | 98% / 2.0 | 96% / 5.5 | 86% / 21.8 | 41% / 30.1 |
| DFW | 90 s | 2 | 98% / 0.5 | 98% / 1.5 | 97% / 4.9 | 92% / 20.6 |
| DFW | 90 s | 4 | 98% / 0.5 | 97% / 0.6 | 98% / 4.2 | 100% / 0.0 |
| DFW | 180 s | 1 | 94% / 8.8 | 79% / 20.8 | 44% / 32.9 | 18% / 33.5 |
| DFW | 180 s | 2 | 97% / 3.1 | 95% / 5.3 | 85% / 21.5 | 41% / 30.4 |
| DFW | 180 s | 4 | 96% / 1.2 | 97% / 4.7 | 96% / 7.8 | 92% / 19.8 |
| HOU | 60 s | 1 | 97% / 0.0 | 98% / 0.9 | 98% / 3.2 | 97% / 10.8 |
| HOU | 60 s | 2 | 97% / 0.0 | 99% / 0.0 | 98% / 2.1 | 98% / 4.2 |
| HOU | 60 s | 4 | 97% / 0.0 | 98% / 0.0 | 98% / 2.5 | 99% / 3.2 |
| HOU | 90 s | 1 | 97% / 0.0 | 97% / 1.7 | 97% / 6.2 | 80% / 29.4 |
| HOU | 90 s | 2 | 97% / 0.0 | 98% / 0.0 | 97% / 3.3 | 98% / 6.4 |
| HOU | 90 s | 4 | 97% / 0.0 | 98% / 0.0 | 98% / 2.8 | 98% / 4.4 |
| HOU | 180 s | 1 | 95% / 1.8 | 93% / 8.4 | 79% / 26.4 | 41% / 52.1 |
| HOU | 180 s | 2 | 96% / 0.0 | 96% / 2.0 | 95% / 6.9 | 81% / 27.5 |
| HOU | 180 s | 4 | 96% / 0.0 | 96% / 1.7 | 96% / 4.2 | 96% / 8.5 |

## Notes written after the run
- **Why pads needed came out about one step above the predictions.** Arrivals book their landing slot when they take off, 10-15 minutes ahead, so a departure decided later has to fit between landings already booked: in effect arrivals have priority. At about 30 % pad use half of all departures wait (a first-come queue would give about 30 %). The registered arithmetic assumed a first-come queue. Movements are also about 20-25 % above the nominal count because of repositioning flights (Q6), and the busiest hour runs about 1.5x the average.
- **Post-hoc (not registered): pads needed if only air holds count** (p95 air hold <= 2 min at every site; ground waits for a pad ignored, since they cost no battery). This is close to the registered Q2 values at 90 s (DFW 1 / 1-2 / 2 / 4; Houston 1 / 1 / 2 / 2):

| Metro | Pad occupancy | r = 1.5 | r = 3 | r = 6 | r = 12 |
|---|---|---|---|---|---|
| DFW | 60 s | 1 (1-2) | 1 (1-1) | 2 (2-2) | 3 (2-4) |
| DFW | 90 s | 1 (1-2) | 2 (2-2) | 2 (2-2) | 4 (4-4) |
| DFW | 180 s | 2 (2-2) | 4 (2-4) | 4 (4-4) | 99 (99-99) |
| HOU | 60 s | 1 (1-1) | 1 (1-1) | 1 (1-1) | 2 (2-2) |
| HOU | 90 s | 1 (1-1) | 1 (1-2) | 2 (2-2) | 2 (2-4) |
| HOU | 180 s | 2 (1-2) | 2 (2-2) | 2 (2-4) | 4 (4-99) |

- Stands are not limited in this model; the stand columns say how many a site would need. NET1 assumed 6: that binds at DFW Airport from r = 6 (13) and everywhere busy at r = 12.
- Pad occupancy is the biggest unknown: going from 90 s to 180 s roughly doubles the pads needed. No operator has published it.

## Correction (27 Oct 2026)
The engine (net2.js) let aircraft hold in the air without using battery and had four dispatch flaws (planned/REVIEW_AIRTAXI_PERSONAS_2026-10-27.md). AIRTAXI_NET3 reran this grid on the fixed engine (planned/AIRTAXI_NET3_RESULTS_2026-10-27.md): required fleets are unchanged in all 8 cells and pads needed are about the same, but the long-hold cells (p95 holds of several minutes) would have had aircraft landing below reserve or with an empty battery. Read those cells as infeasible, not as long waits. The registered results above stay as run.
