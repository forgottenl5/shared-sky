# Plan-check volume size vs delay: results (VOL_PREREG.md, fingerprint 044ae219…), 2026-10-22
K1–K2 passed. Seeds 13–15, pooled; analysis script committed before the runs.

| Prediction | Result | Verdict |
|---|---|---|
| Q1 H60/H30 in 1.6-2.5 at d 4 and 3 | 1.89 / 2.00 | **PASS** |
| Q2 T15/H30 >= 2 at d 4 and 3 | 1.81 / 1.91 | **FAIL** |
| Q3 V20/H30 >= 3 at d 3 | 4.93 | **PASS** |
| Q4 strictly rising H15 < H30 < H60 < H90 at both d | [145, 268, 506, 818]; [378, 701, 1403, 2196] | **PASS** |

| d | Arm | cell / time buffer / vertical | flights checked | delayed | x H30 | delayed share wing / amazon / zipline | mean delay of delayed (s) | total delay (h) | cancelled |
|---|---|---|---|---|---|---|---|---|---|
| 4 km | H15 | 15 m / ±5 s / <10 m | 15430 | 145 | 0.54 | 0.9 % / 5.3 % / 0.5 % | 35 | 1.4 | 0 |
| 4 km | H30 | 30 m / ±5 s / <10 m | 15430 | 268 | 1.00 | 1.5 % / 10.6 % / 0.9 % | 39 | 2.9 | 0 |
| 4 km | H60 | 60 m / ±5 s / <10 m | 15430 | 506 | 1.89 | 2.9 % / 17.0 % / 2.0 % | 45 | 6.3 | 0 |
| 4 km | H90 | 90 m / ±5 s / <10 m | 15430 | 818 | 3.05 | 5.2 % / 24.6 % / 3.3 % | 52 | 11.7 | 0 |
| 4 km | T15 | 30 m / ±15 s / <10 m | 15430 | 486 | 1.81 | 2.4 % / 19.0 % / 1.7 % | 51 | 7.0 | 0 |
| 4 km | T30 | 30 m / ±30 s / <10 m | 15430 | 823 | 3.07 | 3.7 % / 28.5 % / 3.5 % | 87 | 19.8 | 0 |
| 4 km | V20 | 30 m / ±5 s / <20 m | 15430 | 1477 | 5.51 | 3.2 % / 49.3 % / 7.6 % | 57 | 23.2 | 0 |
| 3 km | H15 | 15 m / ±5 s / <10 m | 27689 | 378 | 0.54 | 1.3 % / 9.1 % / 0.8 % | 36 | 3.8 | 0 |
| 3 km | H30 | 30 m / ±5 s / <10 m | 27689 | 701 | 1.00 | 2.4 % / 16.2 % / 1.5 % | 41 | 8.0 | 0 |
| 3 km | H60 | 60 m / ±5 s / <10 m | 27689 | 1403 | 2.00 | 5.1 % / 28.5 % / 3.2 % | 47 | 18.4 | 0 |
| 3 km | H90 | 90 m / ±5 s / <10 m | 27689 | 2196 | 3.13 | 9.0 % / 38.1 % / 5.3 % | 59 | 36.0 | 0 |
| 3 km | T15 | 30 m / ±15 s / <10 m | 27689 | 1337 | 1.91 | 4.2 % / 28.4 % / 3.2 % | 57 | 21.2 | 0 |
| 3 km | T30 | 30 m / ±30 s / <10 m | 27689 | 2172 | 3.10 | 6.3 % / 43.2 % / 5.6 % | 99 | 59.5 | 0 |
| 3 km | V20 | 30 m / ±5 s / <20 m | 27689 | 3456 | 4.93 | 5.0 % / 64.0 % / 10.8 % | 69 | 66.5 | 0 |

## What it shows
1. **Delay grows about linearly with the horizontal size of the reserved volume** (Q1, Q4 PASS). 15 → 30 → 60 → 90 m gives 0.54 → 1 → 1.9–2.0 → 3.1× the delayed flights. Total delay grows faster (to 4–4.5× at 90 m), because each delay also gets longer.
2. **The time buffer costs a little less than predicted** (Q2 FAIL, narrowly). ±15 s gives 1.8–1.9× the delayed flights (≥ 2 predicted); ±30 s gives 3.1×. Total delay at ±30 s is 7× the baseline, and mean delay doubles to 87–99 s.
3. **The vertical separation requirement is the costliest choice** (Q3 PASS). Requiring 20 m instead of 10 m multiplies delayed flights by 4.9–5.5× and total delay by 8×. Amazon is then delayed on 49–64 % of its flights. The A2 height allocation leaves 10–20 m gaps, so at a 20 m requirement it no longer separates the operators. This is consistent with ROBUST.
4. **No flight was cancelled in any arm.** With 40 retries of 30 s (20 min), every flight found a slot at these densities.

## Why this matters
F3548 volume sizes and separation buffers are each operator's own choice and are not published. Today's result puts a price on that choice: under a shared first-filed check, doubling the horizontal reserve roughly doubles the number of delayed flights, and requiring 20 m instead of 10 m vertically multiplies it about fivefold. Regulators and operators negotiating shared rules can read the trade-off directly from the table.

## Limits
- Planned tracks only.
- Delays count only conflicts in and near the central zone (lower bound).
- One priority rule (first filed).
- Wind is not modelled explicitly; larger volumes stand in for wind-scaled ones.
