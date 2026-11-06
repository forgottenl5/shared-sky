# Air taxis and delivery drones near take-off and landing sites, both metros (written 2026-10-26 before any study run)
Status: behaviour model of planned operations; air-taxi profiles are the FAA's design surfaces, not measured flights; no avoidance, no coordination unless stated. Not a forecast or safety assessment.

## Question
Air taxis cross the delivery-drone heights (below about 122 m) only when climbing out of or descending into a site. For each air-taxi take-off or landing, how many modelled delivery drones come inside standard encounter volumes, how does that change with the drone build-out, and what do two simple protections cost the drones: a no-drone circle around the site, or drones yielding to the air taxi's booked departure/approach (strategic deconfliction)?

## Inputs (planned/AIRTAXI_INPUTS_2026-10-26.md, sources there)
- **Sites.** DFW: **TOY** Toyota North America HQ, Plano (Joby flew toward it in Sept 2026; pad position not public: approximate 33.0826, -96.8366, as VTXPAD; sensitivity below); **49T** Dallas CBD Vertiport, 32.77333, -96.80028 (closed for rebuilding, reopening reported for mid-2029); **AFW** Perot Field Fort Worth Alliance, 32.99028, -97.31944 (Joby's base; an airport, where FAA drone facility maps already restrict drones, which this model does not apply, so AFW counts are upper bounds and carry no prediction). Houston: **38TE** Memorial Hermann Life Flight heliport, Texas Medical Center, 29.7133, -95.3947: helicopters (about 11 missions a day, so about 22 movements), operating today; the only site in either metro with real vertical-flight traffic now. Wisk's Houston sites (IAH, Hobby, Ellington, Sugar Land) are airports with no public pad positions: not studied.
- **Profile** (lab/airtaxi.js): vertical lift to 15 m over the pad at 2.5 m/s, then a straight climb along the departure path at slope **8:1** (EB 105/105A vertiport approach/departure surface, the shallowest standard path, so the most time in the drone heights) at 31 m/s (60 kt, NASA UAM vehicle model), cruise 610 m (Archer's stated 2,000 ft); arrivals mirror this. Sensitivity: **6:1** (about NASA's 1,000 fpm at 60 kt). Pads at ground level. Direction of each movement: uniform random bearing (no published routes). Only the part of each movement at its own site is flown (a departure ends at cruise height; an arrival starts there).
- **Volume.** No air-taxi schedule is public. Each site gets 6 departures and 6 arrivals an hour (Poisson), only to get enough movements; **every measure is per movement**, so it does not depend on this choice (air taxis are too few to interact with each other here).
- **Drones.** Sites, rates and stages exactly as BUILDOUT (Houston: today, early, mid, full) and DFWBUILD (DFW: early, mid, full), Omaha-profile heights, seeds 1-10, 1 h warm-up, 2 h measured.
- **Encounter volumes.** **NMAC** (near mid-air collision): within 500 ft (152.4 m) horizontally and 100 ft (30.5 m) vertically. **Well clear** (ASTM F3442 for small drones): within 2,000 ft (609.6 m) and 250 ft (76.2 m). One count per (air-taxi movement, drone) pair per volume; checked every second.

## Arms (each site separately)
- **none**: drones fly as planned.
- **X1 / X2**: no drones within 1 km / 2 km of the site (flights with a site, customer or pick-up point inside are dropped; paths through the circle detour around it at the same speed).
- **RES**: drones yield to each air-taxi movement booked first: a drone flight that would come within the well-clear volume of a movement's low part (below 206 m) within ±30 s waits 30 s and retries (up to 40 tries; cancelled after).
- Profiles: 8:1 for all arms; 6:1 for none only.

## Measures
Per site, stage, arm: movements; NMAC and well-clear encounters per movement (mean over seeds, seed bootstrap 95 %); share of movements with at least one; encounters by drone company and by distance from the pad; for X1/X2: drone flights dropped and detoured per hour and added flight seconds; for RES: drone flights delayed or cancelled per air-taxi movement and mean delay. Position sensitivity at TOY (full stage, 8:1, none): the same 8 points 500 m away (N, NE, ... NW); report min-max.

## Predictions (8:1, arm none unless stated)
Back of the envelope: VTXPAD found about 19 drones an hour within 1 km of TOY at full DFW build-out. An 8:1 path spends about 35 s below 152 m within about 1.1 km of the pad.
- **P1:** TOY, full: well-clear encounters per movement 0.1-3; NMAC 0.005-0.3.
- **P2:** 38TE, today: NMAC per movement <= 0.02 and well clear <= 0.2.
- **P3:** 38TE: full-stage well-clear per movement >= 5x today.
- **P4:** TOY, full: X1 removes >= 70 % of NMAC encounters and X2 >= 95 % (pooled over seeds).
- **P5:** TOY, full: RES removes >= 95 % of NMAC and of well-clear encounters, with <= 2 drone flights delayed or cancelled per air-taxi movement.
- **P6:** TOY, full: 6:1 gives >= 15 % fewer well-clear encounters per movement than 8:1.

## Rules
No changes after the data is in; runner and analysis committed before runs; at most two fix attempts on a failing feature check; deviations logged below.
- **K1:** lab/test_airtaxi.js passes (14 hand-built checks: profile geometry, encounter volumes, one count per pair, exclusion detour >= R, reservation removes a built conflict).
- **K2:** for seed 1, DFW full: every taxi movement's low samples lie within 2 km of its site; departures start and arrivals end at the site.

## Deviation log
(none yet)
- (Appended after fingerprint 86657060…; pre-study check only.) K1 PASS (14 of 14); K2 PASS for TOY, 49T, AFW at 8:1 and 6:1.
