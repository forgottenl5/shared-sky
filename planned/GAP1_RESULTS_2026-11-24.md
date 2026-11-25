# GAP1 results (24 Nov 2026): the gap between company heights against the plans' height allowance
Registration planned/GAP1_PREREG.md (fingerprint in planned/GAP1_PREREG.md.sha256; runner and analysis committed before any run). K1-K5 passed after deviation D1 (a pre-check lookup fix before any study run; logged in the registration). 140 runs, all completed. Table: planned/gap1_results_table.md. References: INTENT2 (M1 at N2 and N1, M1 risk), LAYOUT1 (M1 cut), CURVE1 (S1).

## Result in one line
**Amazon's waiting is a spacing problem, and it has a sharp edge: company layers stop clashing once they are more than twice the plan's height allowance apart.** With the widest even spacing the filed bands allow (Wing 46 m, Amazon 73.5 m, Zipline 101 m; gaps 27.5 m), plans of +-14 m in height (the 95 % rule at average GPS) still clash, and 19-20 % of all flights and 91-96 % of Amazon's are held. Shrinking the allowance by half a metre, to +-13.5 m, cuts that to 2.3-2.7 % of all flights and 12-21 % of Amazon's. The LAYOUT1 spacing (24 / 25 m gaps) needs +-11.5 m for the same result. The new spacing also leaves 190-270 times less residual collision risk than LAYOUT1's at average GPS. 6 of 7 predictions passed.

## Predictions
- **G1 PASS** at +-14 m, the new spacing (G1) holds as many Amazon flights as LAYOUT1's (M1): 96.0 % vs 96.0 % (Houston), 90.6 % vs 89.7 % (DFW).
- **G2 PASS** G1's Amazon held share at +-13.5 m: 21.1 % (Houston), 12.2 % (DFW), against 96.0 % / 90.6 % at +-14 m.
- **G3 PASS** M1's Amazon held share barely moves at +-13.5 m (95.5 % / 90.5 %), and falls to 21.1 % / 12.2 % at +-11.5 m (36.1 % / 22.0 % at +-12.5 m).
- **G4 PASS** at +-13.5 m, G1 holds 2.7 % / 2.3 % of all flights, against M1's 17.3 % / 18.4 %.
- **G5 FAIL** I predicted Amazon would still have at least 20 % held at +-13.5 m because of its descents at customers. Houston 21.1 % passed; DFW 12.2 % did not.
- **G6 PASS** residual risk at average GPS (plans +-10 m / +-14 m): G1 0.000018 (Houston) and 0.000033 (DFW) per 100,000 flight hours, against M1's 0.0049 / 0.0064.
- **G7 PASS** without plan sharing, G1 cuts planned conflicts against S1 by 82 % / 84 % at 30 m / 10 m (M1: 79 % / 84 %).

## Figures (Houston / DFW, share of flights held, windy hours)
| Plan height allowance | +-14 m (average GPS) | +-13.5 m | +-12.5 m | +-11.5 m | +-10 m | best-site GPS (+-5 m) |
|---|---|---|---|---|---|---|
| G1 (gaps 27.5 m), all flights | 19 % / 20 % | **2.7 % / 2.3 %** | 2.7 % / 2.3 % | 2.7 % / 2.3 % | 2.7 % / 2.3 % | 1.5 % / 1.2 % |
| G1, Amazon | 96 % / 91 % | **21 % / 12 %** | 21 % / 12 % | 21 % / 12 % | 21 % / 12 % | 15 % / 8 % |
| M1 (gaps 24 / 25 m), all flights | 18 % / 19 % | 17 % / 18 % | 4.2 % / 3.7 % | 2.7 % / 2.3 % | 2.7 % / 2.3 % | 1.7 % / 1.4 % |
| M1, Amazon | 96 % / 90 % | 96 % / 91 % | 36 % / 22 % | 21 % / 12 % | 21 % / 12 % | 17 % / 9 % |

## Reading
- **The edge is the plan's height allowance against half the gap.** Below it, the waits left are climbs and descents crossing other companies' heights; they do not shrink with smaller allowances (G1 is identical from +-13.5 m to +-10 m).
- **Inside the filed bands, three company layers can be at most 27.5 m apart** (Zipline fixed at 101 m, Wing's floor 46 m). So the plan height allowance must be under +-13.75 m. The project's average-GPS level gives +-14 m; only a small improvement in height navigation, or plans sized slightly tighter than this project's assumed error, is needed.
- **The edge is sharp because the modelled check is a hard yes / no on overlap.** A real service may round, add margins or size plans differently, so the exact half-metre should not be read literally; the rule (gap more than twice the allowance) is the finding.
- **G1 is now the best layout tested on every measure:** waiting (with allowances under +-13.75 m), residual risk (190-270 times below M1 at average GPS) and the cut without plan sharing (82-84 %).

## Limits
Wing flies at one height (46 m) in G1, so Wing-Wing meetings rise; the project does not count same-company conflicts (no site exclusion; INTENT1 D1). Plan sizes cover position error only; the smaller sizes are not tied to a measured GPS level. 5 seeds. Risk in still air, no in-flight avoidance. No operator has proposed these heights.
