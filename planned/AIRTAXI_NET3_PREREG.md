# Air-taxi network on the fixed engine (v3), with a legal energy reserve, both metros (written 2026-10-27 before any study run)
Status: scenario model, engine taxi/net3.js (v3; checks taxi/test_net3.js plus the v2 checks re-run on v3). Same networks, routes and demand as AIRTAXI_NET1/NET2. Not a forecast.

## Why
The 27 Oct review (planned/REVIEW_AIRTAXI_PERSONAS_2026-10-27.md) found that v2 let aircraft hold in the air for free, had four dispatch flaws, and used a 30 km energy reserve. The FAA powered-lift rule (SFAR, Oct 2024, as reported by AIN, 29 Oct 2024; the 14 CFR 194 text itself not yet read) allows the 20-minute helicopter reserve if the aircraft can land vertically along the whole route, otherwise 30 min by day. v3 (planned/GAP_PLAN_2026-10-27.md Phase 0) fixes the engine. This study measures what changes.

## Arithmetic known before any run (not predictions)
A reserve of t minutes at 67 m/s cruise is 4.02 t km of cruise energy (20 min = 80.4 km; 30 min = 120.6 km). Energy needed per trip (distance x 1.15 + 5 km): DFW AFW-DFWc 36.2, AFW-TOY 56.6, DFWc-TOY 34.9, DFWc-49T 35.7; Houston IAH-HOU 49.7, IAH-EFD 58.1 km. **With NET1/NET2's 130 km battery and a 20-minute reserve, AFW-TOY and both Houston routes cannot be flown at all** (need + reserve = 137.0, 130.1, 138.5 km > 130). No aircraft range in this network is verified (planned/AIRTAXI_INPUTS_2026-10-26.md: Joby "100 mi with reserves" from a secondary source; Archer Midnight designed for back-to-back trips of about 20 miles), so usable range is swept.

## Inputs
- Networks, sites, routes, profile, turnaround 300 s, max wait 30 min, repositioning on, charging 3.2 km/min, demand r = 1.5, 3, 6, 12 per OD entry, 2 h warm-up, 12 h measured, seeds 1-10: as NET2.
- **Engine v3** (holding uses cruise energy per minute held; landings below reserve are counted, not prevented; the charging rule is unchanged: an aircraft charges to the trip's energy plus the reserve).
- **Aircraft arms** (battery as km of cruise energy = usable + reserve):
  - **OLD:** 130 km battery, 30 km reserve (NET2's aircraft) — isolates the engine fixes.
  - **U60, U100, U160:** usable 60 / 100 / 160 km plus a 20-minute reserve (batteries 140.4 / 180.4 / 240.4 km).
  - **U100-30:** usable 100 km plus a 30-minute reserve (220.6 km).
- **Fleet search** (every arm): as NET2 (8 pads, 90 s pad occupancy, stands unlimited; smallest fleet in NET2's list serving >= 95 % with median wait <= 10 min; 96 if none).
- **Pad grid** (arms OLD and U100): pads 1, 2, 4 x occupancy 60, 90, 180 s at the arm's required fleet, as NET2.
- One exploratory timing run was made before this registration (DFW, OLD aircraft, r = 12, 1 pad, 180 s, 48 aircraft): 0.19 s; it showed 175 landings below reserve in an overloaded case (26 % served). Not part of the study.

## Measures
Required fleet (median and range over seeds) per arm, metro, r; pads needed (as NET2) for OLD and U100; share of landings below reserve and the 95th-percentile reserve left at those landings (minutes at cruise); share of requests on infeasible routes.

## Predictions
NET2 required fleets (median): DFW 8 / 14 / 24 / 48, Houston 5 / 8 / 14 / 28 at r = 1.5 / 3 / 6 / 12.
- **F1 (engine fixes):** OLD on v3 needs no more aircraft than NET2 in at least 6 of the 8 metro x r cells (waiting passengers can now be served from any site).
- **F2 (holding energy):** for OLD, in every pad-grid case that meets NET2's pad criterion (p95 hold and departure wait <= 2 min at every site), landings below reserve are <= 5 % of landings.
- **F3 (legal reserve, small battery):** U60 needs at least as many aircraft as OLD in every metro x r cell, and at least 1.25 x OLD at r = 3 in Houston (its routes need 50-58 of the 60 km usable, so aircraft must charge almost to full before each trip).
- **F4 (legal reserve, big battery):** U160's required fleet is within one step of NET2's fleet list of OLD's in every metro x r cell.
- **F5 (30-minute reserve):** U100-30 needs no fewer aircraft than U100 in any cell.

## Rules
- **K1:** taxi/test_net3.js passes; taxi/test_net2.js re-run on net3 passes; taxi/test_net2.js and taxi/test_net.js still pass on v2 and v1.
- **K2:** OLD at r = 1.5 needs within 2 aircraft of NET2's (DFW 8, Houston 5), medians.
- **K3:** NET2's K3 consistency check in every pad-grid run.
- Runner and analysis committed before runs. No changes after the data. At most two fix attempts on a failing check. NET1 and NET2 stay as run; their results files get a pointer to this study. Deviations logged below.

## Deviation log
(none yet)
