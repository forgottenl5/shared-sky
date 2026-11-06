# AIRTAXI_NET4 results (28 Oct 2026). Registration planned/AIRTAXI_NET4_PREREG.md (fingerprint 38112cd7…); runner and analysis committed before any run (6ae7a5e). K1-K3 passed. 110 jobs (20 Part A runs, 90 Part B fleet searches). No deviations.
Table: planned/airtaxi_net4_results_table.md.

## Result in one line
**Archer's announced DFW network needs about 12, 18 and 36 aircraft for 12, 24 and 48 trips an hour, more than the 7-site network on the 3D page in every seed; in Houston, at 100 km usable range, the two Galveston links (to IAH and Sugar Land) cannot be flown at all, which removes about 30 % of the commute-shaped demand.** The registered break-even recheck (A1) failed because of a setup error in this registration; an exploratory rerun without it reproduces the published break-even times exactly. 6 of 7 predictions passed.

## Predictions
- **A1 FAIL.** E* on v5 matched NET1 on the four DFW routes (within 0.2 min) but not in Houston (IAH-HOU -8.6, IAH-EFD -7.2 min), and single seeds had request-to-landing times of hours. Cause (exploratory, planned/diag_net4_a1.js, after the runs): I registered 10 stands per site with a deliberately oversized 24-aircraft fleet. Under v5, stands limit landings, so in some seeds a site's stands filled (most often IAH, which both Houston routes share) and arriving aircraft waited in the air for up to about 2.5 hours. With unlimited stands (the NET1 condition), E* equals NET1 on all six routes to 0.1 min (out/diag_net4_a1_unlimited.json). The registered failure stands; the reading is that **the published break-even (20.0-44.5 min) is unchanged on engine v5 when stands are not limiting**.
- **A2 PASS.** Ranking unchanged: AFW-TOY highest (44.5), DFW-TOY lowest (20.0).
- **B1 PASS.** Archer DFW network, U100: 12 trips/h 12 aircraft (10-14), 24: 18 (18-20), 48: 36 (32-36). All 30 seed searches reached the test.
- **B2 PASS.** At 24 trips an hour all 10 seeds need more than the 7-site network's 14.
- **B3 PASS.** At U100 exactly GLS-IAH (110.9 km of energy) and GLS-SGR (104.4 km) are infeasible: 30.3 % of Houston requests. At U144 none are.
- **B4 PASS.** Houston, U100 (feasible pairs only): 6 trips/h 8 (6-10), 12: 11 (8-24), 24: 16 (14-18). U144 (with the Galveston trips): 12, 15 and 24, but only 7 and 6 of 10 seeds reached the test at 12 and 24 trips an hour within the 12-stand limit.
- **B5 PASS.** DFW at 24 trips an hour: 20.5 % of flights are empty repositioning flights.

## What it adds
- A first fleet size for the network Archer actually announced, with demand shaped by where commuters would gain (ACCESS1), not a flat invented rate. Totals are still scenario settings.
- **Galveston is a range problem.** With 100 km usable after the 20-minute reserve, Archer's Galveston site is reachable only from the downtown helipad (THO), not from IAH or Sugar Land. Wisk's stated 144 km with reserves would cover all links, but then Houston's long trips need far more aircraft and parking (U144: 3-4 of 10 seeds not served within 12 stands per site at 12-24 trips an hour).
- **Engine limitation found (not fixed):** when stands are full, v5 lets an aircraft hold in the air without limit; it counts landings below reserve but never diverts. In real operations those aircraft would divert or be held on the ground before take-off. Results that rely on long holds should be read as infeasible, as NET3 already noted. Part B's test excludes such cases (95th-percentile hold <= 120 s, below-reserve landings <= 1 %).

## Limits
- Demand weights cover the top 10 directional pairs (86 % of benefiting jobs); totals are settings, not forecasts. Flat over 12 daytime hours.
- Generic four-seat aircraft; pads, stands and charging assumed. Seeds 1-10.
- No drive times were read for Archer's pairs (hand-read only, per the project rule), so Part B has no break-even.
