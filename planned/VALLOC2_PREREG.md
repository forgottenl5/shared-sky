# Phase 2a addendum: free spread within filed bands vs a fixed allocation (written 2026-10-22 before any code change or run)
Status: as VALLOC (behaviour model, planned tracks only, paired on HOUSTON2 sites and demand).
Reason: Melgosa et al. (Drones 2026, 10(9):656) find more vertical freedom beats rigid layers. A fair comparison needs operators spreading heights freely inside their filed bands, not only filed baselines vs a fixed allocation.

## New arm
| Arm | Wing | Amazon outbound | Zipline | Amazon inbound |
|---|---|---|---|---|
| A3 free spread in filed bands | 46-91 m uniform per flight | 55-85 m (180-279 ft) uniform per flight | 101 m (only 330 ft filed) | 85-115 m (279-377 ft) uniform per flight |
Compared with VALLOC's A0 (filed baselines), A1, A2, same densities (4, 3, 2 km) and seeds (1-3). Amazon's height draws use a separate random stream so that sites, orders and Wing heights stay identical to A0-A2 (paired).

## Predictions
- W1 A3 cuts cross-operator wide meetings vs A0 by less than 50 % at d = 4 and at d = 3 km (expected roughly one third: Amazon's inbound is within 10 m of Zipline's 101 m for 2/3 of its band). PREDICTION: holds.
- W2 A2 (fixed allocation) has at most half the cross-operator wide meetings of A3 at d = 4 and at d = 3 km. PREDICTION: holds.
- W3 (reported): close meetings, pairs, same-operator meetings for A3.
No criterion or parameter changes after data; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks
- L1 A3 launches identical flights (count, time, operator, site, Wing height) to A0 for each seed.
- L2 In A3 every Amazon cruise sample lies inside its filed band for its leg; heights are spread (sample standard deviation > 5 m per leg).

## Deviation log
- L1-L2 PASS before the A3 runs (plus A0-A2 results unchanged by the code change). valloc.js changed only by adding A3 and a separate random stream for band draws.
