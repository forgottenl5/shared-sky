# Air-taxi network, site capacity and queues, both metros (written 2026-10-26 before any study run)
Status: scenario model, engine taxi/net2.js (v2; checks taxi/test_net2.js). As in AIRTAXI_NET1, no pad count, stand count, pad occupancy time, schedule or demand is public for any site: all are assumptions, swept or labelled. Not a forecast.

## Question
As demand on the AIRTAXI_NET1 networks grows, when do the sites themselves become the limit? Specifically: how many pads (FATOs) does each site need before arriving aircraft are held and departing ones wait for a pad, and how many parking stands does each site need for the fleet that demand requires?

## Inputs
- **Networks, routes, aircraft, profile, dispatch:** exactly as AIRTAXI_NET1 (DFW: AFW, DFW Corporate Aviation, TOY, 49T; Houston: IAH, HOU, EFD; same coordinates and routes), base aircraft only (usable range 100 km, charging 3.2 km/min), turnaround 300 s, max wait 30 min, repositioning on, engine v2 (repositioning now also checks the charge needed for the passenger's leg on landing).
- **Demand:** r = 1.5, 3, 6, 12 trips an hour per OD entry (DFW 12, 24, 48, 96 trips an hour; Houston 6, 12, 24, 48). Flat, Poisson, 2 h warm-up, 12 h measured, seeds 1-10.
- **Fleet:** for each metro, r and seed, the smallest fleet in {2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96} that serves >= 95 % with median wait <= 10 min with ample ground (8 pads, 90 s pad occupancy, stands not limited); 96 if none. That fleet is then used in every pad case of the same metro, r and seed. Same search, slow charging (1.5 km/min), r = 1.5 only, for the v1 comparison.
- **Pads:** 1, 2 or 4 at every site (49T included; its real deck has 2). **Pad occupancy** (time a take-off or landing holds a pad, including hover, touchdown and taxi clear): 60, 90, 180 s (none published; 90 s was NET1's value). A take-off waits for a free pad; an arrival is held in the air until one is free (first come, first served, one queue per site for both).
- **Stands:** not limited in the model; the measure is how many are occupied (aircraft on the ground between landing-pad-clear and take-off).

## Measures (measured window only; per seed, then median over seeds with min-max)
Per metro, r, pads, occupancy, site: movements (take-offs + landings) per hour and the busiest clock hour; **p95 arrival hold** (air hold before landing); **p95 departure pad wait** (ready to take off until the pad is free); served share and median request wait for the network; **stands**: maximum aircraft on the ground at once, and the time-weighted 95th percentile. Repositioning flights as a share of all flights.
- **Nominal pad utilisation** at a site, used in the predictions: rho = (trips an hour with that site as origin or destination, from r only, no repositioning) x occupancy / (3,600 x pads). Busiest sites: DFW Corporate Aviation (6 r an hour) and IAH (4 r).
- **Pads needed** = the smallest of 1, 2, 4 with p95 arrival hold and p95 departure pad wait both <= 2 min at every site of the network.

## Predictions (written from queue arithmetic before any run: a single pad shared by take-offs and landings behaves roughly like an M/D/c queue, so mean wait = rho x occupancy / (2 (1 - rho)) for one pad, and the p95 is about three times the mean)
- **Q1a (light load):** at the busiest site, p95 arrival hold <= 2 min in every case with rho <= 0.35.
- **Q1b (heavy load, 1 pad):** at the busiest site, p95 arrival hold > 2 min in every 1-pad case with rho >= 0.6 and occupancy >= 90 s.
- **Q2 (pads needed, 90 s):** DFW: r 1.5 -> 1; r 3 -> 1 or 2; r 6 -> 2; r 12 -> 4. Houston: r 1.5 -> 1; r 3 -> 1; r 6 -> 2; r 12 -> 2.
- **Q3 (180 s):** at 180 s, pads needed is at least one step higher (1 -> 2 -> 4, or "more than 4") than at 90 s for r >= 3 in both metros.
- **Q4 (stands, 2 pads, 90 s):** busiest-site maximum stands occupied <= 6 at r = 1.5 in both metros (so NET1's 6-stand assumption does not bind); >= 12 at some DFW site at r = 12.
- **Q5 (repositioning fix):** slow-charging required fleet at r = 1.5 with v2 is <= NET1's v1 value (DFW 12, Houston 8).
- **Q6 (repositioning share):** repositioning flights are 2-25 % of all flights at r = 1.5, 2 pads, 90 s, in both metros.

## Rules
No changes after the data is in; runner and analysis committed before runs; at most two fix attempts on a failing feature check; deviations logged below.
- **K1:** taxi/test_net2.js passes (13 checks) and taxi/test_net.js still passes (v1 untouched).
- **K2:** v2 base-case required fleet at r = 1.5 (8 pads, ample ground) within plus or minus 2 of NET1's (DFW 8, Houston 6), medians over seeds.
- **K3:** in every run, take-offs at a site = stays ended there before the end of the run (stand bookkeeping is consistent), and every arrival hold and departure wait is >= 0.

## Deviation log
(none yet)
- (Appended after fingerprint daf73ed2…; before any study run.) Engine fix, attempt 1 of 2: the runner's K3 check showed departure pad waits of over an hour at sites under half their pad capacity. Cause, in v1 and the first v2: each pad kept one "free from" time, so a take-off booked for later (an aircraft still charging) blocked every earlier booking on that pad. net2.js now books the earliest free slot on any pad (booked slots kept per pad). New check V5 (sparse traffic, one pad: no departure waits more than one occupancy; v1 shows phantom waits); test_net2.js now has 14 checks, all pass; test_net.js (v1) unchanged and passing. K3 passes on the three check runs. **Added check K4:** because v1 has the same flaw, rerun AIRTAXI_NET1's base case (fleet 24 break-even E\* and base required fleet) on net2 and report the change in NET1's results file; NET1's registered results stay as run.
- (Appended after the run.) No fix attempts during the run. K4 done: planned/AIRTAXI_NET1_RECHECK_V2_2026-10-26.md. Predictions scored as registered: 6 of 14 pass. Post-run diagnosis of the Q2 misses (seed 1, one pad, 90 s): at about 30 % pad use, half of departures wait, against about 30 % in a first-come queue, because arrivals book their landing slot at take-off 10-15 min ahead and departures decided later must fit between them. The registered arithmetic assumed a first-come queue. A post-hoc table (air holds only) is in the results file, labelled as such.
