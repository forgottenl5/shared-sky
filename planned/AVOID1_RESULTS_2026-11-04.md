# AVOID1 results (4 Nov 2026; registration planned/AVOID1_PREREG.md, fingerprint e2713d07…)
Full tables: planned/avoid1_results_table.md. Analysis-only study on the 40 RISK1 encounter lists. No deviations.

**3 of 5 predictions passed. The two misses are large and the main result: with Remote ID-based avoidance, avoidance removes nearly all the risk it can see when GPS is exact, but almost none at the GPS standard's average error (3-5 %), because most of that risk comes from encounters it cannot see.**

## Predictions
- **V1 FAIL** at L2 (base: 300 m detection, 6 s latency, 2 m/s, 71 % success) avoidance cuts collision risk by 3-5 % (Houston S1 5 %, A2 4 %; DFW S1 5 %, A2 3 %); I predicted 50-71 %.
- **V2 FAIL** with every alert acted on, 4-7 %; I predicted at least 90 %.
- **V3 PASS** height sharing still cuts the remaining risk by 61 % (Houston) and 57 % (DFW) at L2 with avoidance.
- **V4 PASS** shared-out heights need 75 % (Houston) and 76 % (DFW) fewer avoidance manoeuvres per flight hour.
- **V5 PASS** with 100 m detection range avoidance cuts risk by 0-1 %: at 30-40 m/s closing speeds the warning time (2.5-3.3 s) is shorter than the latency.

## Why V1 and V2 failed (exploratory diagnosis, run after the registered analysis)
- Only 24-49 % of the L2 risk comes from encounters that raise an alert (planned within 30 m sideways and 10 m vertically): Houston S1 46 %, A2 27 %; DFW S1 49 %, A2 24 %. The rest comes from drones planned more than 10 m apart in height that their errors bring together. Remote ID broadcasts the position each drone believes it has, so the broadcasts carry the same errors and the alert logic sees the planned geometry; cooperative avoidance cannot see navigation error.
- For alerted encounters, a 10 m target gap is inside the L2 relative height error (sigma about 9.4 m), so reaching it removes only part of each encounter's risk.
- When errors are small the rule works: with exact GPS (L0) it removes 71 % (its success share; Houston S1, DFW A2) or 35 % (DFW S1), and 31-48 % at best-site GPS (L1).

## Reading
- Avoidance based on broadcast positions fixes plan conflicts, not navigation error. At average GPS, reducing the error between nearby drones (shared errors, ERRORS2) or adding separation in the plans (height sharing) does more than this avoidance rule.
- Height sharing is not made redundant by avoidance: it cuts residual risk by 57-61 % and the manoeuvre count by three quarters.

## Limits
- Model as registered: one manoeuvre per encounter, alerts on planned geometry, the other aircraft does not react, assumed climb rate and latency, RISK1 sizes, no plan check. A sensor-based avoidance (radar or cameras seeing true positions) is not modelled and could behave differently.

## Deviation log
(none)
