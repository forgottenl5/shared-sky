# VERTIPORT1 — outside validation: does the air-taxi engine reproduce a published vertiport capacity result? (registered 27 Oct 2026, before the run)

## Source (primary, read in full)
Vascik, P. D. and Hansman, R. J., "Development of Vertiport Capacity Envelopes and Analysis of Their Sensitivity to Topological and Operational Factors", AIAA SciTech 2019 (MIT ICAT-2019-01 accepted version, attached by the founder). Their model is an integer program (Gurobi) that finds the best schedule in a 15-minute window for one TLOF pad with 0-8 gates, fully dependent operations (one aircraft at a time on approach, departure or taxi to/from the pad), no pre-staged aircraft.
- Fig. 14 (60 s approach, 60 s departure, 15 s taxi, 300 s turnaround) TLOF pad utilization, gates 1-8: 33, 58, 83, 90, 98, 98, 98, 98 %.
- Fig. 15 (same, 30 s approach and departure) gates 1-8: 23, 48, 63, 78, 83, 88, 93, 100 %.
- Eqn. 7 (gates needed for a saturated pad, dependent taxi): ceiling(turnaround / (max(approach, departure) + taxi)) + 1 = 5 (Fig. 14 setting) and 8 (Fig. 15 setting).
- Fig. 17 (maximum arrivals + departures in 15 min vs turnaround time). The setting is not stated; the 20-operation ceiling equals 900 s / 45 s, so it is read as 30 s approach/departure + 15 s taxi. Values digitised by eye from the figure (approximate, +-1): turnaround 30, 60, 90, 120, 180, 240, 300, 450, 600 s ->
  1 gate 15, 12, 10, 9, 7, 5, 5, 3, 3; 2 gates 20, 20, 19, 16, 13, 10, 10, 6, 6; 4 gates 20, 20, 20, 20, 19, 18, 16, 12, 10; 6 gates 20, 20, 20, 20, 20, 20, 18, 15, 12; 8 gates 20, 20, 20, 20, 20, 20, 20, 17, 14.
Zelinski (NASA, DASC 2020, also attached) uses closed-form capacity formulas and is not used as an anchor (reproducing a formula tests nothing).

## Engine and mapping
taxi/net4.js (stands limit landings; committed with taxi/test_net4.js, all checks pass). Mapping: one pad; Vascik's dependent policy is represented by a pad occupancy of approach (or departure) + taxi = 75 s (Fig. 14) or 45 s (Fig. 15, 17); gates = stands; turnaround at the stand. A stand is reserved when an approach is accepted and released when the aircraft's departure slot starts. No pre-staged aircraft at the vertiport; 40 aircraft approach from a source 20 km away at the same moment (so arrivals are always waiting) and there are always passengers to carry away. Window: 900 s from the first approach time. Utilization = pad busy time inside the window / 900 s. Operations = pad slots that end within the window. 0 gates (turnaround on the pad) is not modelled and is excluded.
Important difference: the engine is first-come first-served with one fixed rule (a departure books its pad slot when its aircraft lands; an arrival books when its approach is accepted), while Vascik's program finds the best schedule. The engine therefore cannot exceed the optimum by much and may fall below it.
Known before registration: the unit test T1 (taxi/test_net4.js) already gives the Fig. 14 setting with 2 stands: 50 % (Vascik 58 %). Before net4 existed, hand timelines were worked under a different tie rule (arrival first at equal times): Fig. 14 setting 1, 2, 3, 4 stands = 33, 58, 83, 92 %; Fig. 15 setting 1, 2 stands = 25, 48 %. Under the engine's rule only the 2-stand Fig. 14 value (50 %) is known.

## Predictions
- **V1:** Fig. 14 setting, stands 1-8: engine utilization within 10 percentage points of Vascik's in at least 7 of 8 cases.
- **V2:** Fig. 15 setting, stands 1-8: within 10 points in at least 7 of 8 cases.
- **V3:** the smallest stand count with utilization >= 95 % is 5 +- 1 (Fig. 14 setting) and 8 +- 1 (Fig. 15 setting), matching Eqn. 7.
- **V4:** Fig. 17 sweep (45 s pad, gates 1, 2, 4, 6, 8, the nine turnaround values): engine operations within 2 of the digitised values in at least 80 % of the 45 points.
- **V5 (sanity):** engine utilization never exceeds Vascik's by more than 5 points (V1, V2 cases).

## Checks before the run
- **K1:** node taxi/test_net4.js -> ALL PASS.
- **K2:** at least 30 aircraft remain waiting to approach at the 900 s mark in every case (the arrival queue never empties inside the window).

## What would count against the engine
V1 or V2 failing with the engine above Vascik (V5 failing) would mean the stand or pad logic lets through operations the physics forbids. Failing below Vascik is expected only where the fixed first-come rule loses to an optimised schedule; the gap will be reported per case.

## Files
Runner planned/vertiport1_run.js, analysis planned/vertiport1_analyze.py, output out/vertiport1.jsonl.

## Deviation log
(none yet)
1. (Appended after fingerprint, before any result was looked at.) K2 failed with 40 inbound aircraft: in the busiest case 27 (not >= 30) were still waiting at 900 s. The queue did not empty, which is what K2 protects, but the registered threshold was missed. Fix (attempt 1 of 2): 60 inbound aircraft instead of 40 (only the queue length changes; pad, stand and timing rules are unchanged). The runner line is marked. K2 rerun result is printed in the commit message.
