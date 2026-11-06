# STANDS1 results (27 Oct 2026): parking stands per air-taxi site, engine v4
Registration: planned/STANDS1_PREREG.md. Runner and analysis committed before the run (401e72f). One deviation (K2 judged on the stand ledger; engine bookkeeping fix, logged; all runs repeated). K1-K3 pass. 1,200 runs.

**Registered result: 3 of 6 predictions passed, and the registered criterion did not measure what it was meant to.** It failed for a reason unrelated to stands: in engine v4, even with unlimited stands, arriving aircraft hold briefly for a landing pad (median 57 s in the diagnosed run), and because aircraft leave charged to exactly trip plus reserve, any hold lands them a little below the 20-minute reserve. The "at most 1 % of landings below reserve" test therefore fails from r = 3 upward whatever the stand count. The stand answer below comes from an exploratory cut without that test.

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| S1 unlimited stands on v4 match NET3 (v3) within 2 points / 60 s | within limits at r <= 6 in both metros (at most 0.6 points, 42 s); at r = 12 served share differs by 8.6 points (DFW) and 2.8 (Houston), median wait by 90 s and 165 s | **FAIL** |
| S2 NET1's stands (6; 5 at 49T) meet in >= 6/10 seeds at r 1.5 and 3 | DFW 9 and 0; Houston 10 and 3 | **FAIL** |
| S3 the same stands meet in <= 4/10 at r 12 and DFW r 6 | 0 everywhere | PASS, but partly trivial: DFW r 6 (24 aircraft) and r 12, and Houston r 12, cannot even park the fleet in 23 or 18 stands |
| S4 stands needed >= ceil(fleet/sites) + 2 | true in all cells | PASS, **for the wrong reason**: S* is driven by the reserve test, not stands |
| S5 stands needed <= ceil(fleet/sites) + 6 | none up to 24 stands from r = 3 (DFW) / r = 6 (Houston) | **FAIL** (same cause) |
| S6 the hub has the longest holds at just-enough stands | DFWc 6/8 and 10/10, IAH 5/7 and 10/10 | PASS |

## Why v4 differs from v3 (diagnosed, exploratory; planned/STANDS1_PREREG.md deviation log and this section)
- v3 booked the landing pad when the aircraft took off; v4 books it when the aircraft arrives, first come first served, so it queues behind departures that already hold pad slots. Same configuration (DFW r = 3, seed 1, unlimited stands): v3 had 0 landings below reserve, v4 had 7 of 426, every one of which would have been above reserve without the hold (median hold 57 s, mostly into DFW Airport).
- Both rules are simplifications. Real operations usually protect arrivals (an aircraft in the air cannot wait indefinitely), so v4's rule is the pessimistic one and v3's the optimistic one. The fix is an arrival-priority pad rule with stand limits kept (engine v5), registered as its own study.
- NET3's fleets and 2 pads at r >= 6 do not meet the 2-minute holding test under v4's rule even with unlimited stands, so the pads bind before the stands there.

## The stand answer (exploratory: criterion without the below-reserve test)
Stands per site needed in the median seed (fleet in brackets):
| r per route direction | DFW | Houston |
|---|---|---|
| 1.5 | 4 (8 aircraft) | 3.5 (5) |
| 3 | 6 (14) | 5 (8) |
| 6 | none up to 24: pads bind first | 8 (14) |
| 12 | pads bind first | pads bind first |
- NET1's 6 stands (5 at 49T) work at r = 1.5 everywhere and in 7 of 10 seeds at r = 3 in both metros.
- With unlimited stands, the peak number of aircraft parked or holding a stand reservation at one site (ledger, out/diag_stands1_ledger.json) is above the planned 6 at some site in 4/10 DFW runs at r = 1.5, 10/10 at r = 3, and every run at r >= 6; Houston 0/10, 8/10, then all. This confirms the earlier NET1-NET3 stand check (planned/DIAGNOSES_2026-10-27.md), which used logged stays that can be slightly inflated at the end of a run. The hub dominates: DFW Airport peaks at 12 at r = 6 and 36 at r = 12.
- Unlimited-stand peaks exceed the stands actually needed (for example 8 at DFW Airport against 5-6 needed at r = 3) because limiting stands only adds short holds and repositioning.

## Limits
Assumed demand; stand counts at real airports and FBOs are not public; every stand has a charger; the pad rule question above is open; DFW still includes the closed 49T for comparability with NET3.

Files: planned/stands1_run.js, stands1_analyze.py, stands1_results_table.md, out/stands1_*.json; exploratory: planned/diag_stands1_explore.py, planned/diag_stands1_ledger.js, out/diag_stands1_ledger.json.
