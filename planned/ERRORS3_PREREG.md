
# ERRORS3: worse GPS downtown, and errors that drift (registration, 5 Nov 2026)

Status: registered before any run of the experimental arms. Pre-run checks K1-K3 passed first.

## Why
ERRORS1, ERRORS2, RISK1 and RISK2 give every drone the same error size everywhere. Among tall buildings, GPS signals reflect (multipath) and errors grow; and real errors wander during a flight instead of staying fixed.

## Sources
- NASA Langley (Gutierrez, Gilabert, Slagel, Dill; Closas, Northeastern University), "Multipath Adaptive Positioning Techniques" (MAPT), IEEE/ION PLANS 2025: in a representative urban canyon in Columbus, Ohio, the 95th-percentile horizontal error was 47.8 m without processing and 4.4 m with MAPT (5,475 data points; the record does not name the receiver platform). No vertical figure.
- Downtown areas: the OpenStreetMap building extracts already used by the city pages (city/osm_houston.json, city/osm_dallas.json), about +-1.8 km around downtown Houston and downtown Dallas: 0.26 % and 0.19 % of the counted areas.

## Drifting errors: settled by argument, not runs
The collision formula (RISK1) uses each pair's relative error at the moment of their encounter. An error that wanders during a flight with the same size at any moment has the same distribution at that moment as a fixed error, so expected collisions are unchanged; only how encounters within one flight correlate changes, which affects the spread between runs, not the expected rate. The same holds for planned-conflict counts, which also count each encounter at its moment. No runs are made for this part, and it is not scored.

## Model
- Encounters as RISK1 (no check) and RISK2 (V2), HEADLINE2 layouts, seeds 1-10, both metros, arms S1 and A2, but searched out to 90 m sideways (engine option opts.cell, default unchanged) and with each closest point of approach's location kept.
- Errors: height L2 (13 m 95 %) everywhere, assumed unaffected by buildings (barometric height). Sideways: L2 (8 m 95 %) outside the downtown box; inside it, the urban-canyon figure (47.8 m raw; 4.4 m processed as a second case); and, as a bound, urban-canyon error everywhere. Errors independent between aircraft (multipath is personal).
- Sizes and formula as RISK1. With canyon error everywhere, encounters planned more than 90 m apart are not counted, so that case is a lower bound.

## Predictions (each must hold for both metros and both arms)
- **G1:** with urban-canyon sideways error downtown only, metro-wide collision risk (no check, L2) changes by less than 5 %.
- **G2:** under 2 % of the encounters within 30 m are downtown (no check).
- **G3:** if every place had urban-canyon sideways error, collision risk without a check changes by at most 25 % either way (for crossing traffic with miss distances spread evenly, the expected overlap does not depend on the sideways error size).
- **G4:** with the V2 check, urban-canyon sideways error everywhere raises the residual collision risk by at least 50 % (the check plans 30 m half-width blocks; larger sideways errors bring in pairs it allowed).

## Checks (K)
- K1: collision-risk unit tests pass. K2: with a 30 m search the current code reproduces RISK1 exactly (DFW A2 seed 1, every encounter and CPA). K3: the 90 m search finds at least every 30 m encounter.

## Limits stated in advance
- Downtown is a box, not a building-by-building signal model; the canyon figure is from one city (Columbus) and one study; height error assumed unaffected; still air; no avoidance. Model quantity, not a safety assessment.

## Deviation log
(none yet)
