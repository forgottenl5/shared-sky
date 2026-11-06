# HELI1: real helicopter traffic against the drone layers (registration, 5 Nov 2026)

Status: registered before any helicopter-versus-drone number was computed.

## Why
Every earlier study has drones meeting only other drones. Houston and Dallas-Fort Worth also have manned helicopters: hospital, offshore crew, news and police, tour and private. This study asks where real helicopters fly relative to the drone layers and how much drone traffic they would meet. It counts exposure, not collisions.

## What I knew before writing
Coverage test, one weekday (20 May 2025) only: 45 Houston and 73 DFW rotorcraft; Houston points by pressure altitude: 747 below 500 ft, 7,371 at 500-1,000 ft, 7,423 at 1,000-2,000 ft, 819 above (ground elevation not yet subtracted); DFW had no point below 500 ft and 725 on the ground. I had not computed any height above ground, any map or any overlap with drone positions.

## Data
- Source: adsb.lol daily archive (ODbL), github.com/adsblol/globe_history_2025, instance readsb-prod-0. 14 days of 2025, picked before looking at any of them, spread across months and weekdays: 14 Jan, 22 Feb, 12 Mar, 6 Apr, 20 May, 15 Jun, 9 Jul, 2 Aug, 26 Aug, 13 Sep, 8 Oct, 26 Oct, 18 Nov, 6 Dec.
- Kept: aircraft with at least one point of ADS-B emitter category A7 (rotorcraft), and only points inside a box around each metro (Houston 29.3-30.3 N, 95.9-94.9 W; DFW 32.4-33.3 N, 97.6-96.4 W). Aircraft identifiers are replaced by running numbers; no registrations are kept or published. 1,199 aircraft-days.
- Height above ground = pressure altitude x 0.3048 minus an assumed ground elevation: Houston 15 m, DFW 180 m (rounded from memory, not looked up; sensitivity +-30 m Houston, +-50 m DFW reported, not scored). Pressure altitude is not geometric height, so a further tens of metres of error are possible.
- Coverage limit: adsb.lol is volunteer receivers; low flights can be missing, and not every helicopter transmits. Counts are a floor.

## Model
- Drone positions: HEADLINE2 layouts S1 and A2, both metros, seeds 1-10 (same flights as RISK1), sampled every 10 s over the 1-hour measure window; counted in 150 m x 150 m x 20 m cells. Mean drones per cell = counts / (samples x seeds). Traffic level is the sim's, as in every study.
- Helicopter: a point is "in the zone" if it is within the counted square (engine coordinates, half-size = cfg.zone). Each point carries the seconds to the next point of the same aircraft (capped at 60 s). Only seconds between UTC 13 and 03 (drone operating hours as in WX1) are used.
- Exposure lambda for a helicopter point = sum of mean drones over the 3 x 3 x 3 cells around its cell: a box of 450 m x 450 m x 60 m. Time of day is not matched (the sim has flat demand); helicopters and drones share only the place and height.

## Predictions (each applies to both metros; H4 and H5 to both arms)
- **H1:** under 15 % of helicopter seconds in the zone are below 150 m above ground.
- **H2:** under 8 % of helicopter seconds in the zone are inside the drone height band, 46 to 121 m above ground.
- **H3:** among 1 km x 1 km cells that helicopters cross below 150 m above ground, the busiest 5 % of cells hold more than 50 % of those seconds.
- **H4:** the mean lambda over helicopter seconds below 150 m above ground is under 0.05 drones, for both arms.
- **H5:** the mean lambda for A2 differs from S1 by less than 30 % (relative).

## Checks (K)
- K1: every day file has at least 40 aircraft in both metros combined and decoded without errors. K2: Houston S1 seed 1 regenerates 19,426 flights (the number seen when this was designed).

## Limits stated in advance
- Elevation assumed, pressure altitude not geometric; volunteer coverage misses low flights; 14 days; helicopters and drones are not matched in time; exposure is a box count, not a collision or an encounter rate; helicopters could avoid drones or be told to; still air. Model quantity, not a safety assessment.

## Deviation log
(none yet)
