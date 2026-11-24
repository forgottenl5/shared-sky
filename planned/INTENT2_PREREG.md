# INTENT2: plan volumes sized from navigation error under the standard's 95 % rule (written 2026-11-24 before any study run)
Status: follow-up to INTENT1. Registered before any study run (the runner's pre-checks K1-K2 are run after this file is fingerprinted).

## Why
INTENT1 showed that which height plan is best depends on how big each flight's shared plan (operational intent) is, and that I had guessed the sizes. Free sources (no copy of ASTM F3548 bought) narrow this down:
- NASA/TM-20240003151 and the NASA 2025 SciTech CMSA paper quote F3548-21's conformance rule: an aircraft must be inside its activated operational intent at least 95 % of its flight time (minimum conformance typically 95 %). So a plan's volume must contain the aircraft's 95 % position error.
- NASA's field test (Verma et al., DASC 2021) saw operator-designed volumes from 48 ft to 656 ft tall; NASA's risk method (TM-20240003151) adds 100-500 ft buffers and says buffers must grow with intent size.
This study replaces the guessed sizes with sizes derived from the project's own GPS error levels (RISK1 / ERRORS1) under the 95 % rule.

## Volumes (per flight; half-width w around the path, height band +-v; time buffer as V2, 10 s + 5 %)
- **N1, best-site GPS (L1: 95 % horizontal 3 m, vertical 4 m):** w = 3 + 1.5 m (largest half-span) = 4.5 -> 5 m; v = 4 + 0.3 -> 5 m.
- **N2, average GPS (L2: 8 m, 13 m):** w = 8 + 1.5 -> 10 m; v = 13 + 0.3 -> 14 m.
- **N2B, N2 plus NASA's smallest illustrative buffer (100 ft) sideways:** w = 40 m; v = 14 m.
These are the smallest volumes that meet the 95 % rule for position error alone; flight technical error and wind would make them larger, so they favour thin plans.

## Height plans (as INTENT1)
A0 (today, Omaha profile), A2 (shared out), M1 (LAYOUT1: Wing 46-52, Amazon 76 both ways, Zipline 101), FLEX (Amazon best-sourced S1 as filed; the check may move a flight in 5 m steps inside its company's band).

## Parts
- **C, cost (INTENT1 machinery, windy hours 1-5, plans on the previous hour's wind, flown in the actual hour):** 4 plans x 3 volumes x 2 metros x 5 seeds = 120 runs. Share of checked flights held (delayed or cancelled), by company.
- **R, residual collision risk (RISK2 machinery, still air, seeds 1-5):** same 12 cells plus no check for each plan = 16 cells x 2 metros x 5 seeds = 160 runs. Expected collisions per 100,000 flight hours with RISK2's formula and base sizes, at the GPS level each volume was sized for (L1 for N1; L2 for N2 and N2B).

## Predictions
- **J1:** at N1, A2 holds fewer than 10 % of flights in both metros.
- **J2:** at N2, M1 holds at least half as many flights as A2 in both metros (its 4x advantage at the old +-10 m blocks does not survive +-14 m).
- **J3:** at N2B, FLEX holds no more flights than A2 in both metros.
- **J4:** at N2 (risk at L2), A2's and M1's residual risk is lower than with the old V2 check (RISK2 / LAYOUT1: A2 0.93 Houston, 1.11 DFW; M1 0.67, 0.58).
- **J5:** at N2B (risk at L2), every plan's residual risk is at most 0.2 per 100,000 flight hours in both metros.
- **J6:** at N2 (risk at L2), FLEX's residual risk is no higher than A2's in both metros.
- Reported, not predicted: every held share and residual risk; cancellations; flights moved by FLEX.

## Checks (K)
- **K1:** planned/test_coordx.js passes, and the cost runner with the old V2 volume reproduces INTENT1's stored A2 V2 seed 1 Houston row (held, checked).
- **K2:** the risk runner's no-check path reproduces RISK1's encounters exactly (DFW A2 seed 1), and lab/risk.js tests pass.

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
- (Appended after fingerprint 792beca2…; pre-study checks only.) K1 PASS (2,333 = 2,333), K2 PASS (487 encounters identical).
