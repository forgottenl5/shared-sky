# Phase 1, Houston (Cypress cluster): where filed operations of Wing, Zipline and Amazon meet (study, written 2026-10-22 before any code or run)
Status: Sky-Grid behaviour model of operations as filed with the FAA (PLANNED_OPS_INPUTS_2026-10-22.md); not a forecast of actual traffic and not a safety assessment. Geometry and scheduling only (DIRECTION_2026-10-22.md): no avoidance model, no booking system of our own invention.
Question: when the three operators fly their filed profiles from their real Cypress-area sites at their filed caps, how often, where and at what heights do their PLANNED flights come close to each other's? This load falls on cross-operator coordination (ASTM F3548 intent exchange), which the FAA's per-operator reviews did not assess jointly.

## Sites (local metres around 29.90 N, 95.65 W; positions approximate, [assumed] +-2-3 km)
| Id | Operator | Site (public source) | Status | Position used |
|---|---|---|---|---|
| W1 | Wing | Walmart, 15955 FM 529 (77095) | flying | ZIP 77095 centroid 29.8941, -95.6481 |
| W2 | Wing | Walmart, 6060 N. Fry Rd, Katy | flying | 29.857, -95.718 (on N. Fry Rd, north of W3) |
| W3 | Wing | Walmart, 1313 N. Fry Rd, Katy | flying | 29.792, -95.718 (on N. Fry Rd near I-10) |
| Z1 | Zipline | Cypress base (no address published) | flying | ZIP 77429 centroid 29.9766, -95.6358 |
| A1 | Amazon | STX5, 5215 Campbell Rd (77041) | cleared, not flying | ZIP 77041 centroid 29.8602, -95.5817 |
Sources: DroneXL Houston tracker; Community Impact (Zipline Cypress, May 2026).

## Filed profiles used ([primary] unless marked)
- Wing: vertical climb to 7 m, hover 30 s (package loading), climb to an en route height drawn uniformly from 46-91 m [band primary, uniform draw assumed], cruise 26.4 m/s straight to the customer, descend to 7 m, hover 30 s, climb, return straight at the same height, land. Radius 9.7 km. 400 deliveries per nest per day over 7:00-22:00.
- Amazon MK30: vertical 0 -> 35 m, climb to outbound 61 m, cruise 30 m/s; at the customer descend to 43 m then vertically to 4 m, 4 s, climb to 60 m, climb to inbound 105 m, return, descend to 60 m, land vertically. Radius 12.1 km. 1,000 flights per day over 6:00-22:30.
- Zipline P2: vertical climb from the dock to 101 m, cruise 31.3 m/s; delivery = 3 transits: Charger -> Dropbox (hover 120 s at 101 m) -> customer (hover 75 s at 101 m) -> Charger; all at 101 m. Radius 16.1 km. Dropboxes: 20 per Charger [Houston 1,300 / 65], placed uniformly within 5 km of the Charger [assumed]. Volume: DFW-filed 400 per day (S0, S1) or Texas-draft 1,000 per day (S2), 95 % within 7:00-22:00.
- Customers uniform over each site's service disc, >= 300 m from the site [assumed; no housing data]. Vertical rates 5 m/s; turns instantaneous; no wind.
- Simulated window: the busiest common hours at the filed daily averages (no peak factor) [assumed]; sensitivity with a peak factor 1.5 reported.

## Scenarios
- S0 live sites: W1-W3 + Z1 (400/day).
- S1 cleared plans: S0 + A1.
- S2 Zipline at the Texas-draft cap: S1 with Z1 at 1,000/day.

## Measures (planned trajectories, 1 s steps, 4 h window x 5 seeds)
- Planned encounters between two flights of DIFFERENT operators: "wide" = horizontal < 30 m and vertical < 10 m; "close" = < 15 m and < 5 m. Counted once per episode. Split by operator pair, by phase (both cruising; one hovering; one climbing or descending) and by place (within 300 m of any site; elsewhere).
- Same for flights of the SAME operator (reference only: each operator has its own internal deconfliction).
- Overflight map: passes below 122 m (400 ft) per km^2 per day, 1 km grid.

## Predictions
- P1 In S1 and S2, more than half of the wide cross-operator encounters involve a Zipline aircraft at 101 m and an Amazon aircraft on its inbound leg (105 m). PREDICTION: holds.
- P2 In S0 (no Amazon), at least 80 % of wide Wing-Zipline encounters happen while at least one of the two is climbing or descending (Wing cruises at most 91 m; Zipline cruises and hovers at 101 m). PREDICTION: holds.
- P3 From S1 to S2 (Zipline volume x2.5), Wing-Zipline and Amazon-Zipline wide encounters per hour each grow by a factor within [2.0, 3.0]. PREDICTION: holds.
- P4 (reported): encounters per hour and per 1,000 flights by pair and phase; locations; overflights per km^2 at the busiest grid cell and the median cell; peak-factor sensitivity.
No criterion or parameter changes after data; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- H1 profile replay: for one flight of each operator the planned track reproduces the filed heights, hover times and speeds (heights within 0.5 m, hovers within 1 s, cruise speed within 1 %).
- H2 counting: two synthetic crossing flights of different operators at the same height produce exactly one wide and one close encounter; separated by 12 m vertically, zero.
- H3 demand: 4 h at Wing's 26.7 per hour gives orders within 15 % of 107; every customer inside the service disc.

## Deviation log
- H1-H3 PASS before the study (Wing hovers 60 s at 7 m, cruise 26.46 m/s; Amazon heights 61/105 m, 29.92 m/s; Zipline 195 s hover at 101 m, 31.25 m/s; counting 1/1 and 0/0; W1 108.2 orders per 4 h vs 106.7).
