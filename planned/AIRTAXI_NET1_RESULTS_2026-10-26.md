# AIRTAXI_NET1 results (run 2026-10-26; registration planned/AIRTAXI_NET1_PREREG.md)

Scenario model: every demand, range, charging and ground-access value is an assumption (see the registration). Driving = Google "typically" range midpoint, read once. Not a forecast.

## Predictions

| # | Result | Detail |
|---|---|---|
| P1 AFW-TOY | pass | peak E* 44.5 min (predicted 33-48; seed range 44.0 to 44.5) |
| P1 AFW-DFW | pass | peak E* 32.1 min (predicted 22-37; seed range 31.4 to 32.1) |
| P1 DFW-49T | pass | peak E* 27.6 min (predicted 18-32; seed range 25.0 to 27.6) |
| P1 IAH-EFD | pass | peak E* 31.0 min (predicted 22-35; seed range 31.0 to 31.0) |
| P1 IAH-HOU | pass | peak E* 30.3 min (predicted 21-35; seed range 30.3 to 30.3) |
| P1 DFW-TOY | pass | peak E* 20.0 min (predicted 11-24; seed range 19.6 to 20.0) |
| P2 | pass | highest AFW-TOY (44.5), lowest DFW-TOY (20.0) |
| P3 | pass | peak minus noon E*: AFW-DFW 12.8, AFW-TOY 17.5, DFW-TOY 7.4, DFW-49T 8.6, IAH-HOU 5.6, IAH-EFD 5.6 |
| P8 | pass | routes where peak E* > 40 min: ['AFW-TOY'] |
| P4 DFW | pass | required fleet 8.0 (seed range (8, 10)); predicted 6-11 |
| P4 HOU | pass | required fleet 6.0 (seed range (5, 8)); predicted 4-8 |
| P5 | pass | slow/base fleet ratio: {'DFW': 1.5, 'HOU': 1.33} |
| P6 | pass | U60/U150 fleet ratio: {'DFW': 1.25, 'HOU': 1.2} |
| P7 | **FAIL** | r3/r0.5 fleet ratio: {'DFW': 'not reached', 'HOU': 3.33} |

13 of 14 passed.

## Break-even access time E* (minutes of getting to and from the pad at which air = driving midpoint)

Base case (usable range 100 km, charging 3.2 km/min, r = 1.5), fleet 24 so queueing is negligible. Median over 10 seeds; T_air = request to landing-pad-clear.

| Route | T_air (min) | E* peak (08:00, 17:30) | E* noon | Air beats driving at peak with E = 20 / 40 / 60? |
|---|---|---|---|---|
| AFW-DFW | 11.1 | 32.1 (31.4 to 32.1) | 19.4 | yes / no / no |
| AFW-TOY | 15.5 | 44.5 (44.0 to 44.5) | 27.0 | yes / yes / no |
| DFW-TOY | 10.8 | 20.0 (19.6 to 20.0) | 12.7 | yes / no / no |
| DFW-49T | 11.0 | 27.6 (25.0 to 27.6) | 19.0 | yes / no / no |
| IAH-HOU | 14.1 | 30.3 (30.3 to 30.3) | 24.7 | yes / no / no |
| IAH-EFD | 15.9 | 31.0 (31.0 to 31.0) | 25.4 | yes / no / no |

## Aircraft needed (smallest fleet with >= 95 % served and median wait <= 10 min; median over 10 seeds, min-max; 99 = not reached at 24)

| Metro | Usable range (km) | Charging (km/min) | r = 0.5 | r = 1.5 | r = 3 |
|---|---|---|---|---|---|
| DFW | 60 | 1.5 | 8.0 (5-12) | 16.0 (16-99) | 99.0 (24-99) |
| DFW | 60 | 3.2 | 5.0 (4-6) | 10.0 (8-12) | 99.0 (20-99) |
| DFW | 100 | 1.5 | 5.0 (5-6) | 12.0 (10-16) | 99.0 (20-99) |
| DFW | 100 | 3.2 | 4.0 (4-5) | 8.0 (8-10) | 99.0 (16-99) |
| DFW | 150 | 1.5 | 5.0 (4-5) | 10.0 (10-16) | 61.5 (20-99) |
| DFW | 150 | 3.2 | 4.0 (3-5) | 8.0 (8-10) | 99.0 (16-99) |
| HOU | 60 | 1.5 | 9.0 (4-24) | 11.0 (10-20) | 99.0 (20-99) |
| HOU | 60 | 3.2 | 4.0 (2-24) | 6.0 (6-12) | 12.0 (10-99) |
| HOU | 100 | 1.5 | 4.0 (3-24) | 8.0 (8-12) | 16.0 (12-24) |
| HOU | 100 | 3.2 | 3.0 (2-4) | 6.0 (5-8) | 10.0 (8-20) |
| HOU | 150 | 1.5 | 3.0 (3-4) | 7.0 (6-8) | 12.0 (12-20) |
| HOU | 150 | 3.2 | 3.0 (2-4) | 5.0 (4-6) | 10.0 (8-20) |

## Sensitivity: cruise speed (peak E*, minutes)

| Route | 55 m/s (123 mph) | 67 m/s (150 mph, base) | 89 m/s (200 mph) |
|---|---|---|---|
| AFW-DFW | 31.0 | 32.1 | 33.2 |
| AFW-TOY | 42.5 | 44.5 | 46.6 |
| DFW-TOY | 19.0 | 20.0 | 21.0 |
| DFW-49T | 26.6 | 27.6 | 28.6 |
| IAH-HOU | 28.7 | 30.3 | 32.1 |
| IAH-EFD | 29.0 | 31.0 | 33.3 |

## Notes written after the run
- Fleet size is read from a 95 %-served line. At r = 0.5 there are only 17-28 requests in 12 h, so one lost request moves a seed across the line (Houston r = 0.5 range 2-24 is that noise). Use the r = 1.5 and r = 3 rows.
- A median shown with "99" or ".5" includes seeds where 24 aircraft were not enough: read it as "more than 24 in at least half of the seeds".
- Repositioning does not check the charge needed for the passenger's leg after landing; slow-charging fleet sizes are therefore a little high.
- E* uses fleet 24 (no queueing). It is the best case for air and omits parking and walking on the driving side.
- Cruise speed moves E* by only 2-4 minutes between 123 and 200 mph: the 15 m lift, the 8:1 climb and the pad hold dominate short trips.

## Correction (2026-10-26, after AIRTAXI_NET2)
The engine used here (taxi/net.js, v1) had a pad-booking flaw: each pad kept one "free from" time, so a take-off booked for later blocked every earlier take-off or landing on that pad. Rerun on the fixed engine (planned/AIRTAXI_NET1_RECHECK_V2_2026-10-26.md):
- Break-even access times E\*: unchanged (all within 0.1 min).
- Base required fleet: DFW 8 (unchanged), Houston 5 (was 6).
- **At r = 3, DFW needs 16 aircraft (12-16), not "more than 24".** The v1 result was the flaw, not the network. With the fix P7 passes (DFW 4.0x, Houston 3.0x). P7 stays recorded as a FAIL for the registered run.
- Slow charging: DFW 10 (was 12), Houston 8 (unchanged). Usable range 60 vs 150 km: DFW ratio 1.0 (was 1.25), Houston 1.4 (was 1.2).
