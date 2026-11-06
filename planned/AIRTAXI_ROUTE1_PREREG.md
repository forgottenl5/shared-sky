# Air taxi: does a flown path 15% longer than the straight line change the answers? (written 2026-10-29 before any study run)
Status: scenario model. Follows the 28 Oct review finding that flight time uses the straight line between sites while battery use already assumes a flown path 15% longer plus 5 km (engine taxi/net5.js: flightTime vs energyKm). Not a forecast: real routes would follow corridors whose length is not known.

## Question
If the time in the air is computed on a path 1.15 times (and, as a sensitivity, 1.30 times) the straight-line distance, how much do (1) the break-even access time E*, (2) the ranking of routes and the "air beats the car at 40 minutes access" headline, and (3) the required fleet change?

## Method
- Engine taxi/net5.js with a new option `profile.timeFactor` (multiplies the horizontal distance used for flight time only; default off; energy already uses 1.15 x distance + 5 km and is unchanged). Everything else as AIRTAXI_NET1: same sites, routes, demand (Poisson, same rate for each direction), profile (lift 2.5 m/s to 15 m, climb 8:1 at 31 m/s, cruise 610 m at 67 m/s), ops (pad hold 90 s, turnaround 300 s, maxWait 1800 s, repositioning), 2 h warm-up, 12 h measured, seeds 1-10. Stands unlimited (the NET1 condition; AIRTAXI_NET4 showed a stand limit with an oversized fleet breaks the break-even comparison). Pads 2 per site. Range U = 100 km usable with the NET1 reserve convention (rangeKm U + 30, reserveKm 30), charging 3.2 km/min.
- Factors f = 1.00, 1.15, 1.30.
- Part A (break-even): fleet 24, r = 1.5 per route direction. E* = driving midpoint - median request-to-landing time, per route, averaged over directions, peak = mean of 08:00 and 17:30, exactly as NET1 (drive times taxi/data/drive_times_raw.tsv).
- Part B (fleet): required fleet = smallest of {1,2,3,4,5,6,8,10,12,16,20,24} with served share >= 95% and median wait <= 10 min, per seed, median over seeds; r = 1.5, same conditions; f = 1.00 and 1.15.

## Predictions (from arithmetic: extra cruise time = (f-1) x straight distance / 67 m/s, straight distances 26.0, 26.8, 27.1, 39.1, 44.9, 46.4 km)
- **P1:** at f = 1.15 peak E* is lower than at f = 1.00 on every route, by 0.7 to 2.1 minutes (arithmetic: 1.0 to 1.7).
- **P2:** at f = 1.30 peak E* is lower than at f = 1.00 by 1.4 to 4.2 minutes on every route (arithmetic: 2.0 to 3.5).
- **P3:** the order of the six routes by peak E* is the same at f = 1.00 and f = 1.15.
- **P4:** the NET1 headline holds at f = 1.15: at E = 40 minutes air beats the driving midpoint at peak on AFW-TOY only, of the six routes.
- **P5:** required fleet at f = 1.15 is within one aircraft of f = 1.00 in both metros (median over seeds).
- **P6:** f = 1.00 reproduces NET1's peak E* for all six routes to within 1.0 minute (check that the new runner matches the old engine's published numbers; NET1 values in planned/airtaxi_net1_results_table.md).

## Rules
No changes after the data is in; runner and analysis committed before runs; at most two fix attempts on a failing feature check; deviations logged below. Diagnosis reruns are labelled exploratory.
- **K1:** `node taxi/test_net.js` still passes (default behaviour unchanged).
- **K2:** at f = 1.15 the six routes' straight distances match the arithmetic above to within 1%, and flight times printed by the runner exceed the f = 1.00 times by (f-1) x cruise-leg time to within 2%.

## Deviation log
(none yet)

(Appended after fingerprint, 29 Oct 2026, before any run.) Clarification, not a deviation: the pad rule is the v5 slot rule (ops.padRule 'slot', as the air-taxi page uses); the registration said "as NET1", whose engine had first-come landing. At fleet 24 the difference is negligible, and P6 checks it against NET1's numbers.
