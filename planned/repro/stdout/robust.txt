### R-a thresholds (Houston mix, peak 1): cut vs filed baselines (A0 count -> arm count, pooled 3 seeds x 2 h)
| Spacing | Threshold (h / v m) | A1 Amazon top of band | A2 full allocation |
|---|---|---|---|
| 4 km | 15 / 5 | 89 % (62 -> 7) | 90 % (62 -> 6) |
| 4 km | 30 / 10 | 75 % (181 -> 45) | 83 % (181 -> 31) |
| 4 km | 50 / 10 | 75 % (299 -> 76) | 79 % (299 -> 62) |
| 4 km | 30 / 15 | -1 % (337 -> 339) | 44 % (337 -> 188) |
| 4 km | 30 / 20 | 0 % (489 -> 487) | 58 % (489 -> 207) |
| 3 km | 15 / 5 | 83 % (162 -> 28) | 93 % (162 -> 12) |
| 3 km | 30 / 10 | 75 % (513 -> 126) | 82 % (513 -> 91) |
| 3 km | 50 / 10 | 74 % (875 -> 230) | 81 % (875 -> 167) |
| 3 km | 30 / 15 | -1 % (976 -> 985) | 46 % (976 -> 523) |
| 3 km | 30 / 20 | 0 % (1406 -> 1402) | 59 % (1406 -> 579) |

### R-b busiest hour (x1.5), 30 m / 10 m
| Spacing | A0 per h | A2 per h | Cut |
|---|---|---|---|
| 4 km | 69.2 | 9.3 | 87 % |
| 3 km | 183.7 | 33.3 | 82 % |

### R-c Dallas-Fort Worth mix (75 : 75 : 4, Zipline 400/day), 30 m / 10 m
| Spacing | Arm | Cross-op per h | Close (15/5) per h | Amazon share | Wing-Zipline | Amazon-Wing | Amazon-Zipline |
|---|---|---|---|---|---|---|---|
| 4 km | A0 | 1.7 | 0.7 | 60 % | 0.7 | 0.2 | 0.8 |
| 4 km | A1 | 0.8 | 0.0 | 20 % | 0.7 | 0.2 | 0.0 |
| 4 km | A2 | 0.8 | 0.5 | 20 % | 0.7 | 0.2 | 0.0 |
| 3 km | A0 | 11.7 | 3.8 | 76 % | 2.8 | 1.7 | 7.2 |
| 3 km | A1 | 5.8 | 0.7 | 51 % | 2.8 | 1.7 | 1.3 |
| 3 km | A2 | 5.3 | 0.7 | 34 % | 3.5 | 0.5 | 1.3 |

| Prediction | Value | Verdict |
|---|---|---|
| R1 A2 cuts >= 70 % for every threshold with vertical <= 10 m at 4 and 3 km | 90 %, 83 %, 79 %, 93 %, 82 %, 81 % | PASS |
| R2 A2 cut < 50 % at vertical 15 m and < 30 % at vertical 20 m | v15: 44 %, 46 %; v20: 58 %, 59 % | FAIL |
| R3 at peak x1.5 A2 cuts >= 75 % at 4 and 3 km | 87 %, 82 % | PASS |
| R4 DFW: Amazon in >= 60 % of A0 meetings and A2 cuts >= 60 % at 4 and 3 km | Amazon share 60 %, 76 %; A2 cut 50 %, 54 % | FAIL |
