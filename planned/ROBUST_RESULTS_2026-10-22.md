# Robustness of the height-allocation finding: results (ROBUST_PREREG.md), 2026-10-22
Status: behaviour model of filed operations; planned tracks only; paired arms. Code hashed before the runs (planned/ROBUST_CODE.sha256, verified after). C1-C3 PASS. 48 runs; full tables in planned/robust_results_table.md.

## Verdicts
| Prediction | Result | Verdict |
|---|---|---|
| R1 full allocation (A2) cuts >= 70 % for every threshold with vertical <= 10 m (15/5, 30/10, 50/10 m) at 4 and 3 km | 79-93 % | **PASS** |
| R2 A2's cut < 50 % at vertical 15 m and < 30 % at vertical 20 m | 44-46 % at 15 m; 58-59 % at 20 m | **FAIL** (20 m part) |
| R3 at the busiest hour (x1.5), A2 cuts >= 75 % | 87 %, 82 % | **PASS** |
| R4 Dallas-Fort Worth mix: Amazon in >= 60 % of meetings and A2 cuts >= 60 % | Amazon 60 %, 76 %; A2 cuts 50 %, 54 % | **FAIL** (cut part) |

## Key numbers
Houston mix, cut vs filed baselines (pooled 3 seeds):
| Vertical threshold | A1 Amazon returns at top of band | A2 full allocation |
|---|---|---|
| 5-10 m (horizontal 15-50 m) | 74-89 % | 79-93 % |
| 15 m | -1 % (no effect) | 44-46 % |
| 20 m | 0 % | 58-59 % |
Dallas-Fort Worth mix (75 Wing : 75 Zipline at 400/day : 4 Amazon), 30 m / 10 m: meetings per hour 1.7 (4 km) and 11.7 (3 km) under filed baselines, about 4-7x fewer than Houston; A1 and A2 halve them; the rest are mostly Wing-Zipline meetings during climbs and descents, which height allocation cannot remove.

## What this means
1. **The result holds across horizontal thresholds, at the busiest hour, and at the 5-10 m vertical scale** (79-93 % cut). The reported effect is not an artefact of the 30 m / 10 m choice.
2. **It depends on the vertical separation the operators plan to.** Amazon returning at 377 ft clears Zipline by 14 m: that removes three quarters of meetings if 10 m is enough, and nothing if operators want 15 m or more. A full allocation still halves meetings at 15-20 m, because it also moves Amazon's outbound away from Wing. Any real allocation must set its gaps from the separation operators actually require, which is not public.
3. **The size of the effect depends on the operator mix.** In Dallas-Fort Worth's filed mix (Zipline at 400/day, few Amazon sites) cross-operator meetings are already much rarer and the fix halves them; in Houston's filed mix (Zipline Texas-draft volumes, more Amazon hubs) it removes ~80 %. The finding is strongest where Amazon and Zipline both operate at volume.
4. My R2 prediction assumed the 14 m gap would matter for every pair; the 20 m result is better than predicted because A2 also separates Amazon's outbound leg from Wing's band.

## Implication for the note
The note "Shared Sky Over Houston" should add: (a) the effect depends on the vertical separation operators require (no effect from A1 at >= 15 m); (b) the effect is smaller in Dallas-Fort Worth's filed mix (about half).

**Correction appended 27 Oct 2026 (exploratory rerun; this study's verdicts stand as run).** The R4 Dallas-Fort Worth cut (50 % at 4 km, 54 % at 3 km) was measured with the older counter (houston2.count, one check a second, before COUNTFIX) on 3 seeds with small counts (3 km: 70 vs 32). Rerun on the current engine with the same company mix (Amazon 4 sites per 75 Wing, Zipline 400 a day), 3 km, 10 seeds: A0 688 vs A2 174, a **75 % cut**; with DFWPROC's Amazon share (6 per 75) 948 vs 220, 77 %. So the DFW cut is about three quarters, not half, and agrees with DFWPROC (78 %). Note (b) above ("smaller in Dallas-Fort Worth's filed mix") is withdrawn. Details: planned/DIAGNOSES_2026-10-27.md.
