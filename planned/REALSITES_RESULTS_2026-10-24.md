# Build-out on real candidate sites: results (2026-10-24)
Pre-registration: REALSITES_PREREG.md, sha256 1864dfd5…, committed with code before any run. K1 passed. 63 runs. No deviations.

## Result in one line
**Growing Wing (and DFW's Zipline) on real Walmart stores instead of random spots changes little.** Full build-out close calls are 6–14 % lower than with random sites, and sharing out heights still cuts 78–80 % against the Omaha profile and **72–73 % against Amazon's best-sourced heights**, in both metros.

| Metro | Stage | Real sites | Omaha profile | Best-sourced | Shared out | Cut vs Omaha / best-sourced | Random-site Omaha |
|---|---|---|---|---|---|---|---|
| Houston | today | 15 of 15 | 0 | 0 | 0 | — | 0 |
| Houston | early | 22 of 37 | 1.7 | 1.5 | 0.3 | 80 / 78 % | 0.5 |
| Houston | mid | 42 of 74 | 5.2 | 5.3 | 1.3 | 74 / 75 % | 6.3 |
| Houston | full | 75 of 145 | 33.8 | 25.8 | 7.3 | 78 / 72 % | 36.0 |
| DFW | early | 40 of 40 | 1.2 | 1.3 | 0.5 | 57 / 62 % | 0.5 |
| DFW | mid | 79 of 79 | 4.3 | 3.3 | 1.0 | 77 / 70 % | 3.0 |
| DFW | full | 122 of 156 | 21.2 | 15.7 | 4.2 | 80 / 73 % | 24.7 |
Close calls per hour (30 m / 10 m), no plan check; 3 seeds × 2 h. "Real sites" counts Walmart stores, Wing's operating stores, Amazon's sites and Zipline's Cypress area.

| Prediction | Result | Verdict |
|---|---|---|
| R1 Houston full within 0.7–1.5× random sites | 33.8 vs 36.0 | **PASS** |
| R2 sharing out >= 65 % vs Omaha at mid and full, both metros | 74 / 78 / 77 / 80 % | **PASS** |
| R3 sharing out >= 55 % vs best-sourced at full, both metros | 72 / 73 % | **PASS** |
| R4 DFW full within 0.7–1.5× random sites | 21.2 vs 24.7 | **PASS** |
| R5 Houston mid: real sites >= random | 5.2 vs 6.3 | **FAIL** |

## Reading
- Real sites cluster, but the clusters do not land on Amazon's routes more than random sites do; in Houston's mid stage they land on them slightly less (my prediction was the opposite). At the early stage real sites give more close calls (1.2–1.7 vs 0.5 an hour), because Wing's real network grows next to Amazon's first sites; counts are small there (3–10 per cell).
- The random-placement assumption no longer drives any headline: the cuts with real sites match the random-site studies within a few points.
- Limits: the growth rule (nearest unclaimed Walmart) is an assumption; Houston Zipline still random; at full build-out 16–34 sites per metro are random because stores run out; 3 seeds.
