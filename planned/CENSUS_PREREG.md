# Customers where people live (written 2026-10-23 before any study run)
Status: behaviour model of planned operations; no plan check; counting at 4 checks per second. Not a forecast or safety assessment.

## Why
Every study so far drew customers uniformly over each service area (assumption 11 in SKYGRID_MASTER_PLAN.md). Real customers live where people live. The Census file and the FAA airport-ceiling grid are now in hand (founder downloads, 23 Oct 2026). This study asks whether the headline (height allocation's cut, and how it depends on Amazon's heights) survives realistic demand at Houston's filed build-out.

## Layout and traffic
HOUREAL exactly (planned/houreal.js): Amazon at 5 geocoded Houston sites, Wing 75 nests and Zipline 65 Chargers at random, 68 × 68 km counted zone, filed caps, 1 h warm-up, 2 h measured, seeds 1–3.

## Customer modes (planned/census.js)
- **U** uniform (the HOUREAL runs; the engine change below is checked to reproduce them, so they are reused, not re-run).
- **P** population-weighted: pick a Census 2020 block group within the service radius with probability proportional to its population (centres of population, data/CenPop2020_Mean_BG48.csv, 18,638 Texas rows), then place the customer at a Gaussian offset (sigma 400 m, assumed) from that centre; redraw if outside the radius or within 300 m of the site.
- **PA** P plus a strict airport rule: a customer is redrawn (up to 50 times) if the straight line from the site to the customer crosses any FAA UAS Facility Map square with a 0 ft ceiling (data/uasfm_houston.geojson, 3,411 squares, 8 airports); sites standing in a 0 ft square are removed. This is the strictest reading: the companies fly under their own FAA approvals and coordinate with airports, so real practice is between P and PA. Zipline's drop-box leg is not checked (stated limit).
Engine change: lab_engine.flights accepts opt.cust (a customer sampler); without it the engine is unchanged (test_lab_engine 9/9 after the change).

## Heights
A0 Omaha profile (Amazon 61 / 105); T Texas band (55–115 each leg); R reported (69 / 122); A2 allocation (Wing 46–71, Amazon 81 / 115). As HOUREAL.
Runs: 2 new modes × 4 heights × 3 seeds = 24 runs.

## Predictions (pooled over seeds; HOUREAL U values for comparison: A0 315, T 226, R 89, A2 65 wide; A2 cuts 79 / 71 / 27 %)
- **C1:** Under P, A2 cuts A0's wide meetings by >= 65 %. PREDICTION: holds.
- **C2:** Under P, A2 cuts R's wide meetings by <= 50 %. PREDICTION: holds.
- **C3:** A0 wide meetings under P are 0.7–1.3 × those under U. PREDICTION: holds.
- **C4:** Under PA, A2's cut vs A0 is within 10 points of its cut under P. PREDICTION: holds.
- **C5:** Under PA, fewer than 15 % of Amazon customer draws are rejected by the airport rule. PREDICTION: holds.
- Reported: wide and close counts, cuts, pair shares, mean customer distance per company, sites dropped and fallbacks (draws that ended uniform).

## Rules
No changes after the data is in; runner and analysis committed before runs; deviations logged below.
- **K1:** (a) uniform mode reproduces HOUREAL A0 seed 1 exactly (89 wide, 30 close, 19,426 flights); (b) in P, 10,000 test draws for each Amazon site all lie within 300 m–12,070 m of the site; (c) the population inside each Amazon site's radius + 400 m equals the sum of its block groups in the CSV; (d) in PA, no accepted test route from an Amazon site crosses a 0 ft square.

## Deviation log
(none yet)
- (Appended after fingerprint b1034939…; pre-study check only.) K1 PASS: (a) uniform reproduces HOUREAL A0 seed 1 exactly (89 / 30 / 19,426); (b) 50,000 P draws all within 300–12,070 m, no fallbacks; (c) populations within reach: SAHx 911k, STX5 789k, HOU2 678k, HOU6 564k, STX4 329k. **Deviation:** K1c as coded checks these sums are computed from the CSV and positive, not that they equal the sampler's internal total (the sampler does not expose it); weaker than written. (d) 2,000 PA test draws per Amazon site, none of the accepted routes cross a 0 ft square; 4.7 % of Amazon test draws rejected; no Amazon site stands in a 0 ft square.
