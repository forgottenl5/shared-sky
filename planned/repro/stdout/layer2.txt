
## houston (pooled seeds 1-6, 2 measured hours each)
| heights | check | flown wide | flown close | delayed | cancelled | mean delay s | Amazon delayed | Wing delayed | Zipline delayed |
|---|---|---|---|---|---|---|---|---|---|
| A2 | NONE | 125 | 35 | - | - | - | - | - | - |
| A2 | V2 | 1 | 1 | 18.5 % | 0.78 % | 372 | 83.4 % | 7.5 % | 19.1 % |
| A2 | V2v5 | 3 | 1 | 7.9 % | 0.18 % | 248 | 61.6 % | 3.8 % | 6.0 % |
| WAZ | NONE | 90 | 19 | - | - | - | - | - | - |
| WAZ | V2 | 0 | 0 | 18.4 % | 0.73 % | 371 | 83.1 % | 6.9 % | 19.3 % |
| WAZ | V2v5 | 1 | 0 | 4.4 % | 0.16 % | 219 | 25.7 % | 3.3 % | 3.4 % |

## dfw (pooled seeds 1-6, 2 measured hours each)
| heights | check | flown wide | flown close | delayed | cancelled | mean delay s | Amazon delayed | Wing delayed | Zipline delayed |
|---|---|---|---|---|---|---|---|---|---|
| A2 | NONE | 58 | 16 | - | - | - | - | - | - |
| A2 | V2 | 1 | 0 | 17.0 % | 0.40 % | 366 | 80.3 % | 5.4 % | 17.1 % |
| A2 | V2v5 | 2 | 1 | 6.8 % | 0.05 % | 232 | 37.8 % | 2.7 % | 5.3 % |
| WAZ | NONE | 38 | 12 | - | - | - | - | - | - |
| WAZ | V2 | 0 | 0 | 16.5 % | 0.39 % | 367 | 79.5 % | 4.7 % | 16.9 % |
| WAZ | V2v5 | 1 | 0 | 4.1 % | 0.04 % | 241 | 17.7 % | 2.6 % | 3.3 % |

PASS Q1: WAZ+V2v5 delayed <= 0.7 x A2+V2v5 -- houston 4.4 vs 7.9 %; dfw 4.1 vs 6.8 %
PASS Q2: A2+V2v5 delayed <= 0.6 x A2+V2 -- houston 7.9 vs 18.5 %; dfw 6.8 vs 17.0 %
PASS Q3: WAZ+V2v5 Amazon delayed <= 0.5 x A2+V2 Amazon delayed -- houston 25.7 vs 83.4 %; dfw 17.7 vs 80.3 %
PASS Q4: flown wide WAZ+V2v5 <= A2+V2 -- houston 1 vs 1; dfw 1 vs 1
PASS Q5: flown wide WAZ+V2v5 <= 0.15 x WAZ+NONE -- houston 1 vs 90; dfw 1 vs 38
PASS Q6: WAZ+V2v5 cancelled <= 0.5 % -- houston 0.16 %; dfw 0.04 %

6 of 6 predictions passed
