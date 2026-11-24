# INTENT2 results (24 Nov 2026): plan volumes sized from navigation error under the standard's 95 % rule
Registration planned/INTENT2_PREREG.md (fingerprint in planned/INTENT2_PREREG.md.sha256; runner and analysis committed before any run). K1-K2 passed. 280 runs, all completed. Table: planned/intent2_results_table.md. No deviations.

## Result in one line
**With plans sized so each drone stays inside its own plan 95 % of the time (the rule ASTM F3548 sets, as quoted by NASA), giving each company its own height cuts held flights from about half to under a fifth, and the three height-sharing plans wait about the same (17-22 % at average GPS). They differ in risk: the wider-gap layout M1 leaves 6-13 times less residual collision risk than the shared-out heights A2, and flexible heights leave 3-7 times more than A2.** 3 of 6 predictions passed. INTENT1's suggestion that flexible heights are the safer bet is withdrawn: they are robust on waiting but not on risk.

## Predictions
- **J1 PASS** at N1 (best-site GPS, +-5 m plans) A2 holds 4.9 % (Houston) and 4.0 % (DFW).
- **J2 PASS** at N2 (average GPS, +-10 m sideways, +-14 m in height) M1 holds 17.6 % / 18.8 % against A2's 17.1 % / 18.0 %: its 4x advantage at the old +-10 m blocks is gone.
- **J3 FAIL** at N2B (N2 plus 40 m sideways) flexible heights hold 22.1 % / 20.6 %, more than A2 (18.6 % / 19.4 %).
- **J4 PASS** residual risk at average GPS falls from the old V2 check's 0.93 / 1.11 (A2) and 0.67 / 0.58 (M1) to 0.063 / 0.038 (A2) and 0.005 / 0.006 (M1) per 100,000 flight hours: plans sized to the error see the pairs the old 10 m blocks missed.
- **J5 FAIL** at N2B every plan is under 0.2 except flexible heights in Houston (0.26).
- **J6 FAIL** at N2 flexible heights leave 0.41 (Houston) and 0.18 (DFW), against A2's 0.063 / 0.038.

## Figures (Houston / DFW)
| plan sizes (95 % rule) | today's heights | shared out | wider gaps (M1) | flexible |
|---|---|---|---|---|
| Held, best-site GPS (+-5 m) | 17 % / 15 % | 4.9 % / 4.0 % | **1.7 % / 1.4 %** | 12 % / 10 % |
| Held, average GPS (+-10 m / +-14 m) | 51 % / 47 % | 17 % / 18 % | 18 % / 19 % | 20 % / 18 % |
| Held, plus 40 m sideways | 52 % / 48 % | 19 % / 19 % | 19 % / 20 % | 22 % / 21 % |
| Residual risk, average GPS (per 100,000 flight hours) | 0.064 / 0.043 | 0.063 / 0.038 | **0.005 / 0.006** | 0.41 / 0.18 |
| Residual risk, best-site GPS | 0.019 / 0.014 | 0.0006 / 0.0002 | ~0 | 0.020 / 0.015 |
Amazon is still the most held company (83-96 % at average GPS under every plan), except with best-site GPS under M1 (9-17 %).

## Reading
- **The headline survives realistic plan sizes, and gets stronger:** at average GPS, today's heights hold 47-51 % of flights and any of the height-sharing plans 17-22 %.
- **Waiting no longer separates the height-sharing plans; risk does.** M1's gaps (24-25 m) exceed two +-14 m plans' worth of overlap less often than A2's (10-20 m), so pairs that slip through are rarer and farther apart. Flexible heights pack flights into whatever 5 m step is free, which leaves many pairs just outside each other's plans; at average GPS error those pairs carry most of the risk.
- **Better navigation is the biggest lever:** best-site GPS (+-5 m plans) cuts held flights 3-12 times for every plan and residual risk by one to several orders of magnitude.
- **Correcting INTENT1:** INTENT1's volumes were guesses; with the standard's own sizing rule, flexible heights are not the safer choice. If operators' plans are much larger than the 95 % minimum (INTENT1's +-25 m case), flexible heights still wait least; their risk at those sizes was not measured.

## Limits
Plan sizes cover position error only (no flight technical error or wind), so they are the smallest the rule allows. 5 seeds. Risk in still air with RISK2's formula and base sizes; no in-flight avoidance. Within-company conflicts not counted.
