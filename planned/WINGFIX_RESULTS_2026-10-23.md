# Wing at fixed heights: results (WINGFIX_PREREG.md, fingerprint 15277214…), 2026-10-23
K1–K2 passed. d = 3 and 4, seeds 1–3, pooled; 4 checks per second; analysis script committed before the runs.

| Prediction | Result | Verdict |
|---|---|---|
| W1 cut >= 65 % wide and >= 80 % close at every Wing level | see table | **PASS** |
| W2 A0 Wing–Amazon meetings highest at Wing 61 m among fixed levels | 46: 58, 61: 187, 76: 31 | **PASS** |

| Wing level | A0 wide / close | A2 wide / close | cut wide [95 %] | cut close [95 %] | A0 Wing–Amazon wide | A0 Amazon–Zipline wide | Wing–Wing wide A0 / A2 |
|---|---|---|---|---|---|---|---|
| 46 | 745 / 341 | 141 / 35 | 81 % [77–84] | 90 % [85–93] | 58 | 634 | 3196 / 3196 |
| 61 | 864 / 410 | 136 / 31 | 84 % [81–87] | 92 % [89–95] | 187 | 634 | 3346 / 3346 |
| 76 | 701 / 336 | 121 / 23 | 83 % [79–86] | 93 % [90–96] | 31 | 634 | 3487 / 3463 |
| uniform | 778 / 365 | 146 / 28 | 81 % [78–84] | 92 % [89–95] | 102 | 634 | 2938 / 3031 |

## What it shows
1. **The allocation result does not depend on how Wing picks its height** (W1 PASS). Whether Wing flies at 46, 61 or 76 m, or at a random height per flight, the allocation cuts cross-operator meetings by 81–84 % (wide) and 90–93 % (close). The 95 % ranges overlap at every level.
2. **Why it is robust:** the dominant clash is Amazon–Zipline (634 wide meetings at the filed heights in every arm), Amazon's 105 m return against Zipline's 101 m. That clash does not involve Wing.
3. **Wing's height does decide the Wing–Amazon clash** (W2 PASS). At the filed heights, Wing at 61 m, the same as Amazon's outbound, gives 187 Wing–Amazon meetings, against 58 at 46 m and 31 at 76 m. The allocation removes that clash at every level.
4. **Reported:** Wing flying one fixed height raises Wing–Wing (same-operator) meetings by 9–19 % over random heights. That is Wing's internal problem, outside this model.

## Consequence
- The researcher's objection in RED_TEAM_REVIEW ("everything about Wing–Amazon depends on Wing's uniform altitude") is answered. The headline does not depend on it.
- The scorecard entry for the allocation result can say: robust to Wing's altitude practice.
