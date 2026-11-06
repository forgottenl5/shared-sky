# Phase 2a: height allocation between operators inside their filed bands (study, written 2026-10-22 before any code or run)
Status: behaviour model of filed operations (planned tracks only; no avoidance, no booking); paired comparison on HOUSTON2's sites and demand (same seeds). Not a forecast or safety assessment.
Background: HOUSTON2 found Amazon in ~90 % of cross-operator planned meetings at every density: its filed inbound baseline (345 ft, 105 m) sits 4 m from Zipline's 330 ft (101 m) cruise and hovers; its outbound baseline (200 ft, 61 m) sits inside Wing's 150-300 ft band.
Question: can a height allocation that stays INSIDE each operator's own filed band remove most cross-operator meetings, and what does it cost?

## Arms (all other profile elements as HOUSTON2)
| Arm | Wing en route | Amazon outbound | Zipline cruise + hovers | Amazon inbound |
|---|---|---|---|---|
| A0 filed | 46-91 m (uniform) | 61 m (200 ft) | 101 m (330 ft) | 105 m (345 ft) |
| A1 Amazon returns at the top of its filed band | 46-91 m | 61 m | 101 m | 115 m (377 ft) |
| A2 full allocation (>= 10 m between operators) | 46-71 m (150-233 ft) | 81 m (266 ft) | 101 m | 115 m (377 ft) |
Filed bands (PLANNED_OPS_INPUTS): Wing 150-300 ft; Amazon outbound 180-279 ft, inbound 279-377 ft; Zipline 330 ft. Every arm stays inside them.
Amazon transitions keep their filed durations; the heights they climb or descend to follow the arm (inbound climb 60 -> inbound height, landing descent inbound height -> 60 m; outbound climb 35 -> outbound height; delivery descent outbound height -> 43 m).
Densities d = 4, 3, 2 km (Wing nest spacing), seeds 1-3, sites and orders identical across arms (paired).

## Measures
Cross-operator planned meetings (30 m / 10 m wide; 15 m / 5 m close) per hour in the central 144 km^2, by pair and phase; same-operator meetings; extra flight time per Amazon flight from the higher climbs (reported).

## Predictions
- V1 A1 cuts cross-operator wide meetings by >= 60 % vs A0 at d = 4 and at d = 3 km (pooled over seeds). PREDICTION: holds.
- V2 A2 cuts them by >= 80 % vs A0 at d = 4 and at d = 3 km. PREDICTION: holds.
- V3 In A2, >= 80 % of the remaining cross-operator wide meetings involve an aircraft climbing or descending (d = 3 and 2 km pooled). PREDICTION: holds.
- V4 (reported): same-operator meetings by arm (Wing's narrower band in A2 may raise Wing-Wing meetings); results at d = 2 km.
No criterion or parameter changes after data; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks
- K1 A0 through the new code reproduces HOUSTON2 exactly (d = 4 and 3 km, seeds 1-3: identical cross- and same-operator counts).
- K2 Heights: in each arm, every cruise and hover sample of each operator lies at the arm's height or within its band (to 0.01 m).
- K3 Pairing: the three arms launch the same number of flights at the same times from the same sites for a given seed.

## Deviation log
- K1-K3 PASS before the study (A0 equals HOUSTON2 exactly at d = 4 and 3 km, seeds 1-3; 0 height violations; arms launch identical flights).
