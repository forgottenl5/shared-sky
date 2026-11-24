# DIRECT1 results (24 Nov 2026): heights by direction or trip length instead of by company
Registration planned/DIRECT1_PREREG.md (fingerprint in planned/DIRECT1_PREREG.md.sha256; runner and analysis committed before any run). K1-K2 passed after deviation D1 (a cut-marker fix to the runner before any study run; logged in the registration). 180 runs, all completed. Table: planned/direct1_results_table.md. References (A0, A2, M1, FLEX, S1) from INTENT2 and CURVE1, same seeds.

## Result in one line
**Giving heights by direction (as crewed aviation does) or by trip length instead of by company does not beat company heights. With plans sized by the standard's 95 % rule at average GPS, two direction layers hold 62-72 % of flights against 17-18 % for the shared-out company heights; four direction layers 39-49 %; heights by trip length 55-57 %.** Direction layers do leave far less residual collision risk (0.0005 per 100,000 flight hours against 0.04-0.06 for shared-out and 0.005-0.006 for the wider-gap company layout), but mainly because most flights are held on the ground. 4 of 5 predictions passed; the failure was the four-layer layout, which held fewer flights than two layers, not more.

## Predictions (N2 = average GPS, +-10 m sideways / +-14 m in height)
- **E1 PASS** two direction layers (D2) hold 71.6 % (Houston) and 61.5 % (DFW), against A2's 17.1 % / 18.0 %.
- **E2 FAIL** four direction layers (D4) hold 49.0 % / 39.1 %, fewer than D2, not more. Why was not tested.
- **E3 PASS** trip-length layers (DD) hold 56.5 % / 54.5 %, more than A2.
- **E4 PASS** D2's residual risk is 0.00047 / 0.00047 per 100,000 flight hours, against flexible heights' 0.41 / 0.18.
- **E5 PASS** without plan sharing, D2 cuts planned conflicts against S1 by 58 % / 53 % at 30 m / 10 m.

## Figures (Houston / DFW)
| | shared out (A2) | wider gaps (M1) | 2 direction layers (D2) | 4 direction layers (D4) | by trip length (DD) |
|---|---|---|---|---|---|
| Held, average GPS | 17 % / 18 % | 18 % / 19 % | 72 % / 62 % | 49 % / 39 % | 57 % / 55 % |
| Held, best-site GPS | 4.9 % / 4.0 % | **1.7 % / 1.4 %** | 6.5 % / 5.9 % | 7.5 % / 7.1 % | 6.6 % / 6.1 % |
| Residual risk, average GPS | 0.063 / 0.038 | 0.005 / 0.006 | **0.0005 / 0.0005** | 0.25 / 0.16 | 0.0005 / 0.0003 |
| Risk with no check (average GPS) | 6.6 / 5.9 | **1.9 / 1.6** | 4.6 / 3.7 | 5.8 / 4.5 | 9.3 / 7.0 |
| Cut vs S1, no sharing, 10 m rule | 72 % / 75 % | (LAYOUT1) | 58 % / 53 % | 48 % / 38 % | 46 % / 37 % |
| Cut vs S1, no sharing, 20 m rule | 66 % / 59 % | (LAYOUT1) | 88 % / 84 % | 81 % / 74 % | 85 % / 79 % |
Wing is hit hardest: under D2 at average GPS 66-89 % of Wing flights are held (A2: 5-7 %), because Wing and Amazon now share both layers.

## Reading
- **Company heights stay the better design.** Mixing companies on the same layers means every company's flights cross every other company's on the same height, and with realistic plan sizes the check holds most of them. Direction layers only separate opposite-direction traffic, while company layers separate companies, which is what the check tests.
- **The low residual risk of direction layers is bought with waiting.** A flight held on the ground cannot collide; D2's risk is about 10 times lower than M1's, but it holds 3-4 times more flights. At best-site GPS M1 holds fewer flights than any direction layout and leaves comparable, near-zero risk.
- **Where direction layers do better:** without plan sharing, if companies need 15-20 m of vertical room, D2's 20 m gap between its layers cuts conflicts more (79-88 %) than the shared-out heights (42-66 %), whose gaps are narrower in places.
- The median Wing / Amazon cruise leg is about 6.8 km in both metros (the trip-length split).

## Limits
Layer heights chosen once (56 / 76 m, 56-80 m), not optimised; Zipline kept at 101 m. 5 seeds. Plans sized for position error only. Risk in still air, no in-flight avoidance. Within-company conflicts not counted. Direction layers in real aviation are used with en-route separation, not pre-flight holding, so this tests the idea in a delivery-drone setting only.
