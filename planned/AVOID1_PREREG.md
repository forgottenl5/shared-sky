
# AVOID1: does in-flight avoidance change the picture? (registration, 4 Nov 2026)

Status: registered before the analysis was run. This is an analysis-only study on the RISK1 encounter lists (out/risk1, raw output committed as planned/raw/out_risk1.tar.xz). Before writing it I had seen RISK1's published totals (collision risk per arm, level and size; encounter counts), but not the distribution of closing speeds, the number of encounters that would trigger an alert, or any avoidance result. No avoidance number was computed before this file was fingerprinted.

## Why
Every Sky-Grid result so far assumes drones fly their plans without reacting to each other, so every count and risk is an upper bound. Real drones can detect each other and move away. This study asks how much of RISK1's modelled collision risk survives a simple avoidance rule, what that costs in manoeuvres, and whether height sharing still matters once drones avoid.

## Sources
- FAA BAA004, MosaicATM, "Demonstration and Validation of Remote ID based Detect and Avoid" (FAA UAS BAA programme): detection ranges of 328-1,640 ft (100-500 m) used in its trade study; Remote ID report gaps "may easily extend to five or more seconds", and the team held the last known position for up to 5 s; in flight tests, 36 of 51 encounter test points were successful (ownship manoeuvred on time), with failures including faulty transmitters.
- Climb/descent rate for the manoeuvre: no published figure for these aircraft; assumed.

## Model (applied to each planned cross-company encounter from RISK1)
- **Alert:** if the planned closest approach is within 30 m sideways and 10 m vertically (the planned-conflict threshold used throughout the project). Alerts are based on the planned geometry; false and missed alerts from position errors are not modelled, except through the success share.
- **Time to act:** detection at range D gives D / (closing speed) seconds before the closest approach; latency tau (message gaps plus reaction) is subtracted.
- **Manoeuvre:** one aircraft climbs or descends away at rate c until the vertical gap reaches 10 m or time runs out. The other aircraft does not move.
- **Success:** a share s of alerts are acted on (base: the BAA004 field share, 36 / 51 = 71 %); the rest fly the plan.
- **Risk:** RISK1's Reich-type formula and base sizes (Wing half-length 0.65 m; Zipline and Amazon half-span 1.5 m, assumed), with the vertical gap after the manoeuvre. Errors as ERRORS1 levels L0, L1, L2 (independent).
- **Base settings:** D = 300 m, tau = 6 s, c = 2 m/s, s = 71 %. Sensitivity: D 100 and 500 m, tau 2 s, c 1 and 4 m/s, s 100 %.
- **Cost:** manoeuvres per flight hour (alerts acted on or not).

## Predictions (each applies to both metros and both arms where named; it passes only if all hold)
- **V1:** at L2 with base settings, avoidance cuts collision risk by between 50 % and 71 % (the success share is the ceiling), for both arms.
- **V2:** at L2 with every alert acted on (s = 100 %), avoidance cuts collision risk by at least 90 %, for both arms.
- **V3:** at L2 with base avoidance, height sharing still cuts the remaining collision risk by between 45 % and 75 %.
- **V4:** shared-out heights need at least 50 % fewer avoidance manoeuvres per flight hour than best-sourced heights (L2, base).
- **V5:** with 100 m detection range (other settings base), avoidance cuts collision risk by less than 30 %, for both arms.

## Limits stated in advance
- One manoeuvre per encounter; no secondary conflicts caused by manoeuvres; no multi-aircraft encounters; the other aircraft does not react.
- Alerting on planned geometry, not on broadcast positions with error; the success share stands in for detection failures and faulty transmitters.
- Climb rate and latency are assumptions; sizes as RISK1. No plan-sharing check (as RISK1). Model quantity, not a safety assessment.

## Deviation log
(none yet)
