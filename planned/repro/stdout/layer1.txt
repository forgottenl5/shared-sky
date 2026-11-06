
## houston (pooled seeds 1-3, 2 measured hours each)
| arm | wide | close | Amazon-Zipline | Amazon-Wing | Wing-Zipline | cruise+cruise | delayed | cancelled | mean delay s | Amazon delayed | Wing delayed | Zipline delayed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A2 | 78 | 21 | 39 | 16 | 23 | 0 | 19.2 % | 0.81 % | 374 | 85.9 % | 7.6 % | 20.0 % |
| A2u | 78 | 22 | 43 | 16 | 19 | 0 | 15.9 % | 2.54 % | 400 | 51.0 % | 4.9 % | 18.7 % |
| WAZ | 47 | 12 | 8 | 14 | 25 | 0 | 19.3 % | 0.73 % | 374 | 85.8 % | 7.0 % | 20.5 % |
| AWZ | 32 | 11 | 7 | 1 | 24 | 0 | 36.6 % | 3.53 % | 383 | 24.4 % | 25.5 % | 43.0 % |
- A2 phases: cruise+vertical 70, vertical+vertical 6, hover+vertical 2
- A2u phases: cruise+vertical 67, vertical+vertical 7, hover+vertical 4
- WAZ phases: cruise+vertical 41, vertical+vertical 6
- AWZ phases: cruise+vertical 29, vertical+vertical 3

## dfw (pooled seeds 1-3, 2 measured hours each)
| arm | wide | close | Amazon-Zipline | Amazon-Wing | Wing-Zipline | cruise+cruise | delayed | cancelled | mean delay s | Amazon delayed | Wing delayed | Zipline delayed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A2 | 26 | 6 | 11 | 7 | 8 | 0 | 16.7 % | 0.33 % | 358 | 79.4 % | 5.2 % | 17.0 % |
| A2u | 29 | 5 | 13 | 8 | 8 | 0 | 16.2 % | 1.87 % | 452 | 70.9 % | 3.9 % | 18.6 % |
| WAZ | 14 | 5 | 1 | 7 | 6 | 0 | 16.2 % | 0.28 % | 359 | 79.4 % | 4.5 % | 16.5 % |
| AWZ | 11 | 3 | 1 | 4 | 6 | 0 | 31.5 % | 1.34 % | 380 | 16.3 % | 26.0 % | 39.7 % |
- A2 phases: cruise+vertical 24, vertical+vertical 2
- A2u phases: cruise+vertical 29
- WAZ phases: cruise+vertical 14
- AWZ phases: cruise+vertical 9, hover+vertical 1, vertical+vertical 1

PASS P1: WAZ wide <= 0.75 x A2 -- houston 0.60; dfw 0.54
PASS P2: A2u within +-20 % of A2 -- houston 1.00; dfw 1.12
PASS P3: WAZ Amazon-Zipline <= 0.5 x A2 -- houston 8 vs 39; dfw 1 vs 11
PASS P4: WAZ Wing-Zipline within +-25 % of A2 -- houston 25 vs 23; dfw 6 vs 8
FAIL P5: WAZ delayed share and Amazon delayed share <= 0.8 x A2 -- houston all 19.3 vs 19.2 %, Amazon 85.8 vs 85.9 %; dfw all 16.2 vs 16.7 %, Amazon 79.4 vs 79.4 %
FAIL P6: AWZ wide > WAZ -- houston AWZ 32 vs WAZ 47; dfw AWZ 11 vs WAZ 14
FAIL P7: fewest conflicts = lowest delayed share -- houston fewest conflicts AWZ, lowest delay A2u; dfw fewest conflicts AWZ, lowest delay WAZ

4 of 7 predictions passed
