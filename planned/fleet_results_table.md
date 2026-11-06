| Prediction | Result | Verdict |
|---|---|---|
| E1 B0: each side bears 35-65 % of each pair's delays (d 4, 3) | see splits | **FAIL** |
| E2 B1 ratio <= 2 at d 3 and 4 | 2.16 / 2.57 (d 3 / 4) | **FAIL** |
| E3 B1 ratio <= half of B0's at d 3 and 4 | d 3: 2.16 vs 8.10; d 4: 2.57 vs 7.48 | **PASS** |

| d | Arm | flights checked: wing / amazon / zipline | delayed: wing / amazon / zipline | ratio | pair splits (share borne by first-named side) |
|---|---|---|---|---|---|
| 4 km | B0 | 4458 / 1388 / 11806 | 2.1 % / 12.5 % / 1.2 % | 7.5 | amazon-wing 76/36 (68 %); amazon-zipline 97/82 (54 %); wing-zipline 57/65 (47 %) |
| 4 km | B1 | 4458 / 3773 / 4582 | 2.2 % / 6.0 % / 2.5 % | 2.6 | amazon-wing 136/71 (66 %); amazon-zipline 90/87 (51 %); wing-zipline 26/27 (49 %) |
| 3 km | B0 | 7569 / 988 / 22997 | 2.4 % / 14.8 % / 1.3 % | 8.1 | amazon-wing 46/38 (55 %); amazon-zipline 100/103 (49 %); wing-zipline 142/189 (43 %) |
| 3 km | B1 | 7569 / 7714 / 8085 | 4.8 % / 9.9 % / 4.3 % | 2.2 | amazon-wing 470/314 (60 %); amazon-zipline 290/286 (50 %); wing-zipline 50/64 (44 %) |
