# SEEDS2: ten runs instead of three for the realistic plan-sharing cost (registration, 28 Oct 2026)

Status: precision check. Registered before the runner, analysis or any run.

## Why
The public pages quote COORD1's realistic plan-sharing cost ("about 1 in 5 flights in Houston and 1 in 6 in DFW wait, about 6 minutes"; 96-99 % of planned conflicts removed; height sharing roughly halves the delayed share), which rests on 3 seeds (3 windy hours) per cell.

## Settings
- COORD1 exactly (planned/coord1_run.js `one()`, loaded from that file unchanged): real layouts, A0 and A2 heights, plans on the previous hour's wind, flown in the actual hour, V2 volumes; windy hours from `bandHours(0.85, 0.95, n)`, whose first three are COORD1's three hours.
- New seeds 4-10 (hours 4-10 of the same list) for arms NONE and V2, A0 and A2, both metros (56 runs). Pooled with COORD1's seeds 1-3.

## Predictions (10 seeds pooled)
- **S1:** A2 + V2 delayed share: Houston 15-24 %, DFW 13-21 %.
- **S2:** V2 cuts flown planned conflicts against NONE by at least 93 % in both metros, both height plans.
- **S3:** A0/A2 delayed-share ratio under V2 is 1.6-2.5 in both metros.
- **S4:** mean delay of delayed flights (A2 + V2) is 4-8 minutes in both metros.

## Checks (K)
- K1: the loaded `one()` reproduces COORD1 Houston A2 V2 seed 1 exactly (delayed count, cancelled, wide).
- K2: `bandHours(0.85, 0.95, 10)` starts with COORD1's three hours in both metros.

## Deviation log
(none yet)
