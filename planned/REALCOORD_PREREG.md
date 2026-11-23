# REALCOORD: the plan-sharing cost on real Walmart site layouts (written 2026-11-23 before any run)
Status: robustness check of the new headline. Registered before the runner, analysis or any run.

## Why
On 23 Nov 2026 the public pages started leading with the cost of plan sharing: with a modelled pre-flight check, giving each company its own height halves how many flights are held (SEEDS2: 18.9 % vs 38.8 % Houston, 17.5 % vs 36.5 % DFW; 10 windy hours). SEEDS2 used the headline layouts, where Wing's and Zipline's sites are placed at random. The biggest remaining assumption is that placement. REALSITES (24 Oct) put Wing (and DFW's Zipline) on real Walmart stores and found the uncoordinated cut unchanged, but did not test the plan-sharing cost. This study does.

## Settings
- **Layouts:** REALSITES full build-out (planned/realsites.js `sites(cfg, seed, 'full', metro)`): Houston 145 sites (Wing grown from its 13 operating stores onto the nearest Walmarts, 69 of 75 real; Zipline random around its Cypress dock area plus random, as in REALSITES; Amazon's real sites), DFW 156 sites (Wing from Frisco / Little Elm and Zipline from Mesquite onto Walmarts, 122 real in total; Amazon real). REALSITES zones: Houston 84 × 84 km, DFW 80 × 80 km.
- **Everything else as SEEDS2 / COORD1:** COORD1's `one()` loaded unchanged from planned/coord1_run.js, with only the site function and zone replaced by REALSITES' and the hour list extended to 10 (as SEEDS2 did). Heights A0 (Omaha profile) and A2 (shared out). Arms NONE (no plan sharing) and V2 (the realistic check). Plans made on the previous hour's wind and flown in the actual hour; the 10 windy hours of `bandHours(0.85, 0.95, 10)` per metro (the same hours as SEEDS2), seeds 1-10.
- 2 metros x 2 heights x 2 arms x 10 seeds = 80 runs.

## Predictions (pooled over the 10 seeds, as SEEDS2)
- **W1:** A2 + V2 delayed share: Houston 12-26 %, DFW 11-24 % (SEEDS2 values plus or minus about a third).
- **W2:** A0 / A2 delayed-share ratio under V2 is 1.5-2.6 in both metros (SEEDS2: 2.05, 2.09).
- **W3:** V2 cuts flown planned conflicts against NONE by at least 95 % in both metros, both height plans.
- **W4:** with NONE (flown in wind, no plan sharing), A2 has at least 65 % fewer flown planned conflicts than A0 in both metros (REALSITES still air: 78 % / 80 %).
- Reported, not predicted: mean delay; 95 % bootstrap intervals over seeds (paired by seed) for the delayed shares and the ratio; delayed share by company.

## Checks (K)
- **K1:** the patched site function returns exactly REALSITES' full-stage sites for seed 1 in both metros (operator, position).
- **K2:** with no wind and no check, A0 seed 1 reproduces the stored REALSITES full A0 seed 1 count of wide planned conflicts between companies in both metros (same flights, same counting).
- **K3:** the extended hour list starts with COORD1's three hours (as SEEDS2 K2).

## Rules
Runner and analysis committed before any run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
- (Appended after fingerprint 2c183450…; pre-study checks only.) K1 PASS (145 / 156 sites), K2 PASS (Houston 65 = 65, DFW 49 = 49), K3 PASS.
