# Drones over air-taxi landing spots in DFW (study, written 2026-10-25 before any code or run)
Status: behaviour model of planned drone delivery tracks (DFWBUILD sites and rates); air taxis are not simulated. Not a forecast or safety assessment.

## Question
Joby flew eVTOL demonstration flights in DFW on 10–14 Sept 2026 from Perot Field Fort Worth Alliance Airport (AFW) to DFW Airport's Corporate Aviation FBO, Arlington, and Toyota Motor North America's HQ campus in Plano (Joby press release, 10 Sept 2026). Air taxis pass through drone heights (below 122 m) only near take-off and landing. How many modelled delivery drones pass close to these spots?

## Points (DFW frame of dfwreal.js)
- **TOY** Toyota HQ, 6565 Headquarters Dr, Plano (address: Wikipedia). Coordinates NOT sourced: approximate 33.0826, -96.8366. Position error handled by sensitivity (below).
- **AFW** 32.99028, -97.31944 (Wikipedia airport coordinates).
- **DFW** approximate 32.8998, -97.0403 (airport reference point, from memory, not sourced).
- Arlington: no landing spot published; not studied.
- AFW and DFW are airports where the FAA's drone facility maps set low or zero ceilings; the DFW model does not exclude airports, so counts there are **upper bounds only** and carry no prediction.

## Setup
DFWBUILD sites (cfg half 57 km, zone 40 km), stages early / mid / full, Omaha profile heights (heights do not matter: every drone is below 122 m). Seeds 1–10. Measured window: warm-up 3,600 s, then 7,200 s.

## Measures (per point, stage, seed)
- **Passes:** distinct drone flights with at least one airborne second (z > 1 m) inside the measured window within R horizontally of the point, R = 300 m and 1 km; per hour; by operator.
- **Occupancy:** mean number of airborne drones inside the R = 1 km cylinder at a random second.
- **Position sensitivity (TOY only, full stage):** the same passes for 8 points 500 m away (N, NE, … NW); report min–max.

## Predictions (registered; TOY, full stage unless stated)
Back-of-envelope before code: Wing and Zipline about 2,000 flights an hour each over about 6,400 km², round trips about 13 km (Wing) and 21 km (Zipline), so about 11 km of track per km² per hour, giving about 10 flights an hour through a 1 km circle.
- **V1:** median over seeds of passes per hour at R = 1 km is 5–40.
- **V2:** median at R = 300 m is 1–12.
- **V3:** Amazon passes at TOY are 0 in every seed and stage (its nearest DFW site is 16.8 km away; delivery radius 12.07 km).
- **V4:** early-stage median at R = 1 km is at most 25 % of the full-stage median.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- **K1:** a hand-built flight passing 200 m from a point at 50 m height, inside the window, counts as one pass at 300 m and one at 1 km; the same flight 1.2 km away counts zero at both.
- **K2:** a flight entirely on the ground (z <= 1) near the point counts zero; a flight passing only before the window counts zero.

## Deviation log
(none yet)
