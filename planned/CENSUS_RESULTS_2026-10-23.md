# Customers where people live: results (2026-10-23)
Pre-registration: CENSUS_PREREG.md, sha256 b1034939…, committed with sampler, runner and analysis (c4e07f4) before any run. K1 passed (one weaker-than-written check logged as a deviation). 24 new runs plus the 12 HOUREAL runs as the uniform arm. Layout: real-Houston build-out (5 geocoded Amazon sites, 75 Wing, 65 Zipline), filed caps.

## Result in one line
**The headline survives realistic demand.** With customers drawn from Census 2020 population, sharing out heights still cuts close calls between companies by 77 % against the Omaha profile, 71 % against the Texas band and 23 % against Amazon's reported heights (uniform customers: 79 / 71 / 27 %). A strict airport rule changes nothing material.

## Cross-company wide meetings (30 m / 10 m), 3 seeds × 2 h each
| Customers | A0 Omaha | T Texas band | R reported | A2 allocation | A2 cut vs A0 / T / R |
|---|---|---|---|---|---|
| U uniform (HOUREAL) | 315 | 226 | 89 | 65 | 79 / 71 / 27 % |
| P Census population | 343 | 275 | 102 | 79 | 77 / 71 / 23 % |
| PA population + strict airport rule | 358 | 256 | 103 | 77 | 78 / 70 / 25 % |
Close meetings (15 m / 5 m) A2 cut vs A0: 85 / 84 / 88 %; vs R: 31 / 14 / 26 % (small counts: 18–29 close meetings in A2 and R).

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| C1 P: A2 cuts A0 >= 65 % | 77 % | **PASS** |
| C2 P: A2 cuts R <= 50 % | 23 % | **PASS** |
| C3 A0 meetings P / U within 0.7–1.3 | 1.09 | **PASS** |
| C4 PA cut vs A0 within 10 points of P | 78 vs 77 % | **PASS** |
| C5 PA Amazon draws rejected < 15 % | 4.4 % | **PASS** |

## Other observations
- Amazon–Zipline remains the dominant pair under A0 and T (79 % and 67 % of meetings under P); under R the three pairs are about equal.
- Wing–Zipline meetings double under P (38 vs 16): both companies' customers concentrate in the same populated suburbs.
- Mean customer distance barely moves (Amazon 8.07 km vs 8.05 km uniform): within a 7.5–10 mile service area, Houston's suburbs are populated fairly evenly.
- Strict airport rule: 8 % of draws redrawn (Amazon 4 %, Wing 6 %, Zipline 9 %); 2–7 random Wing or Zipline sites per seed stood in a 0 ft square and were removed. Counts move within seed noise.

## Limits
Block-group centres with a 400 m spread, not individual homes; every resident is equally likely to order (no income, housing-type or opt-out effects); Wing and Zipline sites random; 3 seeds (counts of 65–358 per cell, so differences under about 15 % are noise).

## What this changes
Assumption 11 (where customers are) moves from "assumed" to "tested: no effect on the headline ratios". Assumption 2 (airports) moves to "tested (strict reading): no effect". Together with RICHPOP, uniform customers are not the reason for Richardson's overflight gap or for any headline number.
