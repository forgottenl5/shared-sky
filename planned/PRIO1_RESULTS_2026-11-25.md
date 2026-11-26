# PRIO1 results (25 Nov 2026): when two companies' plans clash, who waits?
Registration planned/PRIO1_PREREG.md (fingerprint in planned/PRIO1_PREREG.md.sha256; runner and analysis committed before any run). K1-K4 passed. 60 runs, all completed. Table: planned/prio1_results_table.md. FCFS references from INTENT2 and GAP1. No deviations.

## Result in one line
**Changing who goes first barely changes anything: taking turns, shortest flight first and most-held company first all leave the overall held share within about 1 percentage point of today's first-come-first-served rule, and Amazon stays the most-held company under every rule (87-95 % with the shared-out heights).** The spacing of heights matters about ten times more than the order: GAP1's spacing takes Amazon from 90-95 % held to 10-23 % under any rule. 2 of 5 predictions passed.

## Predictions
- **R1 FAIL** shortest flight first did not cut total waiting: 1,619 vs 1,519 hours (Houston, shared-out heights), 1,178 vs 1,164 (DFW); with GAP1's spacing 110 vs 109 and 60 vs 64 (only DFW lower).
- **R2 FAIL** shortest flight first did not reliably raise Amazon's held share: +0.2 and +1.9 points in Houston, -1.8 and 0.0 in DFW.
- **R3 PASS** taking turns changed the overall held share by under 10 %: 16.6 vs 17.1 %, 2.7 vs 2.7 %, 17.6 vs 18.0 %, 2.2 vs 2.3 %.
- **R4 FAIL** most-held company first lowered Amazon's held share by only 0.2 (Houston) and 2.5 points (DFW) with the shared-out heights, not 10.
- **R5 PASS** most-held company first narrowed the gap between companies a little: by 0.6-2.7 points with the shared-out heights, 2.7-3.1 points with GAP1's spacing (Amazon 21 to 18 % Houston, 12 to 10 % DFW).

## Reading
- **Amazon's waiting is geometry, not queue order.** Its plans cross Zipline's cruise along most of their length (GAP1's diagnostic); reshuffling who files first inside a 5-minute round cannot remove that overlap, it only moves the wait between flights.
- **Fairness rules help at the margin.** "Most-held company first" is the only rule that consistently shares the waiting more evenly, and only by a few points.
- **For a regulator:** the order rule (first come, first served, as in the standard) is not where the leverage is; the height spacing and plan size are.

## Limits
Run on the earlier, simpler engine (INTENT2's model), before PHYS1 added realistic flights; PHYS1 (v1.7.0) found Amazon held for 97-99 % of its flights with the shared-out heights on the realistic engine too, so the conclusion (order does not fix Amazon's waiting) is not expected to change, but the exact figures here are the earlier engine's. Reordering only inside 5-minute filing rounds; plans already accepted are never moved (no pre-emption), which limits what any order can do. A rule that could bump an accepted plan, or longer rounds, might matter more; not tested. No urgency classes (no public data). 5 seeds.
