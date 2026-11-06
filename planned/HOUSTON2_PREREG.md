# Phase 1b, Houston full filed build-out: when do different operators' plans start meeting? (study, written 2026-10-22 before any code or run)
Status: behaviour model of operations as filed (PLANNED_OPS_INPUTS_2026-10-22.md); planned tracks only, no avoidance, no booking; site positions random [assumed]; not a forecast or safety assessment.
Background: HOUSTON1 (5 real Cypress-area sites, ~9 km apart) found 0-0.35 cross-operator planned passes per hour vs 64-162 within operators. The filed Houston build-out is far denser: Wing up to 75 nests, Zipline up to 65 Chargers (1,300 Dropboxes), Amazon 6 hubs.
Question: as site density rises toward and beyond the filed build-out, how fast do cross-operator planned meetings grow, and at what density do they stop being rare?

## Design
- Region 44 x 44 km; encounters and overflights measured only in the central 12 x 12 km (144 km^2), so every flight that can reach it is simulated (largest radius 16.1 km).
- Site density set by Wing nest spacing d (one nest per d^2): d = 9, 6, 4, 3, 2 km. Zipline Chargers at 65/75 and Amazon hubs at 6/75 of Wing's density (the filed Houston ratio). Sites placed uniformly at random [assumed] (independently per operator).
- Profiles and caps exactly as HOUSTON1 (Wing 400/day over 15 h; Amazon 1,000/day over 16.5 h; Zipline Texas-draft cap 1,000/day per Charger, 95 % in 15 h; 20 Dropboxes per Charger within 5 km). Filed caps on overlapping service areas are NOT applied [assumed: upper bound].
- 1 h warm-up + 2 h measured; 3 seeds per density. Planned positions computed every second from piecewise-linear flight segments.

## Measures (central zone)
- Cross-operator planned meetings ("wide" 30 m / 10 m; "close" 15 m / 5 m) per hour, per km^2 and per 1,000 flights, by operator pair; same-operator meetings for reference.
- Overflights (passes of any height) per km^2 per day: median and busiest 1 km cell.

## Predictions
- Q1 Cross-operator wide meetings per hour in the central zone grow with site density with a log-log slope (vs sites per km^2) in [1.6, 2.4] (density squared). PREDICTION: holds.
- Q2 At d = 2 km, cross-operator wide meetings exceed 10 per hour in the central 144 km^2. PREDICTION: holds.
- Q3 Amazon takes part in more than half of cross-operator wide meetings at d = 9 km, but in less than half at d = 2 km (Wing-Zipline meetings during Zipline climbs and descents grow faster than Amazon's share). PREDICTION: holds.
- Q4 (reported): ratio of cross- to same-operator meetings by density; overflights per km^2 per day (median, busiest cell).
No criterion or parameter changes after data; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks
- G1 Segment model equals HOUSTON1's 1-s tracks: for one flight of each operator, positions agree within 1 m at every second.
- G2 On HOUSTON1's own S1 site set and seeds (same flights), the new counter gives identical wide and close cross- and same-operator counts.
- G3 Site counts per operator equal the density rule in expectation (within 20 % at d = 4 km over 3 seeds).

## Deviation log
- G1-G3 PASS before the study (segments equal 1-s tracks to 1e-14 m; counts identical to HOUSTON1 S1 on seeds 1-3; site counts at d = 4 km 121/105/10 vs 121/104.9/9.7).
