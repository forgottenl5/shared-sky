# Counting fix: finer sampling, in-zone incidents, error ranges, and re-run of headline results (study, written 2026-10-22 before any code or run)
Status: methods correction plus re-runs. Behaviour model of filed operations (planned tracks only). Not a forecast or safety assessment.

## Background (RED_TEAM_REVIEW_2026-10-22)
- **Sampling:** positions are checked once per second, and drones move up to 30 m per second. A 4× finer step found 1.56–1.60× more close (15 / 5 m) meetings and 1.08–1.31× more wide ones (one run, exploratory).
- **Zone dilution:** only ~30 % of injected deviations fell inside the counted zone (OUTAGE_RESULTS).
- **Error ranges:** none reported.

## Methods changes
1. **Sub-second sampling.** houston2.count gains `opts.sub` (checks per second). Positions in between are linear within each segment, with the in-segment fraction clamped to [0, 1]. Episodes, zone and warm-up rules are unchanged.
   - **Rule:** the study uses the smallest sub in {2, 4, 8, 16} at which doubling sub changes pooled close cross-operator meetings by less than 3 %. Measured on VALLOC A0, d = 3, seeds 1–3, before any re-run below. If none qualifies, use 16 and say so.
2. **In-zone incidents.** Deviation draws are restricted to moments when the drone is inside the counted zone (|x|, |y| <= 6,000 m) and after warm-up. Fraction 20 % of eligible zone-touching flights, raised from 5 % so the expected counts reach about 30.
3. **Error ranges.** Every count gets an exact Poisson 95 % interval. Ratios of two counts get an interval from the conditional binomial method.

## Re-runs (same seeds as the originals unless stated)
- **R-VALLOC:** VALLOC A0 vs A2, d = 4 and 3, seeds 1–3, at the chosen sub.
- **R-PROC:** PROC P2 (A2 + plan check), d = 4 and 3, seeds 1–3, re-counted at the chosen sub (planned meetings after the check).
- **R-DEV:** HOLD (120 s) at A2 vs A0, with in-zone draws, plan check, d = 4 and 3, seeds 19–21.
- **R-RTH:** RTH-OWN vs RTH-120 at A2, with in-zone draws, d = 4 and 3, seeds 19–21.

## Predictions (pooled)
- **U1:** At the chosen sub, A2 still cuts cross-operator meetings vs A0 by >= 65 % (wide) and >= 80 % (close). PREDICTION: holds.
- **U2:** After the plan check (R-PROC), cross-operator wide meetings at the chosen sub are <= 2 % of A2's unchecked wide meetings at the same sub (the booking cell rule is coarser than 30 m, so a few may slip through). PREDICTION: holds.
- **U3:** In-zone HOLD: A0 gives >= 5× A2's cross-operator wide meetings, the lower end of its 95 % interval above 1, and >= 30 meetings at A0. A2's rate lies between 0.1 and 2 per 100 holds. PREDICTION: holds.
- **U4:** In-zone RTH-120 gives >= 5× RTH-OWN's cross-operator wide meetings, with >= 30 at RTH-120. PREDICTION: holds.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below. Analysis scripts are committed before the runs they analyse.

## Feature checks (before the re-runs)
- **K1:** `count` with sub = 1 reproduces the old counts exactly (VALLOC A0 and A2, d = 4, seed 1).
- **K2:** The convergence measurement (rule above) is run and its table committed before the re-runs.
- **K3:** In-zone draws: every deviation point is inside |x|, |y| <= 6,000 m and at t >= 3,600 s.

## Deviation log
(none yet)
- (Appended after fingerprint 06a3ed63…; before the re-runs.) K1 PASS (sub = 1 reproduces old counts exactly); K3 PASS (1,273 in-zone draws at d = 3, seed 19, all inside). **K2 convergence** (VALLOC A0, d = 3, seeds 1–3), close cross meetings: sub 1: 162; 2: 238; 4: 263; 8: 265; 16: 268. Doubling from 4 to 8 changes close by 0.8 % (< 3 %), so **sub = 4**. Table in planned/countfix_converge.json. Note: in-zone draws are taken on each arm's accepted tracks, so A0 and A2 hold sets are not paired flight-for-flight; rates per hold are compared with intervals.
