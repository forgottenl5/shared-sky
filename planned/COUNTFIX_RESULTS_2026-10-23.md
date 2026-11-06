# Counting fix and headline re-runs: results (COUNTFIX_PREREG.md, fingerprint 06a3ed63…), 2026-10-23
K1–K3 passed. Sampling 4 checks per second (chosen by the registered convergence rule). Incidents drawn only inside the counted zone and window, at 20 %. Exact Poisson 95 % intervals. Analysis script committed before the re-runs.

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


## What changed
1. **The headline holds and is slightly stronger** (U1 PASS). The allocation inside filed bands cuts cross-operator meetings by 81 % [78–84] (wide) and 92 % [89–95] (close), against about 80 % and 90 % before. Absolute counts rise: 1-s sampling missed about 40 % of close meetings.
2. **The plan check still leaves no planned meetings** (U2 PASS): 0 [0–3.7] at 4 checks per second, across 6 runs.
3. **Contingency ratios were overstated before; the effect is real but smaller** (U3, U4 PASS):
   - Two-minute holds: filed heights are **9.4× [6.3–14.7]** as risky per hold as the allocation (245 vs 26 meetings), not 23×. The earlier figure came from 46 vs 2 meetings.
   - Return-to-home at 120 m is **10.7× [5.4–24]** as risky as returning at the drone's own height (96 vs 9), not 20×.
   - Absolute risk per in-zone hold: **0.42 per 100** with the allocation (about 4 in 1,000), **3.9 per 100** at the filed heights.
4. **These numbers replace** the per-deviation rates and ratios in DEVIATE, DEVA0 and RTH, and the "1 in 1,000" wording.

## Still open (RED_TEAM_REVIEW)
- Wing altitude practice (fixed levels vs uniform).
- Zipline Dropbox geometry.
- Prior-art checks for VOL, STRESS, RTH and OUTAGE.
- One flight generator.
- Energy cost.
- Peak demand.
