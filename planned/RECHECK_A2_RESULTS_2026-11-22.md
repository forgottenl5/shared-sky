# RECHECK_A2 results (2026-11-22): COUNTFIX and RECOUNT1 re-run with exact deviations and a bounded count
Registration planned/RECHECK_A2_PREREG.md (fingerprint 2395ddbc…); runner planned/recheckA2_run.sh (`SKY_EXACT_DEV=1 SKY_BOUND=1`); analysis planned/recheck_compare_a2.py; full table planned/recheck_a2_results_table.md; runs planned/raw/out_recheck_a2.tar.xz. All 68 runs completed (COUNTFIX 42, RECOUNT1 26).

**Summary: 1 of my 3 re-check predictions held (Q3). No prediction verdict changed: COUNTFIX U1–U4 and RECOUNT1 R1–R3 all still PASS. As in RECHECK_A1, the two predictions about direction and size failed. Bounding removed up to 6.7 %, not up to 6 %, and every deviation cell counted 4 times per second went *down* with exact deviations (0 of 5 rose).**

## Registered predictions
| | Prediction | Result | Verdict |
|---|---|---|---|
| Q1 | COUNTFIX valloc/proc cells (≥ 20 wide): within ±6 % | valloc A0 −6.7 %, A2 −4.8 % | **FAIL** |
| Q2 | Deviation cells at 4 checks per second (≥ 10 wide): re-check ≥ original in at least two thirds | 0 of 5 (HOLD-A0 −15.5 %, HOLD-A2 −3.8 %, RTH-120 −11.5 %, OUT-A0 −14.0 %, OUT-A2 −16.4 %) | **FAIL** |
| Q3 | At most 2 of 7 prediction verdicts change | 0 changed | PASS |

## Moved figures (original → re-check)
| Study | Prediction | Original | Re-check |
|---|---|---|---|
| COUNTFIX | U1 A2 wide cut / close cut | 81 % [78–84] / 92 % [89–95] PASS | 81 % [77–84] / 92 % [89–95] PASS |
| COUNTFIX | U3 HOLD-A0 vs HOLD-A2 per hold | 9.4× [6.3–14.7]; A0 245; A2 0.42 per 100 PASS | 8.3× [5.4–13.1]; A0 207; A2 0.40 per 100 PASS |
| COUNTFIX | U4 RTH-120 vs RTH-OWN | 10.7× [5.4–24.0]; 96 at 120 m PASS | 8.5× [4.4–18.4]; 85 at 120 m PASS |
| RECOUNT1 | R1 sub 4, seeds 22–24 | 5.3× [3.5–8.3] PASS | 6.8× [4.1–11.9] PASS |
| RECOUNT1 | R2 sub 4, seeds 22–31 | 6.5× [4.9–8.8] PASS | 6.7× [4.9–9.3] PASS |
| RECOUNT1 | R3 sub 1 → sub 4 rate rises | OUT-A0 4.80 → 6.57, OUT-A2 0.69 → 1.23 PASS | OUT-A0 4.76 → 5.62, OUT-A2 0.78 → 0.82 PASS |

## Reported, not predicted
- **RECOUNT1 K1 now FAIL** (a check, not a prediction): its constants are the old OUTAGE counts (106 / 15). With the exact hold the sub-1 counts are 105 / 17. Expected by the registration; the exact hold starts half a second of flight away from the old hover point.
- **COUNTFIX ratios copied by later studies.** RTH-120 rate falls from 1.54 to 1.36 per 100 return flights (85 over 6235). RTHREP H2 registered "≥ 1.54" and got 1.31 in RECHECK_A1; against the re-checked 1.36 it would still be below, so H2 stays FAIL either way. HOLD-A0 falls from 245 to 207 wide.
- RTH-OWN rose 9 → 10 (below the 10-event floor for Q2).

## What this means
- The pattern from RECHECK_A1 repeats: the old 1 s stationary steps, counted 4 times per second, **over**counted off-plan conflicts by 4–16 % in these studies, not undercounted them. The likely reason (not tested) is repeated crossings of the 30 m line by a drone that sits still and then jumps.
- Every ratio the findings use survives with the fixes (holding with current heights 8.3× worse than shared-out, was 9.4×; return at a common 120 m 8.5× worse than at own height, was 10.7×; area outages 6.7×, was 6.5×). The sub-1 → sub-4 rise that RECOUNT1 R3 reported is much smaller with exact deviations (OUT-A2 0.78 → 0.82 instead of 0.69 → 1.23), so part of what looked like conflicts missed at 1 check per second was the old method's overcount at 4 per second.

## Deviations
- (none)
