# LAYER2 results (27 Oct 2026) — registration planned/LAYER2_PREREG.md (K1 exact match with COORD1, K2 passed; no deviations)

**Putting Zipline on top and making each reserved block 5 m thick instead of 10 m cuts the share of delayed flights from 18.5 % to 4.4 % in Houston and from 17.0 % to 4.1 % in DFW (about three quarters less), with no more flown conflicts than today's check: 6 of 6 predictions passed.** Amazon, which carries most of the cost, goes from 83 % of its flights delayed to 26 % (Houston) and from 80 % to 18 % (DFW).

| Prediction | Result | Verdict |
|---|---|---|
| Q1 order adds a cut on top of thinner blocks: WAZ+5 m <= 0.7 x A2+5 m | Houston 4.4 vs 7.9 %; DFW 4.1 vs 6.8 % | PASS |
| Q2 thinner blocks alone: A2+5 m <= 0.6 x A2+10 m | 7.9 vs 18.5 %; 6.8 vs 17.0 % | PASS |
| Q3 Amazon: WAZ+5 m <= 0.5 x today | 25.7 vs 83.4 %; 17.7 vs 80.3 % | PASS |
| Q4 flown conflicts no worse than today's check | 1 vs 1 in both | PASS |
| Q5 still removes >= 85 % of uncoordinated conflicts | 1 of 90; 1 of 38 | PASS |
| Q6 cancellations <= 0.5 % | 0.16 %; 0.04 % | PASS |

Six seeds (p90-wind hours), two measured hours each, real sites, today's filed rates. Full table: planned/layer2_results_table.md.

## How the two levers split the gain (Houston; DFW similar)
- Thinner blocks alone (A2, 10 m to 5 m): 18.5 % to 7.9 % delayed. Cruise-versus-cruise blocks between neighbouring layers disappear.
- Order alone (A2 to WAZ, 10 m blocks): 18.5 % to 18.4 % (LAYER1's result, confirmed on 6 seeds).
- Both: 4.4 %. Once cruise blocks no longer overlap, what is left is climbs and descents through other layers, and putting Zipline on top removes Amazon's crossings of the Zipline layer. Order only helps after thickness is fixed.
- Without any check the order still matters for flown conflicts: 125 vs 90 (Houston), 58 vs 38 (DFW).

## Limits (read before quoting)
- **Safety of a 5 m block is not established.** The engine's flown-conflict count (30 m / 10 m, and 15 m / 5 m) shows no increase, but those counts are tiny (0-3 per arm over 12 hours), so "no worse" means "not distinguishable at this sample size". Real height-keeping error, GPS and barometric altitude error and wind gusts are not modelled beyond the hour's wind. The block thickness a standard such as ASTM F3548 would require for these aircraft is not known here.
- Heights stay under 120 m only because gaps are 12 m; layer heights are a design choice, not any company's filing.
- One company mix per metro, today's volume only (DENS1 showed costs grow with demand).
- Related-work search for layer ordering was brief (see LAYER1_PREREG).
