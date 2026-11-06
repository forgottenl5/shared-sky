# PADRULE1 results (27 Oct 2026): landing rules with limited stands, engine v5
Registration: planned/PADRULE1_PREREG.md (one clarification, no deviations). Runner and analysis committed before the run (252364e). K2 (stand ledger never above stands), K3 (all fleet cells found) and K4 (rule "arrive" reproduces STANDS1 exactly on 40 configurations) pass. 4,000 runs.

**5 of 6 predictions passed. The landing rule matters more than the stand count: with 2 pads per site at 3 requests an hour per route direction, the v4 rule never meets the criterion at any stand count up to 16, while booking the landing slot at take-off needs 8 stands per site and holding the aircraft on the ground until a destination stand is reserved needs 5. With 4 pads per site the three rules converge, except that waiting on the ground still saves stands.**

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| R1 slot rule, unlimited stands, 2 pads, meets in >= 8/10 seeds (DFW r 1.5, 3; Houston r 1.5, 3, 6) | 9, 10; 10, 9, 8 | PASS (Houston r = 6 exactly at the line) |
| R2 confirm at ceil(F/n)+3 stands, 2 pads, meets >= 8/10 at r 1.5, 3 | 9, 10; 10, 8 | PASS |
| R3 confirm waits longer than slot at ceil(F/n)+2 stands (>= 6 of the parkable cells) | 7 of 8 cells (the exception is DFW r = 12, both far over the limit) | PASS |
| R4 confirm records swaps in >= 30 % of seeds at ceil(F/n) stands, r = 3 | DFW 10/10, Houston 7/10 | PASS |
| R5 slot, 10 stands, 4 pads meets >= 8/10 at r = 6 | DFW 8, Houston 10 | PASS (DFW at the line) |
| R6 confirm leaves no aircraft waiting to take off at the end (r <= 3, >= ceil(F/n)+2 stands) | 1-8 seeds-worth of waiting aircraft in 7 of 12 cells | **FAIL** |

R6 diagnosis (exploratory, planned/diag_padrule1_r6.js): the aircraft still waiting at the end have been waiting 0-25 minutes (a few have a take-off time after the run ends), so they are ordinary queueing at the cut-off, not a stuck deadlock; the prediction was too strict. A 25-minute ground wait is still long.

## Stands per site needed (median over seeds; the criterion is STANDS1's: served >= 95 %, median wait <= 600 s, airborne hold p95 <= 120 s, <= 1 % landings below reserve)
| Demand per route direction (fleet DFW / Houston) | 2 pads: arrive | slot | confirm | 4 pads: arrive | slot | confirm |
|---|---|---|---|---|---|---|
| DFW 1.5 (8) | 4.5 | 4 | **3** | 5 | 5 | **3** |
| DFW 3 (14) | >16 | 8 | **5** | 7 | 7 | **5** |
| DFW 6 (24) | >16 | >16 | >16 (5 of 10 seeds at 10) | 14 | 10 | 10 |
| DFW 12 (48) | >16 | >16 | >16 | >16 | >16 | 16 |
| Houston 1.5 (5) | 4 | 4 | **3** | 4 | 4 | **3** |
| Houston 3 (8) | >16 | 8 | **5** | 6 | 6 | **5** |
| Houston 6 (14) | >16 | 10 | 8 | 8 | 8 | 8 |
| Houston 12 (28) | >16 | >16 | >16 | >16 | 16 | 14 |

- **Two pads run out before stands do from r = 6** in DFW and r = 12 in Houston; four pads fix r = 6 everywhere and r = 12 in Houston.
- **Confirm saves stands but costs passengers time.** At two stands above the fleet's share, median wait under confirm vs slot: DFW r 1.5: 227 vs 131 s; DFW r 3: 225 vs 130 s; Houston r 3: 285 vs 46 s. That is the price of not holding in the air.
- **v4's rule is the worst of the three where pads are scarce** (2 pads, r >= 3): it fails the criterion at every stand count, because arrivals queue behind departures and land below reserve. The slot rule fixes that with no extra infrastructure.
- NET1's 6 stands (5 at 49T) are enough for r = 1.5 and, with 4 pads and either alternative rule, r = 3 in Houston (6) and just short in DFW (7).

## Limits
- Neither rule is a certified procedure; real arrival priority, go-arounds, weather and diversions are not modelled. Confirm assumes the operator can hold an aircraft on the ground without penalty and ignores that stranded passengers might switch to driving.
- Stands and chargers are assumed equal at every site; demand is assumed; DFW includes the closed 49T for comparability with NET3.
- The slot rule matches the old v3 engine flight for flight at moderate load, but diverges slightly at DFW r = 12 (a landing shifts by seconds at one point; cause not located; aggregates within 3 points and 16 s). Treat r = 12 numbers as indicative.
- R1 (Houston r = 6) and R5 (DFW) passed exactly at their thresholds.

Files: planned/padrule1_run.js, padrule1_analyze.py, padrule1_results_table.md (full grid), out/padrule1_*.json; exploratory: planned/diag_padrule1_r6.js; engine taxi/net5.js with tests taxi/test_net5.js.
