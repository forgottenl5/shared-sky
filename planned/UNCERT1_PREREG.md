# UNCERT1 pre-registration: how wide are the air-taxi headline numbers once the inputs are uncertain, and which input matters most (27 Oct 2026)

Written 27 Oct 2026 before any UNCERT1 draw was run. Scenario analysis.

## Why
Every air-taxi result so far shows one number from fixed inputs, with only seed spread as "uncertainty". ACCESS1's own exploratory check showed the headline moving by a factor of 14 with the road speed alone. This study draws the uncertain inputs from stated ranges (Latin hypercube, 100 draws each), reruns two headlines, and reports the spread and which input drives it.

## The ranges are my assumptions
None of these ranges is a published figure; they bracket the point values used so far and are the main thing a reader may disagree with. Every range is reported next to its result.

**Access headline** (ACCESS1b, all twelve Archer sites, peak, share of jobs that save >= 10 min; reference = the registered point 3.05 % DFW and 1.28 % Houston from out/access1b_v1.json):
- f, speed on the access legs to the site, as a fraction of the calibrated road speed: 0.6 to 1.0 (1.0 = registered).
- g, speed on the direct drive, as a fraction: 0.85 to 1.15 (a slower direct drive helps flying).
- h, scale on road circuity: 0.9 to 1.1 (calibrated 1.269).
- P, combined processing time at both ends: 14 to 30 min (registered 20).

**Network headline** (required fleet to serve >= 95 % with median wait <= 600 s, NET3's test; engine v5, rule slot, aircraft arm U100, 4 pads per site, unlimited stands, demand r = 3 and r = 6 per OD entry; one seed per draw, seed = 1 + (draw index mod 10)):
- pad occupancy: 60 to 180 s (registered 90).
- turnaround: 180 to 600 s (registered 300).
- charging rate: 2.0 to 4.5 km of range per minute (registered 3.2, from Archer marketing).
- route factor on flown distance: 1.10 to 1.30 (registered 1.15).
Reference for the fleet = the median over seeds 1-10 of the required fleet at the registered inputs under the same settings (computed in check K2).

## Method
Latin hypercube, 100 draws per headline, numpy seed 20261027, fixed in planned/uncert1_draws.json before the runs. Report 5th, 25th, 50th, 75th and 95th percentile of each headline, and the Spearman rank correlation of each input with the headline. Fleet search grid as NET3.

## Predictions
- **U1:** the access share has 95th/5th percentile ratio >= 5 in both metros.
- **U2:** f has the largest absolute Spearman correlation with the access share in both metros.
- **U3:** the registered point (3.05 %, 1.28 %) lies above the 75th percentile of the draws in both metros (the point is optimistic).
- **U4:** the required fleet at r = 3 has 95th/5th percentile ratio <= 1.6 in both metros (fleet is fairly robust to these ranges).
- **U5:** the charging rate has the largest absolute Spearman correlation with the required fleet in all four cells (2 metros x r = 3, 6).
- **U6:** the reference fleet lies within the 5th to 95th percentile range of the draws in all four cells.
Pass requires the condition in every cell named. Not edited after the fingerprint.

## Checks before the run
- **K1:** the access code at f = g = h = 1, P = 20 reproduces out/access1b_v1.json's share for both metros (to 1e-9).
- **K2:** at the registered inputs under the network settings, the median required fleet over seeds 1-10 is within one grid step of NET3's (DFW 14 and 24, Houston 8 and 14 at r = 3 and 6).

## Not claimed
Ranges are assumed. Demand levels are scenario settings, not uncertain inputs here. Noise, stands (STANDS1/PADRULE1) and the weather are not varied. Inputs are drawn independently. 100 draws with one seed each cannot resolve small differences in correlation.

## Files
planned/uncert1_draws.json, uncert1_access.py, uncert1_fleet.js, uncert1_analyze.py, out/uncert1_*.json. At most 2 fix attempts per problem, logged below.

## Deviation log
(none yet)
