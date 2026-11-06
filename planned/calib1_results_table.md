Rows 353, passed 274, failed 79  (scorecard: 353 / 274 / 79)

| group | passed / n | rate | 95 % Wilson |
|---|---|---|---|
| all scored | 274 / 353 | 77.6 % | 73-82 % |
| kind: band | 85 / 107 | 79.4 % | 71-86 % |
| kind: bound | 166 / 216 | 76.9 % | 71-82 % |
| kind: order | 21 / 28 | 75.0 % | 57-87 % |
| kind: claim | 2 / 2 | 100.0 % | 34-100 % |
| numeric (band+bound) | 251 / 323 | 77.7 % | 73-82 % |
| non-numeric (order+claim) | 23 / 30 | 76.7 % | 59-88 % |
| domain: drone | 162 / 217 | 74.7 % | 68-80 % |
| domain: taxi | 101 / 125 | 80.8 % | 73-87 % |
| domain: method | 11 / 11 | 100.0 % | 74-100 % |
| early half | 138 / 177 | 78.0 % | 71-83 % |
| late half | 136 / 176 | 77.3 % | 71-83 % |

Failed numeric rows: 72; worse 37, better 19, unclear 16
Failed rows coded narrow: 8 of 79

Sensitivity, 4 not-scored counted as fails: 274 / 357 = 76.8 %

Predictions
C1 numeric 77.7 % vs non-numeric 76.7 %: gap -1.0 points (need numeric lower by >= 5): FAIL
C2 worse 37 of 56 sided failed numeric rows (need > half): PASS
C3 late 77.3 % vs early 78.0 %: gap -0.7 points (need late higher by >= 5): FAIL
C4 taxi 80.8 % vs drone 74.7 % (need taxi lower): FAIL
C5 narrow 8 of 79 failed (need >= 20 and >= a quarter): FAIL
