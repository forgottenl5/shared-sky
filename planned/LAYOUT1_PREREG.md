# LAYOUT1: shared-out heights with wider gaps, inside the filed bands (written 2026-11-24 before any run)
Status: design test. Registered before the runner, analysis or any run.

## Why
Three results point at the same weakness of the shared-out heights A2 (Wing 46-71 m, Amazon out 81 m, Zipline 101 m, Amazon back 115 m), whose gaps are 10, 20 and 14 m:
- CURVE1: without plan sharing the cut dips to 45-55 % at a 15 m vertical rule, where Amazon's return (115 m) and Zipline (101 m) count against each other.
- RISK2: with the realistic check V2 (+-10 m height blocks) and average GPS error, A2 keeps more residual collision risk than Amazon's best-sourced heights, almost all from Amazon out (81 m) vs Zipline (101 m), exactly 20 m apart at the edge of V2's blocks.
- SEEDS2 / REALCOORD: with V2, 71-84 % of Amazon's flights are held, because its climbs and descents cross every other layer.
COORD2 (3 seeds) showed that gaps of at least 20 m cut held flights by more than half, but used heights outside the filings (Wing 40-60 m) and kept Amazon's return above Zipline.

The filings leave a cleaner option (planned/TEXAS_FILINGS_2026-10-23.md): Zipline cruises at a fixed 101 m; Wing files 46-91 m (150-300 ft); Amazon's Texas EA files one 55-115 m band for both legs. So Amazon can use one height for both legs, and Amazon's return no longer has to sit above Zipline.

## Layouts (all inside the filed bands; Wing uniform per flight within its range, as before)
- **M1 "Amazon in the middle":** Wing 46-52 m, Amazon 76 m both legs, Zipline 101 m. Gaps 24 m (Wing top to Amazon) and 25 m (Amazon to Zipline).
- **M2 "Amazon low":** Amazon 55 m both legs, Wing 76-80 m, Zipline 101 m. Gaps 21 m and 21 m.
- References, not re-run: A2 (shared out), S1 (Amazon's best-sourced heights), A0 (Omaha profile), from CURVE1, SEEDS2 / COORD1 and RISK1 / RISK2.
In M1 Amazon's climbs and descents cross only Wing's thin 46-52 m band; Zipline does not descend in the model (it hovers at 101 m). In M2 Wing's many descents cross Amazon's 55 m layer.

## Parts (same engines, layouts and seeds as the reference studies; only the heights change)
- **U, without plan sharing** (CURVE1 / HEADLINE2): still air, real filed layouts, seeds 1-10, 2 measured hours, 4 checks a second, bounded window; planned conflicts between companies at 30 m horizontal and vertical rules 5, 7.5, 10, 12.5, 15, 20 m. Cut = 1 - layout / S1 (pooled over seeds). 2 layouts x 2 metros x 10 seeds = 40 runs.
- **C, with plan sharing** (SEEDS2 / COORD1 `one()`, loaded unchanged): plans on the previous hour's wind, flown in the actual hour, the 10 windy hours of `bandHours(0.85, 0.95, 10)`, seeds 1-10, arms NONE and V2. Held share pooled over seeds, by company too. 2 layouts x 2 metros x 10 seeds x 2 arms = 80 runs.
- **R, residual collision risk** (RISK2 `one()` and its expected-collision formula, loaded unchanged): still air, seeds 1-10, checks NONE and V2, risk at average GPS error (L2) per 100,000 flight hours. 2 layouts x 2 metros x 10 seeds x 2 = 80 runs.

## Predictions
- **U1:** M1's cut against S1 is at least 75 % at every vertical rule from 5 to 20 m, both metros (no dip).
- **U2:** at 10 m vertical, M1's cut is higher than M2's in both metros.
- **C1:** with V2, M1 holds at most 10 % of flights in both metros (A2: 18.9 % Houston, 17.5 % DFW).
- **C2:** with V2, at most 60 % of Amazon's flights are held under M1, both metros (A2: 84 % / 81 %).
- **C3:** V2 removes at least 99 % of flown planned conflicts under M1 and M2, both metros.
- **R1:** with V2 at L2, M1's residual risk is lower than A2's in both metros (A2: 0.93 Houston, 1.11 DFW per 100,000 flight hours).
- **R2:** with V2 at L2, M1's residual risk is no higher than S1's in both metros (S1: 0.82 / 0.51).
- Reported, not predicted: every M2 figure; held shares by company; mean delays; M1 and M2 against A0; 95 % bootstrap intervals over seeds.

## Checks (K)
- **K1:** part U with A2 seed 1 reproduces CURVE1's stored counts for all six vertical rules, both metros.
- **K2:** part C with A2, V2, seed 1, hour list as SEEDS2 reproduces the stored COORD1 / SEEDS2 row's held count for Houston.
- **K3:** part R: lab/risk.js unit tests pass, and the NONE path for A2 seed 1 DFW reproduces RISK1's encounters exactly.

## Rules
Runner and analysis committed before any run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
- (Appended after fingerprint 760bfdcf…; pre-study checks only.) K1 PASS (all six rules, both metros), K2 PASS (2333 = 2333), K3 PASS (487 encounters identical).
