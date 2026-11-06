# Pre-launch robustness studies: results (PRELAUNCH_PREREG.md, fingerprint 4add6a00…), 2026-10-23
K1–K3 passed. 246 runs; analysis script committed before the runs (c54a266); output below is verbatim from `python3 planned/prelaunch_analyze.py`. Nine of ten predictions passed; L3 failed.

## S1 Amazon heights (d = 3 + 4, seeds 1–3)

| Arm | wide [95 %] | close [95 %] | A2 wide cut vs this | A2 close cut vs this | amazon-wing / amazon-zipline / wing-zipline (wide) |
|---|---|---|---|---|---|
| B61_105 | 778 [724–835] | 365 [329–404] | 81 % | 92 % | 102 / 634 / 42 |
| B61_111 | 195 [169–224] | 59 [45–76] | 25 % | 53 % | 100 / 53 / 42 |
| B61_115 | 190 [164–219] | 57 [43–74] | 23 % | 51 % | 99 / 49 / 42 |
| B61_122 | 189 [163–218] | 54 [41–70] | 23 % | 48 % | 96 / 51 / 42 |
| B69_105 | 778 [724–835] | 363 [327–402] | 81 % | 92 % | 100 / 636 / 42 |
| B69_111 | 195 [169–224] | 57 [43–74] | 25 % | 51 % | 98 / 55 / 42 |
| B69_115 | 190 [164–219] | 55 [41–72] | 23 % | 49 % | 97 / 51 / 42 |
| B69_122 | 189 [163–218] | 52 [39–68] | 23 % | 46 % | 94 / 53 / 42 |
| A2 | 146 [123–172] | 28 [19–40] | — | — | 51 / 51 / 44 |

Runs: 54 (expected 54).

Consequence rule: A2 wide cut vs B(69,122) = 23 % → page headline must lead with this smaller number.

## S2 Height-keeping error (d = 3 + 4, seeds 1–3)

| zsig | A0 wide / close | A2 wide / close | wide cut | close cut |
|---|---|---|---|---|
| 0 m | 778 / 365 | 146 / 28 | 81 % | 92 % |
| 3 m | 921 / 234 | 260 / 36 | 72 % | 85 % |
| 5 m | 969 / 255 | 357 / 75 | 63 % | 71 % |

## S3a Layout spread

| d | seeds | A0 wide | A2 wide | pooled cut [95 %] | per-seed cuts (A0 >= 10): n, p10, median, min–max |
|---|---|---|---|---|---|
| 4 km | 30 | 2384 | 416 | 83 % [81–84 %] | 29, 72 %, 82 %, 62 %–93 % |
| 3 km | 15 | 2655 | 543 | 80 % [78–81 %] | 15, 65 %, 81 %, 58 %–85 % |
| 6 km | 30 | 273 | 51 | 81 % [75–86 %] | 10, 79 %, 86 %, 40 %–96 % |

## S3b Zipline drop-box layout (d = 3, seeds 1–3)

| boxes | A0 wide | A2 wide | cut | difference from default (points) |
|---|---|---|---|---|
| 20 within 5 km (default) | 575 | 108 | 81 % | — |
| 5 within 2 km | 542 | 110 | 80 % | -2 |
| 5 within 5 km | 562 | 115 | 80 % | -2 |
| 40 within 2 km | 534 | 101 | 81 % | -0 |
| 40 within 5 km | 665 | 115 | 83 % | +1 |

## Verdicts

| Prediction | Result | Verdict |
|---|---|---|
| P1 B(61,111) <= 45 % of B(61,105) wide | 25 % | **PASS** |
| P2 B(69,122) <= 30 % of B(61,105) wide | 24 % | **PASS** |
| P3 A2 wide cut vs B(69,122) < 50 % | 23 % | **PASS** |
| P4 Wing–Amazon wide change 61→69 m outbound (i = 105) < 25 % | 102 → 100 (2 %) | **PASS** |
| E1 A2 wide cut >= 65 % at zsig 3 m | 72 % | **PASS** |
| E2 A2 wide cut >= 50 % at zsig 5 m | 63 % | **PASS** |
| L1 d = 4 pooled cut >= 70 % and p10 >= 50 % | 83 %, p10 72 % | **PASS** |
| L2 d = 3 (15 seeds) pooled cut >= 70 % | 80 % | **PASS** |
| L3 d = 6 pooled cut < 60 % | 81 % | **FAIL** |
| L4 every box layout within ±10 points of default | -2, -2, -0, +1 | **PASS** |

Total runs read: 246.

## What this means
1. **Most of the headline comes from one 10 m change, and Amazon may already make it.** Raising Amazon's return from 105 m to 111 m or higher (still inside or just above its filed band) removes about 75 % of cross-operator planned meetings on its own (778 → 189–195). Amazon–Zipline meetings fall from 634 to about 50. Outbound height (61 vs 69 m) makes no difference.
2. **Against the heights Amazon is reported to fly (about 69 m out, 122 m back), the full allocation adds 23 % fewer wide meetings (189 → 146) and 46 % fewer close ones (52 → 28).** The remaining gain is mostly Wing–Amazon outbound (94 → 51), from moving Wing to 46–71 m and Amazon's outbound to 81 m. By the consequence rule set in advance, the city page headline must now lead with this smaller number.
3. **Height-keeping error weakens the allocation but does not remove it**: the cut is 72 % at 3 m per-flight bias and 63 % at 5 m (E1, E2 PASS). Note that error also spreads the filed 4 m overlap, so filed close meetings fall (365 → 234–255) while wide meetings rise.
4. **The result does not depend on the random layout or the drop-box assumption.** 83 % at 4 km across 30 layouts (worst tenth 72 %), 80 % at 3 km across 15, 81 % at 6 km across 30. Drop-box layouts change the cut by 2 points or less.
5. **L3 failed.** I predicted the cut would be below 60 % at 6 km spacing, where Amazon sites are sparse. It was 81 % [75–86]: at 6 km there are few meetings (273 filed in 30 runs), but the share involving the Amazon–Zipline overlap is still high in this zone. HOUSTON2's 40 % Amazon share at 6 km came from one seed.

## Not yet tested (follow-up needed)
The bad-day ratios (holds 9.4×, outages 7.0×) and the plan-check delay ratio (4.4× flights, 6.7× time) were all measured against the filed baseline. DEVA0 traced them to the same 4 m clash, so they are likely to shrink against the reported Amazon heights. They must be re-run against B(69, 122) before being quoted as the benefit of height sharing.
