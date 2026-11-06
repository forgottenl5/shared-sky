# Air-taxi network, trip time vs driving and fleet size, both metros (written 2026-10-26 before any study run)
Status: scenario model. No air-taxi schedule, demand, fare, pad count or usable range is public for either metro, so every such value below is an assumption and is swept or labelled. Not a forecast. Drive times are Google Maps "typically" ranges read once (26 Oct 2026) for Wed 4 Nov 2026.

## Question
For the announced or demonstrated air-taxi routes in DFW and Houston: (1) how many minutes of getting to and from the pad can a passenger spend before the air taxi stops beating driving (the break-even access time), and (2) how many aircraft does each small network need to keep waits short, as demand, usable range and charging speed vary?

## Inputs (sources: planned/AIRTAXI_INPUTS_2026-10-26.md; taxi/data/drive_times_raw.tsv)
- **Sites (lat, lon).** DFW network: AFW Perot Field Fort Worth Alliance 32.9937909, -97.3100623; DFW Corporate Aviation, DFW Airport 32.9133576, -97.0355091; TOY Toyota HQ Plano 33.0811809, -96.841015 (building location from the Maps URL, pad not public); 49T Dallas CBD vertiport 32.772891, -96.8024551 (closed, reopening reported for about 2029 from Wikipedia only; included as a future node). Houston network: IAH 29.9931058, -95.3416255; HOU Hobby 29.6459141, -95.2768951; EFD Ellington 29.6073333, -95.15875 (AirNav airport reference point, marked estimated). All are Maps/airport points, not pad positions. Straight-line distance from an equirectangular projection at the metro's mean latitude.
- **Routes with demand (both directions).** DFW: AFW-DFW, AFW-TOY, DFW-TOY, DFW-49T. Houston: IAH-HOU, IAH-EFD. Pairs with no drive time read (HOU-EFD, anything involving Sugar Land, 49T-AFW, 49T-TOY) get no demand and no comparison. Joby has flown AFW toward TOY and DFW Corporate Aviation (Sep 2026); Archer names all four DFW sites and IAH/Hobby; Wisk/HAS studied IAH, Hobby, Ellington. No operator has published a route list with times: these routes are the founder's network scenario, not an announced schedule.
- **Aircraft (assumed, swept where marked).** Each request is one party flown alone (no pooling), so fleet sizes are conservative. Profile as lab/airtaxi.js: lift to 15 m at 2.5 m/s, climb on 8:1 at 31 m/s, cruise 610 m at **67 m/s** (150 mph; Joby's homepage says 200 mph top speed, Wisk 120 knots; sensitivity 55 and 89 m/s), mirror descent. Energy per flight = straight-line km x 1.15 + 5 km take-off/landing allowance. Reserve 30 km held back. **Usable range U** (km above the reserve) is swept: 60, 100, 150 (full range = U + 30). **Charging** swept: 1.5 and 3.2 km of range per minute (3.2 comes from Archer's "about 10 minutes between trips of around 20 miles"; 1.5 is a slow case). Charging runs whenever an aircraft is parked, including the turnaround.
- **Sites' ground.** Every site: 2 pads, 6 stands each with a charger (assumed; 49T 5 stands per the FAA record), pad held 90 s per take-off or landing, 300 s turnaround. Dispatch and repositioning exactly as taxi/net.js (earliest-ready aircraft at the origin, else the nearest ready aircraft repositioned, else the request waits up to 30 min and is then lost).
- **Demand.** Poisson, the same rate **r** for every OD entry (each direction counted): r = 0.5, 1.5, 3 per hour. DFW has 8 OD entries (4, 12, 24 trips an hour), Houston 4 (2, 6, 12). Flat across the day (no peaks). Run: 2 h warm-up, 12 h measured, seeds 1-10.
- **Fleet.** Total aircraft n in {1,2,3,4,5,6,8,10,12,16,20,24}, placed round-robin over the sites.
- **Access/egress E (not simulated).** Minutes spent outside the simulation getting to the pad and from the pad (both ends together, including check-in and boarding walk). Swept 20, 40, 60 in the results table; the break-even E* below is the key output.
- **Driving.** The Google range for the same direction and time of day (08:00, 12:00, 17:30); midpoint of the range is the comparison value. Parking and walking at the destination are not added to driving, which favours driving slightly. Air time of day is not modelled (flat demand), so the same air time is compared with all three driving times.

## Base case
U = 100 km, charging 3.2 km/min, r = 1.5 per hour per OD entry.

## Measures
Per metro, case, fleet, route-direction: served share (all requests in the 12 h window, lost and infeasible counted as unserved), median and 90th-percentile wait (request to take-off), median request-to-arrival time T_air (request time to the landing pad being cleared; excludes E). Per seed first, then median over seeds with min-max.
- **Break-even E\*** = driving midpoint − T_air, per route-direction and time of day, using fleet 24 and the base case (so queueing is negligible). Route values average the two directions; "peak" averages 08:00 and 17:30.
- **Required fleet** = the smallest fleet in the list with served share >= 95 % and median wait <= 10 minutes (pooled over the network's routes), per seed; report median over seeds and min-max; 99 means not reached at 24.
- **Door-to-door** air = E + T_air.

## Predictions (written from arithmetic before any run: straight-line distance, flight time from the profile at 67 m/s, about 2 minutes wait, 90 s pad hold, driving midpoints from the table)
- **P1 (peak E\* by route, minutes, base case):** AFW-TOY 33-48; AFW-DFW 22-37; DFW-49T 18-32; IAH-EFD 22-35; IAH-HOU 21-35; DFW-TOY 11-24.
- **P2 (ranking):** AFW-TOY has the highest peak E\* of the six and DFW-TOY the lowest.
- **P3 (noon):** noon E\* is below peak E\* on all six routes, by 3-20 minutes on each.
- **P4 (fleet, base case):** required fleet 6-11 in DFW and 4-8 in Houston.
- **P5 (charging):** slow charging (1.5) needs >= 1.3 times the base fleet in at least one metro.
- **P6 (range):** U = 60 needs >= 1.2 times the U = 150 fleet in at least one metro.
- **P7 (demand):** required fleet at r = 3 is >= 2.5 times that at r = 0.5 in both metros (where both are reached).
- **P8 (headline):** at E = 40 minutes, air beats the driving midpoint at peak on AFW-TOY only, of the six routes.

## Rules
No changes after the data is in; runner and analysis committed before runs; at most two fix attempts on a failing feature check; deviations logged below.
- **K1:** taxi/test_net.js passes (9 checks) before the study runs.
- **K2:** at fleet 24 and r = 0.5, base case, served share >= 99 % in both metros (checks the network is not broken by site layout or range).
- **K3:** every route's straight-line distance and flight time are printed by the runner and match the arithmetic above to within 5 %.

## Deviation log
(none yet)
- (Appended after fingerprint c564d505…; post-run note, nothing changed.) K1 PASS (9 of 9), K2 PASS (both metros), K3 PASS (all six routes within 5 %). Run: 4,360 simulations, no failed run, no fix attempts. P7 is recorded as FAIL as registered: in DFW the target was not reached at 24 aircraft at r = 3, so only Houston (3.3x) was evaluable. Two model quirks found after the run, left as they are and listed as limits: (1) when a request finds no aircraft at its origin, the repositioning rule checks that the aircraft can reach the origin but not that it will have the charge to fly the passenger's trip on landing, so at slow charging some requests are lost after a wasted deadhead flight (seed 5, Houston, r = 0.5: one request); (2) at r = 0.5 there are only 17-28 requests in 12 h, so one lost request crosses the 95 % line and the Houston required-fleet range at r = 0.5 (2 to 24) is noise, not a trend. Medians that include a "99" (not reached at 24) are lower bounds.
- (Appended 2026-10-26 after AIRTAXI_NET2.) Engine flaw found in v1 pad booking; correction rerun on net2 in planned/AIRTAXI_NET1_RECHECK_V2_2026-10-26.md and summarised in the results file. The DFW r = 3 "not reached" was the flaw.

(Appended after fingerprint, 27 Oct 2026; nothing above changed.) Correction to the Inputs line: "Archer names all four DFW sites" is wrong. Archer's own Texas site list (planned/AIRTAXI_INPUTS_2026-10-26.md) does not include Toyota HQ or the downtown Dallas vertiport (49T, closed until about 2029). TOY was a route endpoint in Joby's flights, and 49T is a planned site. The network remains the founder's scenario. Found by the 27 Oct review (planned/REVIEW_AIRTAXI_PERSONAS_2026-10-27.md).
