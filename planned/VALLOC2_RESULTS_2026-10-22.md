# Phase 2a addendum: free spread within filed bands vs fixed allocation: results (VALLOC2_PREREG.md), 2026-10-22
Status: behaviour model, planned tracks only; paired with VALLOC (same sites, orders, Wing heights). Code hashed before the runs (planned/VALLOC2_CODE.sha256, verified after). L1-L2 PASS; A0-A2 unchanged.

## Results (central 144 km^2; 3 seeds x 2 h; table in planned/valloc2_results_table.md)
| Wing nest spacing | Filed baselines (A0) | Free spread in filed bands (A3) | Amazon returns at top of band (A1) | Fixed allocation (A2) |
|---|---|---|---|---|
| 4 km: cross-operator meetings / h | 30.2 | 20.5 (-32 %) | 7.5 (-75 %) | 5.2 (-83 %) |
| 4 km: close (15 m / 5 m) / h | 10.3 | 4.0 (-61 %) | 1.2 (-88 %) | 1.0 (-90 %) |
| 3 km: meetings / h | 85.5 | 69.2 (-19 %) | 21.0 (-75 %) | 15.2 (-82 %) |
| 3 km: close / h | 27.0 | 12.8 (-53 %) | 4.7 (-83 %) | 2.0 (-93 %) |
| 2 km: meetings / h | 393 | 301 (-23 %) | 111 (-72 %) | 77 (-80 %) |
| 2 km: close / h | 115 | 51 (-55 %) | 18 (-84 %) | 12 (-89 %) |

| Prediction | Result | Verdict |
|---|---|---|
| W1 free spread cuts meetings by < 50 % at 4 and 3 km | 32 %, 19 % | **PASS** |
| W2 fixed allocation has <= half the meetings of free spread at 4 and 3 km | 0.25x, 0.22x | **PASS** |

## What this means
1. Spreading heights within the filed bands helps (meetings -19 to -32 %, close ones -53 to -61 %), because a spread Amazon return leg is near Zipline's 101 m only part of the time.
2. A fixed allocation that separates operators does 3-4x better than free spread. When operators' filed bands overlap, more vertical freedom does not separate them; a rule about who flies where does.
3. This differs from Melgosa et al. (2026), who found vertical freedom beats rigid layers. The settings differ: their layers organise all traffic by structure in a European city; here the issue is two operators' bands overlapping and one operator (Zipline) with a single filed height. Both can be true; the comparison is reported, not resolved.
