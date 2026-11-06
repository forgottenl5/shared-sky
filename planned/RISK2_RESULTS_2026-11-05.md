# RISK2 results (5 Nov 2026; registration planned/RISK2_PREREG.md, fingerprint 53689cf5…)
Full tables: planned/risk2_results_table.md. 80 runs (2 metros x 2 arms x V2 / V3 x seeds 1-10) plus RISK1's no-check rows; checks K1-K2 passed. One logged deviation, before any run: the registration misstated V2's height band (+-10 m, i.e. pairs planned within 20 m, not within 10 m).

**2 of 5 predictions passed. The plan check removes most of the modelled collision risk (81-96 % at average GPS with the minimal check, all of it with the larger one), but with the minimal check the shared-out heights end up with more residual risk than Amazon's best-sourced heights, because their Amazon and Zipline layers sit exactly at the edge of what the check can see.**

## Predictions
- **Q1 PASS** at L0 V2 removes 100 % of the risk (Houston S1, DFW S1 and A2; Houston A2 has none without the check).
- **Q2 FAIL** at L2 V2 removes 95 % (Houston S1), 86 % (Houston A2), 96 % (DFW S1), 81 % (DFW A2); I predicted 20-60 %, reasoning from the misstated band.
- **Q3 PASS** V3 removes 100 % at L2 (and at L4).
- **Q4 FAIL** at L2 with V2, shared-out heights have more residual risk than best-sourced: Houston 0.93 vs 0.82, DFW 1.11 vs 0.51 per 100,000 flight hours.
- **Q5 FAIL** V3 delays 2.1 and 2.8 times as many flights as V2 with shared-out heights, but only 1.0 and 1.3 times with best-sourced heights, where V2 already delays 37-40 %.

## Why Q4 failed (exploratory diagnosis, after the registered analysis)
- With V2 at L2, 92-96 % of the shared-out layout's residual risk comes from pairs planned 20-25 m apart in height, and 90-91 % from Amazon and Zipline: Amazon's outbound height (81 m) and Zipline's (101 m) are exactly 20 m apart, where V2's +-10 m blocks just stop overlapping. The check never flags the pair; average GPS errors (relative height sigma about 9.4 m) can still bring them together. With best-sourced heights the residual comes mostly from Wing and Zipline, also at 20-25 m.
- The lesson for the design: layer gaps have to exceed the check's band plus a margin for height error, or the band has to grow with the error (as V3 does). This matches COORD2's earlier finding that gaps and reservation sizes have to be set together.

## Reading
- The plan check is what makes the sky safe in this model: at average GPS it leaves 0.5-1.1 modelled collisions per 100,000 flight hours, against 6-17 without it. At best-site GPS the residual is effectively zero.
- The larger check (V3) removes everything modelled, at a high price: 40-48 % of flights delayed and about 26 % cancelled in still air. V2 with shared-out heights delays 17-19 % and cancels under 1 %.
- Height sharing's main value with a check is cost, not risk: it halves the flights V2 delays (19 % vs 40 % Houston, 17 % vs 37 % DFW).

## Limits
- Still air; no avoidance; block sizes assumed (ASTM F3548 not read); sizes and errors as RISK1; residual rates rest on few encounters (no interval computed); L4 is a lower bound.

## Deviation log
See the registration (V2 band misstated; logged before any run).
