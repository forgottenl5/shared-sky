# AIRTAXI_NET4: break-even on engine v5, and sizing Archer's announced Texas network (registration, 28 Oct 2026)

Status: scenario model of planned operations. Registered before the runner, analysis or any run.

## Why
1. The break-even access times on the public page (20.0-44.5 min, AIRTAXI_NET1) were computed on engine v1/v2 and never rerun after v3-v5 changed holding energy, the reserve (now 20 min, AIRTAXI_INPUTS_ADDENDUM_2026-10-28.md), stands and the landing rule.
2. The 3D page's network (7 sites) predates Archer's 23 Oct 2026 list of 12 Texas sites that ACCESS1 used (GAP_PLAN A5). No fleet has been sized for Archer's network, and demand everywhere so far is a flat invented rate (GAP_PLAN A2).

## Part A: break-even on v5
- Engine taxi/net5.js, padRule 'slot'. Sites, routes and drive times exactly as AIRTAXI_NET1 (taxi/data/drive_times_raw.tsv). Aircraft as AIRTAXI_NET3 arm U100 (100 km usable plus 20 min reserve at cruise; holding burns energy). 2 pads and 10 stands per site, fleet 24 in both metros (queue-free, as NET1), demand 1.5 per hour per route direction, seeds 1-10, 2 h warm-up, 12 h measured.
- Measure: E* per route = driving midpoint minus median request-to-landing time, averaged over both directions and the 08:00 and 17:30 peaks, per seed; median over seeds. Identical arithmetic to planned/airtaxi_net1_analyze.py `estar`.
- **A1:** on all six routes |E*(v5) - E*(NET1 v2 recheck)| <= 1.0 minute.
- **A2:** the ranking holds: AFW-TOY highest, DFW-TOY lowest.

## Part B: Archer's network with demand shaped by commute data
- Sites: Archer's 12 sites as in out/access1b_sites.json (DFW: DFW, DAL, ADS, GKY, FTW, AFW, FRS; Houston: IAH, HOU, SGR, GLS, THO), coordinates as ACCESS1.
- Demand pairs and weights: ACCESS1 primary scenario (peak, P = 20, T = 10) top-10 directional pairs of benefiting jobs (86 % of benefiting jobs in each metro), folded to undirected pairs (home-work and work-home flows both count). DFW: ADS-FTW .249, DAL-FTW .234, FRS-FTW .224, FRS-GKY .165, ADS-GKY .082, AFW-DAL .047. Houston: IAH-SGR .300, HOU-IAH .229, GLS-IAH .175, GLS-SGR .125, GLS-THO .102, HOU-SGR .069. Each direction of a pair gets half its share. This is a demand shape, not a forecast: totals are scenario settings.
- Totals (trips an hour, whole network, same as the 3D page): DFW 12 / 24 / 48, Houston 6 / 12 / 24. Poisson, flat over 12 daytime hours.
- Ground: 2 pads at the two lower totals, 4 at the highest; stands 12 per site (16 at the highest DFW total). Pad 90 s, turnaround 300 s, charging 3.2 km/min, slot rule, repositioning on, give-up 30 min, seeds 1-10.
- Aircraft: U100 (registered arm). Sensitivity arm U144 (144 km usable after the reserve, Wisk's stated "90 miles with reserves") for Houston only.
- Fleet search per seed: the first fleet in [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64] that meets the test; "not reached" if none. Fleet placed round-robin, at most the stand count per site.
- Test (as PADRULE1, over feasible requests): served >= 95 %, median wait <= 10 min, 95th-percentile airborne hold <= 120 s, at most 1 % of landings below reserve, peak stands held <= stands at every site. Requests on pairs whose energy (straight km x 1.15 + 5) exceeds usable range are infeasible; they are reported separately and excluded from the served share.

## Predictions (from arithmetic before any run: distances, energy per trip, about 40-45 aircraft-minutes per passenger trip including charging)
- **B1 (DFW fleet, U100, median over seeds):** 12 trips/h: 10-18; 24: 18-30; 48: 34-56.
- **B2 (more sites cost more aircraft):** at 24 trips an hour Archer's DFW network needs more aircraft than the 3D page's 7-site network (central 14) in at least 8 of 10 seeds.
- **B3 (Galveston):** at U100 the GLS-IAH and GLS-SGR pairs, and only those, are infeasible, so 28-32 % of Houston requests cannot be flown; at U144 none are infeasible.
- **B4 (Houston fleet, median over seeds):** U100: 6 trips/h 4-9, 12: 7-14, 24: 12-24. U144 needs more aircraft than U100 at every total (it flies the long Galveston trips).
- **B5:** empty repositioning flights are at least 15 % of all flights in DFW at 24 trips an hour (point-to-point demand without a hub).

## Checks before the study runs (K)
- K1: the six DFW and six Houston pair distances match the table above to 2 %.
- K2: with U100, exactly the two Galveston pairs are infeasible in the engine (q.infeasible), and none with U144.
- K3: Part A at fleet 24 serves >= 99 % in both metros (seed 1).

## Deviation log
(none yet)
