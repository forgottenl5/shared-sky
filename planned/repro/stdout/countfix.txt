| Prediction | Result | Verdict |
|---|---|---|
| U1 A2 cuts wide >= 65 % and close >= 80 % | wide cut 81 % [78–84]; close cut 92 % [89–95] | **PASS** |
| U2 after the plan check, wide <= 2 % of A2 unchecked | 0 vs 146 (0.0 %) | **PASS** |
| U3 A0 >= 5x A2 per hold (lower 95 % > 1), A0 >= 30, A2 rate 0.1–2 per 100 | ratio 9.4 [6.3–14.7]; A0 245; A2 0.42 per 100 | **PASS** |
| U4 RTH-120 >= 5x RTH-OWN, >= 30 at 120 m | ratio 10.7 [5.4–24.0]; 96 at 120 m | **PASS** |

## Sampling convergence (VALLOC A0, d = 3, seeds 1–3): chosen sub = 4

| checks per second | cross wide | cross close |
|---|---|---|
| 1 | 513 | 162 |
| 2 | 563 | 238 |
| 4 | 575 | 263 |
| 8 | 577 | 265 |
| 16 | 579 | 268 |

## R-VALLOC (no plan check), d = 3 + 4, seeds 1–3

| Heights | cross wide [95 %] | cross close [95 %] |
|---|---|---|
| A0 filed | 778 [724.3–834.6] | 365 [328.5–404.4] |
| A2 allocation | 146 [123.3–171.7] | 28 [18.6–40.5] |

## R-PROC (A2 + plan check), d = 3 + 4, seeds 1–3

Cross-operator wide meetings after the check: 0 [0.0–3.7]; close: 0 [0.0–3.7]

## R-DEV (in-zone 120 s holds, plan check), d = 3 + 4, seeds 19–21

| Heights | holds | cross wide [95 %] | per 100 holds | cross close |
|---|---|---|---|---|
| A0 filed | 6241 | 245 [215.3–277.7] | 3.93 | 111 [91.3–133.7] |
| A2 allocation | 6235 | 26 [17.0–38.1] | 0.42 | 9 [4.1–17.1] |

## R-RTH (in-zone return-to-home, A2), d = 3 + 4, seeds 19–21

| Return height | events | cross wide [95 %] | per 100 | cross close |
|---|---|---|---|---|
| 120 m | 6235 | 96 [77.8–117.2] | 1.54 | 15 [8.4–24.7] |
| own height | 6235 | 9 [4.1–17.1] | 0.14 | 2 [0.2–7.2] |

