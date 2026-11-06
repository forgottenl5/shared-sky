# LAYER1 — does the order of the companies' height layers matter? (registered 27 Oct 2026, before any run)

## Why
Three of today's failure diagnoses (planned/DIAGNOSES_2026-10-27.md: COORD2 G1-G3, DENS1 D2, WIND20 Wn1; also HEADLINE2 H3) point to one cause: with shared-out heights (A2) no conflicts are left between two cruising aircraft; every remaining conflict, and most coordination delay, involves an aircraft climbing or descending through another company's layer, mostly Amazon. In the engine (lab/lab_engine.js) Wing and Amazon descend at the customer (Wing to 7 m, Amazon to 4 m after long ramps), while Zipline changes height only at its dock (it lowers packages from cruise height). In A2 Amazon's return leg cruises at 115 m, above Zipline (101 m), so every Amazon return climbs and descends through Zipline's layer.
**Hypothesis:** putting the companies that descend at customers below the company that does not (Zipline on top) removes most Amazon-Zipline conflicts and a large share of coordination delay, at no cost to anyone's flights.
Related work checked (brief search, 27 Oct 2026): layer functions by heading/transition (TU Delft, Drones 7(7):444, 2023), shared layers with no per-operator ordering and transitions not reported separately (Melgosa et al., Drones 10(9):656, 2026). Ordering layers by which operators descend at the customer was not found; this is not an exhaustive search.

## Arms (heights in m; Wing flies anywhere in its band; Amazon out / in; 120 m ceiling)
| arm | Wing | Amazon out | Amazon in | Zipline | order bottom to top |
|---|---|---|---|---|---|
| A2 (reference, as HEADLINE2/COORD1) | 46-71 | 81 | 115 | 101 | W, Aout, Z, Ain |
| A2u (A2's order, even 12 m gaps) | 46-71 | 83 | 107 | 95 | W, Aout, Z, Ain |
| WAZ (Zipline on top) | 46-71 | 83 | 95 | 107 | W, A, Z |
| AWZ (Amazon lowest, Zipline on top) | 70-95 | 46 | 58 | 107 | A, W, Z |
A2u separates the effect of order (A2u vs WAZ) from the effect of gap size (A2 vs A2u).

## Setup (as COORD1, unchanged)
Real sites (planned/houreal.js, planned/dfwreal.js), today's filed rates (k = 1), the three p90-wind hours per metro (planned/wind.js bandHours(0.85, 0.95, 3)); flights fly in that hour's wind; plans for the coordination check use the previous hour's wind. Seeds 1-3. Warm-up 1 h, measured 2 h. Measures per run:
- **M1 flown conflicts, no coordination:** cross-company wide (30 m / 10 m) and close (15 m / 5 m) counts from L.count (sub 4), split by company pair and by the two segments' phases (cruise / vertical / hover labels).
- **M2 coordination cost:** V2 volumes (planned/coord.js C.VOL.V2), share of checked flights in the measured window delayed and cancelled, mean delay of delayed flights, per company and overall.
Totals are pooled over the three seeds.

## Predictions (both metros unless stated)
- **P1:** WAZ wide conflicts <= 0.75 x A2.
- **P2:** A2u wide conflicts within +-20 % of A2 (gap size alone matters little).
- **P3:** WAZ Amazon-Zipline wide conflicts <= 0.5 x A2's.
- **P4:** WAZ Wing-Zipline wide conflicts within +-25 % of A2's (Zipline's dock climbs through Wing are unchanged).
- **P5:** WAZ delayed share (all checked flights) <= 0.8 x A2's, and WAZ Amazon delayed share <= 0.8 x A2's.
- **P6:** AWZ wide conflicts > WAZ (Wing descends at customers far more often than Amazon, so putting Wing above Amazon adds more crossings than it removes).
- **P7:** the arm with the fewest wide conflicts also has the lowest delayed share.

## Checks before the run
- **K1:** A2, seed 1, no coordination, both metros: wide count equals the saved COORD1 NONE/A2/seed 1 value (out/coord1).
- **K2:** every arm stays at or below 120 m and neighbouring layers (band edges) are at least 12 m apart except A2's own 10 m Wing-Amazon out gap.

## Files
planned/layer1_run.js, planned/layer1_analyze.py, out/layer1/. Fix attempts at most 2 per problem, logged below.

## Deviation log
(none yet)
