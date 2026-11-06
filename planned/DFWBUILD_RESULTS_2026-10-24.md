# DFW build-out, stage by stage: results (2026-10-24)
Pre-registration: DFWBUILD_PREREG.md, sha256 c75c3038…, committed with code before any run. K1/K2 passed. 81 runs (3 stages × 3 heights × 3 variants × 3 seeds), corrected engine, counting bounded to the window. No deviations.

## Result in one line
**DFW follows Houston at roughly two-thirds the level:** 0.5 close calls an hour at the early stage, 3.0 at mid, 25 at full build-out (Omaha profile, no coordination; Houston 0.5 / 6.3 / 36), because Zipline's DFW filing is 400 flights a day per site against about 950 in Houston. Sharing out heights cuts 67–78 %; heights shared plus a ±30 s check leaves 20 of 148 close calls with 1.5 % of flights delayed.

| Stage | Sites Wing / Zipline / Amazon | Omaha profile | High-return case | Shared out | Cut vs Omaha / high-return |
|---|---|---|---|---|---|
| Early | 19 / 19 / 2 | 0.5 | 0.17 | 0 | (3 → 0, too few) |
| Mid | 38 / 38 / 3 | 3.0 | 1.3 | 1.0 | 67 / 25 % |
| Full | 75 / 75 / 6 | 24.7 | 10.3 | 5.3 | 78 / 48 % |

Full build-out, plan check: calm air ±5 s leaves 0 (1.9 % delayed); typical DFW wind ±5 s leaves 113 of 146; ±30 s leaves 60 of 146 (6.2 % delayed, mean 76 s); shared heights + ±30 s leaves 20 of 38 shared-out close calls, i.e. 20 of 148 against the Omaha baseline (87 % fewer) with 1.5 % delayed.

| Prediction | Result | Verdict |
|---|---|---|
| D1 full, Omaha: 15–30 an hour | 24.7 | **PASS** |
| D2 sharing out >= 65 % at mid and full | 67 / 78 % | **PASS** |
| D3 Amazon–Zipline >= 50 % at full | 68 % | **PASS** |
| D4 full, typical wind, ±30 s removes < 80 % | 59 % | **PASS** |
| D5 mid <= 3.2 an hour | 3.0 | **PASS** |

Limits: no "today" stage (DFW site lists not public); Wing and Zipline random (REALSITES tests real Walmarts); 3 seeds (mid counts 6–18 per cell).
